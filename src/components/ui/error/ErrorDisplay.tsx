import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '../button'
import { Alert, AlertDescription, AlertTitle } from '../alert'

interface ErrorDisplayProps {
  error: string | Error | null
  onRetry?: () => void
  title?: string
  variant?: 'default' | 'destructive'
}

export default function ErrorDisplay({
  error,
  onRetry,
  title = 'Error',
  variant = 'destructive'
}: ErrorDisplayProps) {
  if (!error) return null

  const errorMessage = error instanceof Error ? error.message : error

  return (
    <Alert variant={variant} className="my-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="flex items-center justify-between">
        <span>{errorMessage}</span>
        {onRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="ml-4"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        )}
      </AlertDescription>
    </Alert>
  )
}