import { CheckCircle2, ImageIcon, UploadIcon } from 'lucide-react';
import React, { useRef, useState } from 'react'
import { useOutletContext } from 'react-router';
import { REDIRECT_DELAY_MS, PROGRESS_INTERVAL_MS, PROGRESS_STEP } from './lib/constants';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/jpg'];

interface UploadProps {
  onComplete?: (base64: string) => void;
}

const Upload = ({ onComplete }: UploadProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [authRequired, setAuthRequired] = useState(false);
  const processingRef = useRef(false);

  const { isSignedIn, signIn } = useOutletContext<AuthContext>();

  const processFile = (file: File) => {
    if (!isSignedIn || processingRef.current) return;
    processingRef.current = true;

    setFile(file);
    setProgress(0);

    const reader = new FileReader();
    reader.onerror = () => {
      setFile(null);
      setProgress(0);
    }

    reader.onload = (e) => {
      const base64 = e.target?.result as string;

      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => {
              processingRef.current = false;
              if (onComplete) {
                onComplete(base64);
              }
            }, REDIRECT_DELAY_MS);
            return 100;
          }
          return Math.min(prev + PROGRESS_STEP, 100);
        });
      }, PROGRESS_INTERVAL_MS);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
    setAuthRequired(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (processingRef.current) return;

    if (!isSignedIn) {
      setAuthRequired(true);
      return;
    }

    setAuthRequired(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (ALLOWED_TYPES.includes(file.type)) {
        processFile(file);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isSignedIn || processingRef.current) return;
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  return (
    <div className="upload" onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
      {!file ? (
        <div className={`dropzone ${isDragging ? 'is-dragging' : ''} ${authRequired ? 'auth-required' : ''}`}>
          <input type="file" className="drop-input" accept=".jpg,.jpeg,.png" disabled={!isSignedIn} onChange={handleChange} />
          <div className="drop-content">
            <div className="drop-icon">
              <UploadIcon size={20} />
            </div>
            <p>
              {authRequired
                ? "Sign in required! Click here to sign in with Puter"
                : isSignedIn
                  ? "Click to upload or just drag and drop"
                  : "Sign in or sign up with Puter to upload"}
            </p>
            {authRequired && (
              <button
                className="sign-in-required"
                onClick={() => {
                  setAuthRequired(false);
                  signIn();
                }}
              >
                Sign In Now
              </button>
            )}
            <p className="help">Maximum file size 50 MB.</p>
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
              <div className="bar" style={{ width: `${progress}%` }} />
              <p className="status-text">
                {progress < 100 ? "Analyzing Floor Plan..." : "Redirecting..."}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Upload