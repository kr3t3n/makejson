import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProcessingStatusProps {
  files: Array<{
    id: string;
    name: string;
    status: 'processing' | 'complete' | 'error';
    result?: any;
    error?: string;
  }>;
  onSelectResult: (result: any) => void;
}

export default function ProcessingStatus({ files, onSelectResult }: ProcessingStatusProps) {
  if (files.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No files uploaded yet
      </div>
    );
  }

  return (
    <ScrollArea className="h-[200px]">
      <div className="space-y-2">
        {files.map((file) => (
          <div
            key={file.id}
            className="flex items-center justify-between p-2 rounded-lg border bg-card"
          >
            <div className="flex items-center space-x-2">
              {file.status === 'processing' && (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              )}
              {file.status === 'complete' && (
                <CheckCircle className="h-4 w-4 text-green-500" />
              )}
              {file.status === 'error' && (
                <XCircle className="h-4 w-4 text-destructive" />
              )}
              <span className={cn(
                'text-sm',
                file.status === 'error' && 'text-destructive'
              )}>
                {file.name}
              </span>
            </div>

            {file.status === 'complete' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSelectResult(file.result)}
              >
                View
              </Button>
            )}
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
