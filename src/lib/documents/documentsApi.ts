import { supabase } from '../supabase/client'
import type { Database } from '../supabase/types'
import { logAuditEvent } from '../audit/logAuditEvent'

export type DocumentCategoryRow = Database['public']['Tables']['document_categories']['Row']
export type DocumentRow = Database['public']['Tables']['documents']['Row']

const STORAGE_BUCKET = 'immigration-documents'
/** Signed URLs are generated on demand and expire quickly — never stored. */
const SIGNED_URL_TTL_SECONDS = 120

export async function listDocumentCategories(journeyTypeId: string): Promise<DocumentCategoryRow[]> {
  if (!supabase) return []
  const { data } = await supabase
    .from('document_categories')
    .select('*')
    .eq('journey_type_id', journeyTypeId)
    .order('sort_order')
  return data ?? []
}

export async function listDocuments(journeyId: string): Promise<DocumentRow[]> {
  if (!supabase) return []
  const { data } = await supabase
    .from('documents')
    .select('*')
    .eq('journey_id', journeyId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
  return data ?? []
}

/**
 * Uploads a file into the private bucket under `${userId}/...`, which is
 * required by the storage_documents_owner_insert policy (see
 * supabase/migrations/0006_documents.sql), then records it in
 * `documents`. Category is optional — the client can leave it
 * unassigned and categorize later.
 */
export async function uploadDocument(params: {
  journeyId: string
  userId: string
  file: File
  categoryId?: string | null
}): Promise<DocumentRow | null> {
  if (!supabase) return null

  const safeName = params.file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
  const storagePath = `${params.userId}/${params.journeyId}/${crypto.randomUUID()}-${safeName}`

  const { error: uploadError } = await supabase.storage.from(STORAGE_BUCKET).upload(storagePath, params.file, {
    contentType: params.file.type || 'application/octet-stream',
  })

  if (uploadError) {
    // eslint-disable-next-line no-console
    console.error('Failed to upload document', uploadError)
    return null
  }

  const { data, error: insertError } = await supabase
    .from('documents')
    .insert({
      journey_id: params.journeyId,
      category_id: params.categoryId ?? null,
      storage_bucket: STORAGE_BUCKET,
      storage_path: storagePath,
      original_filename: params.file.name,
      display_name: params.file.name,
      mime_type: params.file.type || 'application/octet-stream',
      file_size_bytes: params.file.size,
      created_by: params.userId,
    })
    .select()
    .single()

  if (insertError) {
    // eslint-disable-next-line no-console
    console.error('Failed to record uploaded document', insertError)
    await supabase.storage.from(STORAGE_BUCKET).remove([storagePath])
    return null
  }

  await logAuditEvent({
    eventType: 'document_uploaded',
    journeyId: params.journeyId,
    targetTable: 'documents',
    targetId: data.id,
    description: params.categoryId ? 'Document uploaded with category' : 'Document uploaded, uncategorized',
  })

  return data
}

export async function updateDocumentCategory(documentId: string, categoryId: string | null): Promise<void> {
  if (!supabase) return
  await supabase.from('documents').update({ category_id: categoryId }).eq('id', documentId)
}

export async function renameDocument(documentId: string, displayName: string): Promise<void> {
  if (!supabase) return
  await supabase.from('documents').update({ display_name: displayName }).eq('id', documentId)
}

export async function softDeleteDocument(documentId: string, journeyId: string): Promise<void> {
  if (!supabase) return
  await supabase.from('documents').update({ deleted_at: new Date().toISOString() }).eq('id', documentId)
  await logAuditEvent({ eventType: 'document_deleted', journeyId, targetTable: 'documents', targetId: documentId })
}

export async function restoreDocument(documentId: string): Promise<void> {
  if (!supabase) return
  await supabase.from('documents').update({ deleted_at: null }).eq('id', documentId)
}

export async function getSignedDownloadUrl(storagePath: string): Promise<string | null> {
  if (!supabase) return null
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .createSignedUrl(storagePath, SIGNED_URL_TTL_SECONDS)
  if (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to create signed URL', error)
    return null
  }
  return data.signedUrl
}
