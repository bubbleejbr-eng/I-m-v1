import { Container, Button } from '../../ui'

export function NotFoundPage() {
  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
      <h1 className="text-3xl font-semibold text-navy">Page Not Found</h1>
      <p className="mt-3 max-w-md text-navy/70">
        We couldn't find the page you were looking for.
      </p>
      <div className="mt-6">
        <Button to="/">Return Home</Button>
      </div>
    </Container>
  )
}
