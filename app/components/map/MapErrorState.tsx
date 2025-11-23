import { Button } from '@/app/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/app/components/ui/alert';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface MapErrorStateProps {
  error: string;
  onRetry: () => void;
}

export function MapErrorState({ error, onRetry }: MapErrorStateProps) {
  return (
    <div className="w-full h-screen flex items-center justify-center p-8">
      <div className="max-w-md w-full">
        <Alert variant="destructive" className="bg-red-900/20 border-red-500/50">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle className="text-lg font-semibold">Error al cargar datos</AlertTitle>
          <AlertDescription className="mt-2 space-y-4">
            <p>{error}</p>
            <Button
              onClick={onRetry}
              variant="outline"
              className="w-full bg-white/10 hover:bg-white/20 border-white/20 text-white"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Reintentar
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
