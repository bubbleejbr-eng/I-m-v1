import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../../lib/auth/AuthContext'
import { getMyActiveJourney, type JourneyRow } from '../../lib/onboarding/onboardingApi'
import {
  listDocumentCategories,
  listDocuments,
  uploadDocument,
  updateDocumentCategory,
  softDeleteDocument,
  getSignedDownloadUrl,
  type DocumentCategoryRow,
  type DocumentRow,
} from '../../lib/documents/documentsApi'
import { Card, Button, Badge } from '../../ui'

const REVIEW_STATUS_LABELS: Record<DocumentRow['review_status'], string> = {
  not_reviewed: 'Not Yet Reviewed',
  in_review: 'In Review',
  accepted: 'Accepted',
  needs_replacement: 'Needs Replacement',
}

function formatBytes(bytes: number | null): string {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function DocumentVaultPage() {
  const { user } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [loading, setLoading] = useState(true)
  const [journey, setJourney] = useState<JourneyRow | null>(null)
  const [categories, setCategories] = useState<DocumentCategoryRow[]>([])
  const [documents, setDocuments] = useState<DocumentRow[]>([])
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('')
  const [uploading, setUploading] = useState(false)

  async function refreshDocuments(journeyId: string) {
    setDocuments(await listDocuments(journeyId))
  }

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }
    void (async () => {
      const activeJourney = await getMyActiveJourney(user.id)
      setJourney(activeJourney)
      if (activeJourney) {
        const [cats] = await Promise.all([
          listDocumentCategories(activeJourney.journey_type_id),
          refreshDocuments(activeJourney.id),
        ])
        setCategories(cats)
      }
      setLoading(false)
    })()
  }, [user])

  async function handleFileSelected(files: FileList | null) {
    if (!files || files.length === 0 || !user || !journey) return
    setUploading(true)
    for (const file of Array.from(files)) {
      await uploadDocument({ journeyId: journey.id, userId: user.id, file, categoryId: selectedCategoryId || null })
    }
    setUploading(false)
    await refreshDocuments(journey.id)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function handleCategoryChange(documentId: string, categoryId: string) {
    await updateDocumentCategory(documentId, categoryId || null)
    if (journey) await refreshDocuments(journey.id)
  }

  async function handleDelete(documentId: string) {
    if (!journey) return
    await softDeleteDocument(documentId, journey.id)
    await refreshDocuments(journey.id)
  }

  async function handleDownload(storagePath: string) {
    const url = await getSignedDownloadUrl(storagePath)
    if (url) window.open(url, '_blank', 'noopener,noreferrer')
  }

  if (loading) return <p className="text-navy/60">Loading your documents…</p>

  if (!journey) {
    return (
      <Card className="mx-auto max-w-xl text-center">
        <p className="text-navy/70">
          You don't have an active immigration journey yet.{' '}
          <Button variant="ghost" size="sm" to="/onboarding/journey">
            Choose your journey
          </Button>
        </p>
      </Card>
    )
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-navy">Your Document Workspace</h1>
        <p className="mt-1 text-navy/60">
          Upload and organize the documents supporting your naturalization application. Files are stored privately
          and are never publicly accessible.
        </p>
      </div>

      <Card>
        <h2 className="text-lg font-semibold text-navy">Upload a Document</h2>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="mb-1 block text-sm font-medium text-navy">Category (optional)</label>
            <select
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              className="w-full rounded-lg border border-navy/20 px-3 py-2.5 text-navy focus:border-blue-accent"
            >
              <option value="">Choose later</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.category_label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png,.docx"
              onChange={(e) => void handleFileSelected(e.target.files)}
              disabled={uploading}
              className="block text-sm text-navy/70 file:mr-3 file:rounded-lg file:border-0 file:bg-navy file:px-4 file:py-2.5 file:text-sm file:font-semibold file:text-ivory hover:file:bg-navy-light disabled:opacity-50"
            />
          </div>
        </div>
        {uploading && <p className="mt-2 text-sm text-navy/50">Uploading…</p>}
        <p className="mt-3 text-xs text-navy/40">Accepted formats: PDF, JPG, PNG, DOCX.</p>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-navy">Your Documents</h2>
        {documents.length === 0 ? (
          <p className="mt-3 text-sm text-navy/60">No documents uploaded yet.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {documents.map((document) => (
              <div
                key={document.id}
                className="flex flex-col gap-3 rounded-xl border border-navy/10 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-navy">{document.display_name}</p>
                  <p className="text-xs text-navy/40">{formatBytes(document.file_size_bytes)}</p>
                </div>
                <select
                  value={document.category_id ?? ''}
                  onChange={(e) => void handleCategoryChange(document.id, e.target.value)}
                  className="rounded-lg border border-navy/20 px-2 py-1.5 text-sm text-navy"
                >
                  <option value="">Uncategorized</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.category_label}
                    </option>
                  ))}
                </select>
                <Badge tone={document.review_status === 'accepted' ? 'success' : 'neutral'}>
                  {REVIEW_STATUS_LABELS[document.review_status]}
                </Badge>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => void handleDownload(document.storage_path)}>
                    Download
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => void handleDelete(document.id)}>
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
