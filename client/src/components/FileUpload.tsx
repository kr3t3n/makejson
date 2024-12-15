import { useDropzone } from 'react-dropzone';
import { cn } from '@/lib/utils';
import { Upload } from 'lucide-react';

interface FileUploadProps {
  onFilesUploaded: (files: File[]) => void;
}

export default function FileUpload({ onFilesUploaded }: FileUploadProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onFilesUploaded,
    accept: {
      // Archives
      'application/zip': ['.zip'],
      // Document formats
      'text/plain': ['.txt'],
      'text/csv': ['.csv'],
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      // Code files
      'text/javascript': ['.js', '.jsx'],
      'text/typescript': ['.ts', '.tsx'],
      'text/css': ['.css'],
      'text/html': ['.html', '.htm'],
      'text/php': ['.php'],
      'text/x-sql': ['.sql'],
      // Additional code formats
      'application/json': ['.json'],
      'text/x-python': ['.py'],
      'text/markdown': ['.md', '.markdown'],
      'text/xml': ['.xml']
    },
    multiple: true
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
        isDragActive ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary'
      )}
    >
      <input {...getInputProps()} />
      <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
      <div className="space-y-2">
        <p className="text-lg font-medium">
          {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
        </p>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">
            Documents: PDF, DOCX, TXT, CSV, XLSX
          </p>
          <p className="text-xs text-muted-foreground">
            Code: JS/TS, HTML, CSS, PHP, SQL, Python, JSON, XML, MD
          </p>
          <p className="text-xs text-muted-foreground">
            Archives: ZIP
          </p>
        </div>
      </div>
    </div>
  );
}
