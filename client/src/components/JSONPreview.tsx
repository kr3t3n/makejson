import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface JSONPreviewProps {
  data: any;
}

export default function JSONPreview({ data }: JSONPreviewProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const formattedJSON = JSON.stringify(data, null, 2);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(formattedJSON);
    setCopied(true);
    toast({
      title: "Copied to clipboard",
      description: "JSON data has been copied to your clipboard"
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative h-full">
      <Button
        variant="outline"
        size="sm"
        className="absolute top-0 right-0 z-10"
        onClick={handleCopy}
      >
        <Copy className="h-4 w-4 mr-2" />
        {copied ? 'Copied!' : 'Copy'}
      </Button>
      
      <ScrollArea className="h-full w-full rounded-md border bg-muted">
        <pre className="p-4 text-sm">
          <code>{formattedJSON}</code>
        </pre>
      </ScrollArea>
    </div>
  );
}
