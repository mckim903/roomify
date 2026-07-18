import { CheckCircle2, ImageIcon, UploadIcon } from 'lucide-react';
import React from 'react'
import { useOutletContext } from "react-router";
import { REDIRECT_DELAY_MS, PROGRESS_INCREMENT, PROGRESS_INTERVAL_MS } from '../lib/constants';

interface UploadProps {
  onComplete: (data: string) => void;
}

const Upload = ({ onComplete }: UploadProps) => {
  const [file, setFile] = React.useState<File | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [progress, setProgress] = React.useState(0);

  const {isSignedIn} = useOutletContext<AuthState>();

  const processFile = (file: File) => {
    if (!isSignedIn) return;
    
    setFile(file);

    const reader = new FileReader();
    reader.onerror = () => {
      setFile(null);
      setProgress(0);
    };

    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      
      let currentProgress = 0;
      const interval = setInterval(() => {
        currentProgress += PROGRESS_INCREMENT;
        if (currentProgress >= 100) {
          currentProgress = 100;
          clearInterval(interval);
          setTimeout(() => {
            onComplete(base64);
          }, REDIRECT_DELAY_MS);
        }
        setProgress(currentProgress);
      }, PROGRESS_INTERVAL_MS);
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true);
    } else if (e.type === "dragleave") {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.size > 1024 * 1024 * 50) { // 50MB  
        console.warn("File size exceeds 5MB, skipping upload.");
        setFile(null);
        return;
      }

      const allowedTypes = ["image/jpeg", "image/png"];
      if (droppedFile && allowedTypes.includes(droppedFile.type)) {
        processFile(droppedFile);
      } else {
        setFile(null);
        return;
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="upload" 
      onDragEnter={handleDrag} 
      onDragLeave={handleDrag} 
      onDragOver={handleDrag} 
      onDrop={handleDrop}
    >
      {!file ? (
        <div className={`dropzone ${isDragging ? "dragging" : ""}`}>
          <input type="file" 
          className="drop-input" 
          accept=".jpg,.jpeg,.png" 
          disabled={!isSignedIn} 
          onChange={handleChange}
        />
          <div className="drop-content">
            <div className="drop-icon">
              <UploadIcon size={20} />
            </div>
            <p>
              {isSignedIn ? "Click to upload or drag and drop" : "Sign in or sign up with Puter to upload"}
            </p>
            <p className="help">Maximum file size: 50 MB.</p>
          </div>
        </div>
      ) : (
        <div className="upload-status">
          <div className="status-content">
            <div className="status-icon">
              {progress === 100 ? (
                <CheckCircle2 className="check" />
              ) : (
                <ImageIcon className="image" />
              )}
            </div>
            <h3>{file.name}</h3>
            <div className="progress">
              <div className="bar" style={{ width: `${progress}%` }}></div>
              <p className="status-text">{progress < 100 ? `Analyzing Floor Plan...` : "Redirecting..."}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Upload