import { Box, Download, RefreshCcw, Share2, X } from 'lucide-react';
import React, { useEffect, useRef } from 'react'
import { useLocation, useNavigate } from "react-router";
import Button from '~/components/ui/Button';
import { generate3DView } from '~/lib/ai.action';


const visualizerId = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { initialImage, initialRender, name } = location.state || {};

  const hasInitialGenerated = useRef(false);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [currentImage, setCurrentImage] = React.useState<string | null>(initialRender || null);

  const handleBack = () => navigate("/");

  const runGeneration = async () => {
    if (!initialImage) return;
    
    try {
      setIsProcessing(true);
      const result = await generate3DView({sourceImage: initialImage});

      if (result.renderedImage) {
        setCurrentImage(result.renderedImage);

        // update the project with the rendered image.
      }
    } catch (error) {
      console.error("Generation failed:", error);
    } finally {
      setIsProcessing(false);
    }
  }

  useEffect(() => {
    if (!initialImage || hasInitialGenerated.current) return;

    if (initialRender) {
      setCurrentImage(initialRender);
      hasInitialGenerated.current = true;
      return;
    }
    hasInitialGenerated.current = true;
    runGeneration();
  }, [initialImage, initialRender]);


  return (
    <div className="visualizer">
      <nav className="topbar">
        <div className="brand">
          <Box className="logo" />
          <span className="name">Roomify</span>
        </div>
        <Button variant="ghost" size="sm" className="exit" onClick={handleBack}>
          <X className="icon" />Exit Edit
        </Button>
      </nav>

      <section className="content">
        <div className="panel">
          <div className="panel-header">
            <div className="panel-meta">
              <p>Project</p>
              <h2>{"Untitled Project"}</h2>
              <p className="note">Created by You</p>
            </div>

            <div className="panel-actions">
              <Button 
                onClick={() => {}}
                size="sm" 
                className="export" 
                disabled={!currentImage} 
              >
                <Download className="w-4 h-4 mr-2" />Export
              </Button>
              <Button 
                onClick={() => {}}
                size="sm" 
                className="share"
              >
                <Share2 className="w-4 h-4 mr-2" />Share
              </Button>
            </div>
          </div>

          <div className={`render-area ${isProcessing} ? "is-processing" : ""`}>
            {currentImage ? (
              <img src={currentImage} alt="AI Rendered Image" className="render-img" />
            ) : (
              <div className="render-placeholder-content">
                {initialImage && (
                  <img src={initialImage} alt="Original" className="render-fallback" />
                )}
              </div>
            )}

            ${isProcessing && (
              <div className="render-overlay">
                <div className="rendering-card">
                  <RefreshCcw className="spinner" />
                  <span className="title">Rendering...</span>
                  <span className="subtitle">Generating your 3D visualization</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>

  )
}

export default visualizerId