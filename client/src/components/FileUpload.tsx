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
      'text/plain': ['.txt'],
      'text/csv': ['.csv'],
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/pdf': ['.pdf']
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
        <p className="text-sm text-muted-foreground">
          Support for TXT, CSV, PDF, and DOCX files
        </p>
      </div>
    </div>
  );
}
