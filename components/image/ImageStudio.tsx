import React, { useState, useEffect, useCallback, useRef } from 'react';
import { generateImageWithGemini, editImageWithGemini } from '../../services/geminiService';
import type { ImageStyle, AspectRatio } from '../../types';
import ActionToolbar from '../shared/ActionToolbar';

const ImageStudio: React.FC = () => {
  type Mode = 'text-to-image' | 'image-to-image';
  type Quality = 'standard' | 'high';

  const [mode, setMode] = useState<Mode>('text-to-image');
  const [quality, setQuality] = useState<Quality>('standard');
  const [prompt, setPrompt] = useState<string>('');
  const [style, setStyle] = useState<ImageStyle>('photorealistic');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [numberOfImages, setNumberOfImages] = useState<number>(1);
  const [inputImage, setInputImage] = useState<string | null>(null); // base64 data URL for preview
  const [inputImageFile, setInputImageFile] = useState<File | null>(null); // file object for processing
  const [fullscreenImageIndex, setFullscreenImageIndex] = useState<number | null>(null);

  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const thumbnailRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    // This effect ensures the refs array is the correct size when images change
    thumbnailRefs.current = thumbnailRefs.current.slice(0, imageUrls.length);
  }, [imageUrls]);

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        resolve((reader.result as string).split(',')[1]);
      };
      reader.readAsDataURL(blob);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setInputImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setInputImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeInputImage = () => {
    setInputImage(null);
    setInputImageFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) {
      setError('Please enter a prompt.');
      return;
    }
    if (mode === 'image-to-image' && !inputImageFile) {
      setError('Please upload an image to edit.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setImageUrls([]);

    try {
      if (mode === 'text-to-image') {
        const urls = await generateImageWithGemini(prompt, style, aspectRatio, numberOfImages, quality);
        if (urls.length > 0) {
          setImageUrls(urls);
        } else {
          setError('Failed to generate images. Please try again.');
        }
      } else if (mode === 'image-to-image' && inputImageFile) {
        const base64Data = await blobToBase64(inputImageFile);
        const urls = await editImageWithGemini(prompt, base64Data, inputImageFile.type, numberOfImages);
        if (urls.length > 0) {
            setImageUrls(urls);
        } else {
            setError('Failed to edit image. Please try again.');
        }
      }
    } catch (err) {
      const errorMessage = (err as Error)?.message || 'An unknown error occurred.';
      if (errorMessage.includes('quota') || errorMessage.includes('RESOURCE_EXHAUSTED')) {
           setError('You have exceeded your API quota. Please check your plan and billing details on ai.google.dev.');
      } else if (errorMessage.includes('API key not valid')) {
           setError('Your API key is not valid. Please check your settings.');
      } else {
           setError('An error occurred while generating images. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDownload = (url: string, index: number) => {
    const link = document.createElement('a');
    link.href = url;
    const safePrompt = prompt.slice(0, 30).replace(/[^a-zA-Z0-9]/g, '_');
    link.download = `my-ai-agent_${safePrompt}_${index + 1}.jpeg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Slideshow navigation
  const handleNextImage = useCallback(() => {
    setFullscreenImageIndex(prevIndex => {
      if (prevIndex !== null && prevIndex < imageUrls.length - 1) {
        return prevIndex + 1;
      }
      return prevIndex;
    });
  }, [imageUrls.length]);

  const handlePrevImage = useCallback(() => {
    setFullscreenImageIndex(prevIndex => {
      if (prevIndex !== null && prevIndex > 0) {
        return prevIndex - 1;
      }
      return prevIndex;
    });
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        handleNextImage();
      } else if (e.key === 'ArrowLeft') {
        handlePrevImage();
      } else if (e.key === 'Escape') {
        setFullscreenImageIndex(null);
      }
    };

    if (fullscreenImageIndex !== null) {
      window.addEventListener('keydown', handleKeyDown);
      
      // Scroll to active thumbnail
      const activeThumbnail = thumbnailRefs.current[fullscreenImageIndex];
      if (activeThumbnail) {
          activeThumbnail.scrollIntoView({
              behavior: 'smooth',
              block: 'nearest',
              inline: 'center',
          });
      }
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [fullscreenImageIndex, handleNextImage, handlePrevImage]);

  const styles: ImageStyle[] = ['photorealistic', 'isometric', 'flat vector', 'cinematic'];
  const aspectRatios: AspectRatio[] = ['1:1', '16:9', '9:16', '4:3', '3:4'];
  const numImagesOptions = [1, 2, 3, 4];

  const TabButton: React.FC<{ active: boolean, onClick: () => void, children: React.ReactNode }> = ({ active, onClick, children }) => (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors w-full ${
        active 
          ? 'bg-gradient-to-r from-accent-start to-accent-end text-white shadow' 
          : 'text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-bg dark:hover:bg-dark-bg'
      }`}
    >
      {children}
    </button>
  );

  return (
    <>
      <div className="flex flex-col lg:flex-row gap-8 h-full">
        <div className="lg:w-1/3 bg-light-surface dark:bg-dark-surface p-6 rounded-lg flex flex-col border border-light-border dark:border-dark-border">
          <div className="flex items-center gap-2 mb-4 p-1 rounded-lg bg-light-bg dark:bg-dark-bg">
            <TabButton active={mode === 'text-to-image'} onClick={() => setMode('text-to-image')}>Text to Image</TabButton>
            <TabButton active={mode === 'image-to-image'} onClick={() => setMode('image-to-image')}>Image to Image</TabButton>
          </div>
          
          {mode === 'text-to-image' && (
            <div className="mb-4">
                <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2">Quality</label>
                <div className="flex items-center gap-2 p-1 rounded-lg bg-light-bg dark:bg-dark-bg">
                    <TabButton active={quality === 'standard'} onClick={() => setQuality('standard')}>
                    Standard
                    </TabButton>
                    <TabButton active={quality === 'high'} onClick={() => setQuality('high')}>
                    High (Imagen)
                    </TabButton>
                </div>
                <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-1">
                    Standard quality is faster. High quality uses the more powerful Imagen model and may have different usage quotas.
                </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col flex-grow">
            {mode === 'image-to-image' && (
              <div className="mb-4">
                <label htmlFor="image-upload" className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2">Source Image</label>
                {inputImage ? (
                  <div className="relative group">
                    <img src={inputImage} alt="Input preview" className="w-full rounded-lg object-contain max-h-48" />
                    <button type="button" onClick={removeInputImage} className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Remove image">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                ) : (
                  <label htmlFor="image-upload" className="w-full p-8 border-2 border-dashed border-light-border dark:border-dark-border rounded-lg text-center cursor-pointer hover:border-accent-start transition flex flex-col items-center justify-center">
                      <ImageIcon className="h-10 w-10 text-light-text-secondary dark:text-dark-text-secondary"/>
                      <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mt-2">Click to upload or drag & drop</p>
                      <input id="image-upload" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                  </label>
                )}
              </div>
            )}

            <div className="mb-4">
              <label htmlFor="prompt" className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2">Prompt</label>
              <textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={mode === 'text-to-image' ? "e.g., A robot holding a red skateboard." : "e.g., Add a llama next to the robot."}
                className="w-full bg-light-bg dark:bg-dark-bg text-light-text-primary dark:text-dark-text-primary rounded-lg p-3 focus:ring-2 focus:ring-accent-start focus:outline-none transition border border-light-border dark:border-dark-border"
                rows={mode === 'text-to-image' ? 4 : 2}
              />
              {mode === 'text-to-image' && <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-1">Tip: include 3 style words (e.g., cinematic, vibrant, film grain).</p>}
            </div>

            {mode === 'text-to-image' && (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2">Style</label>
                  <div className="grid grid-cols-2 gap-2">
                    {styles.map(s => (
                      <button type="button" key={s} onClick={() => setStyle(s)} className={`p-2 rounded-md text-sm transition-colors ${style === s ? 'bg-gradient-to-r from-accent-start to-accent-end text-white shadow' : 'bg-light-bg dark:bg-dark-bg text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-border dark:hover:bg-dark-border'}`}>
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2">Aspect Ratio</label>
                  <div className="grid grid-cols-5 gap-2">
                    {aspectRatios.map(ar => (
                      <button type="button" key={ar} onClick={() => setAspectRatio(ar)} className={`p-2 rounded-md text-sm transition-colors ${aspectRatio === ar ? 'bg-gradient-to-r from-accent-start to-accent-end text-white shadow' : 'bg-light-bg dark:bg-dark-bg text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-border dark:hover:bg-dark-border'}`}>
                        {ar}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2">Number of Images</label>
              <div className="grid grid-cols-4 gap-2">
                {numImagesOptions.map(num => (
                  <button type="button" key={num} onClick={() => setNumberOfImages(num)} className={`p-2 rounded-md text-sm transition-colors ${numberOfImages === num ? 'bg-gradient-to-r from-accent-start to-accent-end text-white shadow' : 'bg-light-bg dark:bg-dark-bg text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-border dark:hover:bg-dark-border'}`}>
                    {num}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-auto">
              <button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-accent-start to-accent-end text-white font-bold py-3 px-4 rounded-lg hover:opacity-90 transition-opacity disabled:from-light-text-secondary disabled:to-light-text-secondary dark:disabled:from-dark-text-secondary dark:disabled:to-dark-text-secondary disabled:cursor-not-allowed flex items-center justify-center">
                {isLoading && <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>}
                {isLoading ? 'Generating...' : (mode === 'text-to-image' ? 'Generate' : 'Edit Image')}
              </button>
            </div>
          </form>
        </div>

        <div className="lg:w-2/3 bg-light-surface dark:bg-dark-surface p-6 rounded-lg flex items-center justify-center min-h-[300px] lg:min-h-0 overflow-auto border border-light-border dark:border-dark-border">
          {isLoading && (
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-accent-start border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="mt-4 text-light-text-secondary dark:text-dark-text-secondary">Generating your masterpiece...</p>
            </div>
          )}
          {error && <p className="text-red-400">{error}</p>}
          {!isLoading && imageUrls.length === 0 && !error && (
            <div className="text-center text-light-text-secondary dark:text-dark-text-secondary">
              <ImageIcon className="h-16 w-16" />
              <p className="mt-2">Your generated image will appear here.</p>
            </div>
          )}
          {imageUrls.length > 0 && (
              <div className={`grid gap-4 w-full h-full ${imageUrls.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                  {imageUrls.map((url, index) => (
                  <div key={index} className="relative group rounded-lg overflow-hidden border border-light-border dark:border-dark-border">
                      <img src={url} alt={`${prompt} - ${index + 1}`} className="w-full h-full object-contain" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4 md:justify-between">
                        <div className="self-end hidden md:block">
                            <ActionToolbar contentToCopy={prompt} />
                        </div>
                        <div className="flex flex-col gap-3">
                            <div className="md:hidden self-center">
                                <ActionToolbar contentToCopy={prompt} />
                            </div>
                            <div className="flex flex-col sm:flex-row w-full max-w-xs sm:max-w-none justify-center items-center gap-3 self-center">
                               <button onClick={() => setFullscreenImageIndex(index)} className="w-full sm:w-auto flex justify-center items-center gap-2 bg-white/20 backdrop-blur-sm text-white font-semibold py-2 px-4 rounded-lg hover:bg-white/30 transition-colors" title="View image">
                                    <EyeIcon />
                                    <span>View</span>
                                </button>
                                <button onClick={() => handleDownload(url, index)} className="w-full sm:w-auto flex justify-center items-center gap-2 bg-gradient-to-r from-accent-start to-accent-end text-white font-semibold py-2 px-4 rounded-lg hover:opacity-90 transition-opacity" title="Download image">
                                    <DownloadIcon />
                                    <span>Download</span>
                                </button>
                            </div>
                        </div>
                      </div>
                  </div>
                  ))}
              </div>
          )}
        </div>
      </div>
      {fullscreenImageIndex !== null && (
        <div 
          className="fixed inset-0 z-50 flex flex-col items-center bg-black/80 animate-fade-in-up p-4"
          onClick={() => setFullscreenImageIndex(null)}
          role="dialog"
          aria-modal="true"
        >
          <button 
              onClick={() => setFullscreenImageIndex(null)}
              className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2 hover:bg-black/70 transition-colors z-20"
              aria-label="Close fullscreen view"
          >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
          </button>
          
          <div className="relative flex-1 flex items-center justify-center w-full min-h-0" onClick={(e) => e.stopPropagation()}>
              <img 
                  src={imageUrls[fullscreenImageIndex]} 
                  alt="Fullscreen view" 
                  className="max-w-full max-h-full object-contain rounded-lg shadow-xl"
              />
              {imageUrls.length > 1 && fullscreenImageIndex > 0 && (
                  <button
                      onClick={(e) => { e.stopPropagation(); handlePrevImage(); }}
                      className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 text-white bg-black/50 rounded-full p-2 hover:bg-black/70 transition-colors"
                      aria-label="Previous image"
                  >
                      <ChevronLeftIcon />
                  </button>
              )}
              {imageUrls.length > 1 && fullscreenImageIndex < imageUrls.length - 1 && (
                  <button
                      onClick={(e) => { e.stopPropagation(); handleNextImage(); }}
                      className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 text-white bg-black/50 rounded-full p-2 hover:bg-black/70 transition-colors"
                      aria-label="Next image"
                  >
                      <ChevronRightIcon />
                  </button>
              )}
          </div>

          {imageUrls.length > 1 && (
            <div className="flex-shrink-0 w-full max-w-5xl mt-4" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-center p-2 space-x-3 overflow-x-auto">
                    {imageUrls.map((url, index) => (
                        <button
                            key={index}
                            // Fix: A ref callback function should not return a value. Using a block statement ensures an implicit `undefined` return.
                            ref={el => { thumbnailRefs.current[index] = el; }}
                            onClick={(e) => {
                                e.stopPropagation();
                                setFullscreenImageIndex(index);
                            }}
                            className={`rounded-lg overflow-hidden h-16 sm:h-20 aspect-square flex-shrink-0 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black/50 focus:ring-accent-start ${
                                fullscreenImageIndex === index
                                ? 'border-2 border-accent-start scale-105'
                                : 'opacity-60 hover:opacity-100 border-2 border-transparent'
                            }`}
                        >
                            <img src={url} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                        </button>
                    ))}
                </div>
            </div>
        )}
        </div>
      )}
    </>
  );
};

const EyeIcon: React.FC<{ className?: string }> = ({ className = "h-5 w-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
);

const ImageIcon: React.FC<{ className?: string }> = ({ className = "h-16 w-16" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`${className} mx-auto`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);

const DownloadIcon: React.FC<{ className?: string }> = ({ className = "h-5 w-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);

const ChevronLeftIcon: React.FC<{ className?: string }> = ({ className = "h-8 w-8" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
);

const ChevronRightIcon: React.FC<{ className?: string }> = ({ className = "h-8 w-8" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
);

export default ImageStudio;