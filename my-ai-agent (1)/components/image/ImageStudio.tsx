
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { generateImage, editImageWithGemini } from '../../services/geminiService.ts';
import type { ImageStyle, AspectRatio } from '../../types.ts';
import clsx from 'clsx';
import { useLanguage } from '../../contexts/LanguageContext.tsx';

interface InputImage {
  preview: string;
  file: File;
}

const ImageStudio: React.FC = () => {
  type Mode = 'text-to-image' | 'image-to-image';
  type MobileTab = 'create' | 'results';

  const { t } = useLanguage();
  const [mode, setMode] = useState<Mode>('text-to-image');
  const [prompt, setPrompt] = useState<string>('');
  const [style, setStyle] = useState<ImageStyle>('isometric');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [imageCount, setImageCount] = useState<number>(1);
  const [inputImages, setInputImages] = useState<InputImage[]>([]); 
  const [fullscreenImageIndex, setFullscreenImageIndex] = useState<number | null>(null);

  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [mobileTab, setMobileTab] = useState<MobileTab>('create');

  const MAX_REFERENCE_IMAGES = 4;

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
    const files = e.target.files;
    if (!files) return;

    const newImages: InputImage[] = [];
    for (let i = 0; i < files.length; i++) {
        if (inputImages.length + newImages.length >= MAX_REFERENCE_IMAGES) break;
        const file = files[i];
        const preview = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
        });
        newImages.push({ preview, file });
    }
    
    setInputImages(prev => [...prev, ...newImages]);
    // Reset input value to allow selecting same file again
    e.target.value = '';
  };

  const removeInputImage = (index: number) => {
    setInputImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) {
      setError('Please enter a prompt.');
      return;
    }
    if (mode === 'image-to-image' && inputImages.length === 0) {
      setError('Please upload at least one reference image.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setImageUrls([]);
    setMobileTab('results');

    try {
      if (mode === 'text-to-image') {
        const urls = await generateImage(prompt, style, aspectRatio, imageCount);
        if (urls.length > 0) {
          setImageUrls(urls);
        } else {
          setError('Failed to generate images. Please try again.');
        }
      } else if (mode === 'image-to-image') {
        const imagePayloads = await Promise.all(
            inputImages.map(async img => ({
                data: await blobToBase64(img.file),
                mimeType: img.file.type
            }))
        );
        
        const urls = await editImageWithGemini(prompt, imagePayloads, imageCount);
        if (urls.length > 0) {
            setImageUrls(urls);
        } else {
            setError('Failed to edit image. Please try again.');
        }
      }
    } catch (err) {
      setError((err as Error)?.message || 'An error occurred during generation.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDownload = (url: string, index: number) => {
    const link = document.createElement('a');
    link.href = url;
    const extension = 'png';
    link.download = `my-ai-image-${index + 1}_${Date.now()}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleNextImage = useCallback(() => {
    setFullscreenImageIndex(prevIndex => (prevIndex !== null && prevIndex < imageUrls.length - 1) ? prevIndex + 1 : prevIndex);
  }, [imageUrls.length]);

  const handlePrevImage = useCallback(() => {
    setFullscreenImageIndex(prevIndex => (prevIndex !== null && prevIndex > 0) ? prevIndex - 1 : prevIndex);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') handleNextImage();
      else if (e.key === 'ArrowLeft') handlePrevImage();
      else if (e.key === 'Escape') setFullscreenImageIndex(null);
    };
    if (fullscreenImageIndex !== null) {
        window.addEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'hidden'; 
    } else {
        document.body.style.overflow = 'unset';
    }
    return () => {
        window.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'unset';
    };
  }, [fullscreenImageIndex, handleNextImage, handlePrevImage]);

  const styles: ImageStyle[] = ['isometric', 'flat vector', 'photorealistic', 'cinematic'];
  const aspectRatios: AspectRatio[] = ['1:1', '16:9', '9:16', '4:3', '3:4'];
  const countOptions = [1, 2, 3, 4];

  const TabButton: React.FC<{ active: boolean, onClick: () => void, children: React.ReactNode }> = ({ active, onClick, children }) => (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 w-full ${
        active 
          ? 'bg-accent-start text-white shadow-md' 
          : 'text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-bg dark:hover:bg-dark-bg'
      }`}
    >
      {children}
    </button>
  );

  return (
    <>
      <div className="flex flex-col h-full overflow-hidden">
        {/* Mobile View Toggle Tabs */}
        <div className="lg:hidden flex p-1 bg-light-surface dark:bg-dark-surface rounded-xl mb-4 shrink-0 border border-light-border dark:border-dark-border shadow-sm">
            <button onClick={() => setMobileTab('create')} className={clsx("flex-1 py-2.5 text-sm font-bold rounded-lg transition-all", mobileTab === 'create' ? "bg-accent-start/10 text-accent-start" : "text-light-text-secondary")}>
                {t('image.tab.create')}
            </button>
            <button onClick={() => setMobileTab('results')} className={clsx("flex-1 py-2.5 text-sm font-bold rounded-lg transition-all", mobileTab === 'results' ? "bg-accent-start/10 text-accent-start" : "text-light-text-secondary")}>
                {t('image.tab.results')} {imageUrls.length > 0 && `(${imageUrls.length})`}
            </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 h-full overflow-hidden">
            {/* Left Config Panel */}
            <div className={clsx(
                "lg:w-1/3 bg-light-surface dark:bg-dark-surface p-6 rounded-lg flex flex-col border border-light-border dark:border-dark-border h-full overflow-y-auto custom-scrollbar min-h-0",
                mobileTab === 'create' ? 'flex' : 'hidden lg:flex'
            )}>
            <div className="mb-6 shrink-0">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-lg text-accent-start">Image Studio</h3>
                    <div className="px-2 py-0.5 rounded text-[10px] font-bold bg-accent-start/10 text-accent-start uppercase tracking-tighter border border-accent-start/20">Gemini 2.5</div>
                </div>
                <div className="flex items-center gap-2 p-1 rounded-lg bg-light-bg dark:bg-dark-bg">
                    <TabButton active={mode === 'text-to-image'} onClick={() => setMode('text-to-image')}>Text to Image</TabButton>
                    <TabButton active={mode === 'image-to-image'} onClick={() => setMode('image-to-image')}>Image Edit</TabButton>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col flex-grow">
                {mode === 'image-to-image' && (
                <div className="mb-4 shrink-0">
                    <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">Reference Images ({inputImages.length}/{MAX_REFERENCE_IMAGES})</label>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 mb-2">
                        {inputImages.map((img, index) => (
                            <div key={index} className="relative group aspect-square rounded-lg overflow-hidden border border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-bg">
                                <img src={img.preview} alt={`Input ${index + 1}`} className="w-full h-full object-cover" />
                                <button 
                                    type="button" 
                                    onClick={() => removeInputImage(index)} 
                                    className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 hover:bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                        ))}
                        
                        {inputImages.length < MAX_REFERENCE_IMAGES && (
                            <label className="aspect-square border-2 border-dashed border-light-border dark:border-dark-border rounded-lg text-center cursor-pointer hover:border-accent-start transition flex flex-col items-center justify-center bg-light-bg/30 dark:bg-dark-bg/30">
                                <ImageIcon className="h-6 w-6 text-light-text-secondary opacity-50"/>
                                <p className="text-[10px] text-light-text-secondary mt-1 font-bold uppercase">Add Photo</p>
                                <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} />
                            </label>
                        )}
                    </div>
                </div>
                )}

                <div className="mb-4 shrink-0">
                <label htmlFor="prompt" className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2">Prompt</label>
                <textarea
                    id="prompt"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder={mode === 'text-to-image' ? "A futuristic neon city with flying cars..." : "Combine these images or add something new..."}
                    className="w-full bg-light-bg dark:bg-dark-bg text-light-text-primary dark:text-dark-text-primary rounded-lg p-3 focus:ring-2 focus:ring-accent-start focus:outline-none transition border border-light-border dark:border-dark-border"
                    rows={4}
                />
                </div>

                <div className="mb-4 shrink-0">
                    <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2">Artistic Style</label>
                    <div className="grid grid-cols-2 gap-2">
                        {styles.map(s => (
                        <button type="button" key={s} onClick={() => setStyle(s)} className={`p-2 rounded-md text-sm transition-colors ${style === s ? 'bg-accent-start text-white shadow' : 'bg-light-bg dark:bg-dark-bg text-light-text-secondary hover:bg-light-border'}`}>
                            {s.charAt(0).toUpperCase() + s.slice(1)}
                        </button>
                        ))}
                    </div>
                </div>
                
                <div className="mb-4 shrink-0">
                    <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2">Number of Images</label>
                    <div className="flex gap-2">
                        {countOptions.map(num => (
                        <button type="button" key={num} onClick={() => setImageCount(num)} className={`flex-1 py-2 rounded-md text-sm font-bold transition-all ${imageCount === num ? 'bg-accent-start text-white' : 'bg-light-bg dark:bg-dark-bg text-light-text-secondary hover:bg-light-border'}`}>
                            {num}
                        </button>
                        ))}
                    </div>
                </div>

                <div className="mb-6 shrink-0">
                    <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2">Aspect Ratio</label>
                    <div className="grid grid-cols-5 gap-2">
                        {aspectRatios.map(ar => (
                        <button type="button" key={ar} onClick={() => setAspectRatio(ar)} className={`p-2 rounded-md text-xs transition-colors ${aspectRatio === ar ? 'bg-accent-start text-white shadow' : 'bg-light-bg dark:bg-dark-bg text-light-text-secondary hover:bg-light-border'}`}>
                            {ar}
                        </button>
                        ))}
                    </div>
                </div>

                <div className="mt-auto pt-4 pb-8 shrink-0">
                <button type="submit" disabled={isLoading} className="w-full bg-accent-start text-white font-bold py-3 px-4 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center shadow-lg shadow-accent-start/20">
                    {isLoading && <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>}
                    {isLoading ? `Processing...` : `Generate ${imageCount} ${imageCount > 1 ? 'Variations' : 'Image'}`}
                </button>
                </div>
            </form>
            </div>

            {/* Right Results Panel */}
            <div className={clsx(
                "lg:w-2/3 bg-light-surface dark:bg-dark-surface rounded-lg border border-light-border dark:border-dark-border relative flex flex-col h-full overflow-hidden min-h-0",
                mobileTab === 'results' ? 'flex' : 'hidden lg:flex'
            )}>
             <div className="flex-1 overflow-y-auto custom-scrollbar p-4 lg:p-6">
                {isLoading && (
                    <div className="h-full flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 border-4 border-accent-start border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="mt-6 text-light-text-secondary dark:text-dark-text-secondary font-bold text-lg animate-pulse tracking-tight">Gemini is creating your masterpiece...</p>
                    <p className="text-xs text-light-text-secondary mt-2 opacity-70">This may take a few seconds depending on the count</p>
                    </div>
                )}
                {error && <div className="h-full flex items-center justify-center text-red-400 text-center px-4 font-medium">{error}</div>}
                {!isLoading && imageUrls.length === 0 && !error && (
                    <div className="h-full flex flex-col items-center justify-center text-center text-light-text-secondary dark:text-dark-text-secondary opacity-30">
                    <ImageIcon className="h-24 w-24 mb-4" />
                    <p className="text-lg font-bold">Your gallery is currently empty</p>
                    <p className="text-sm">Describe something beautiful to get started.</p>
                    </div>
                )}
                {imageUrls.length > 0 && !isLoading && (
                    <div className={clsx(
                        "grid gap-6",
                        imageUrls.length === 1 ? "grid-cols-1 max-w-2xl mx-auto" : "grid-cols-1 md:grid-cols-2"
                    )}>
                        {imageUrls.map((url, index) => (
                        <div key={index} className="relative group rounded-3xl overflow-hidden border border-light-border dark:border-dark-border shadow-xl bg-white aspect-square flex items-center justify-center transition-all hover:scale-[1.02] cursor-pointer" onClick={() => setFullscreenImageIndex(index)}>
                            <img src={url} alt={`${prompt} result ${index + 1}`} className="w-full h-full object-cover" />
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent p-6 flex justify-between items-end opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <div className="flex-1 min-w-0 pr-4">
                                    <p className="text-white text-[10px] font-mono truncate uppercase tracking-widest opacity-70 mb-1">Variation {index + 1}</p>
                                    <p className="text-white text-sm font-bold truncate leading-tight">"{prompt}"</p>
                                </div>
                                <div className="flex gap-2 shrink-0">
                                    <button onClick={(e) => { e.stopPropagation(); setFullscreenImageIndex(index); }} className="p-3 bg-white/20 text-white rounded-2xl hover:bg-white/40 transition-all backdrop-blur-md" title="View Fullscreen"><EyeIcon className="h-5 w-5" /></button>
                                    <button onClick={(e) => { e.stopPropagation(); handleDownload(url, index); }} className="p-3 bg-accent-start text-white rounded-2xl hover:opacity-90 shadow-lg shadow-accent-start/20 transition-all active:scale-95" title="Download"><DownloadIcon className="h-5 w-5" /></button>
                                </div>
                            </div>
                        </div>
                        ))}
                    </div>
                )}
            </div>
            {imageUrls.length > 1 && !isLoading && (
                <div className="shrink-0 p-4 border-t border-light-border dark:border-dark-border flex justify-between items-center bg-light-surface dark:bg-dark-surface z-10">
                    <p className="text-xs text-light-text-secondary font-bold uppercase tracking-widest opacity-60">{imageUrls.length} variations ready</p>
                    <button 
                        onClick={() => imageUrls.forEach((url, i) => handleDownload(url, i))}
                        className="text-xs font-black text-accent-start hover:underline flex items-center gap-2 uppercase tracking-widest"
                    >
                        <DownloadIcon className="h-3.5 w-3.5" />
                        Download All
                    </button>
                </div>
            )}
            </div>
        </div>
      </div>
      
      {/* PERFECTED FULLSCREEN OVERLAY */}
      {fullscreenImageIndex !== null && (
        <div 
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/95 animate-fade-in backdrop-blur-3xl overflow-y-auto custom-scrollbar" 
          onClick={() => setFullscreenImageIndex(null)}
        >
          {/* TRULY FIXED TOP-RIGHT CLOSE BUTTON */}
          <button 
            className="fixed top-6 right-6 text-white bg-black/40 hover:bg-black/60 active:bg-black/70 rounded-full p-4 md:p-5 transition-all z-[1100] backdrop-blur-2xl border border-white/20 shadow-2xl group active:scale-90"
            onClick={(e) => { e.stopPropagation(); setFullscreenImageIndex(null); }}
            aria-label="Close View"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 md:h-8 md:w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>

          {/* MAIN CENTERED CONTENT AREA */}
          <div className="w-full h-full flex flex-col items-center justify-center py-12 px-4 md:px-10 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                
                {/* Desktop Navigation Arrows */}
                <div className="fixed inset-y-0 left-0 right-0 flex items-center justify-between px-4 md:px-8 pointer-events-none z-[1050]">
                    {fullscreenImageIndex > 0 && (
                        <button 
                            onClick={(e) => { e.stopPropagation(); handlePrevImage(); }} 
                            className="pointer-events-auto p-4 md:p-6 rounded-full bg-white/5 hover:bg-white/10 text-white transition-all backdrop-blur-md border border-white/10 shadow-2xl active:scale-95 hidden sm:flex"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 md:h-10 md:w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                        </button>
                    )}
                    <div className="flex-1" />
                    {fullscreenImageIndex < imageUrls.length - 1 && (
                        <button 
                            onClick={(e) => { e.stopPropagation(); handleNextImage(); }} 
                            className="pointer-events-auto p-4 md:p-6 rounded-full bg-white/5 hover:bg-white/10 text-white transition-all backdrop-blur-md border border-white/10 shadow-2xl active:scale-95 hidden sm:flex"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 md:h-10 md:w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                        </button>
                    )}
                </div>

                {/* CONTENT WRAPPER */}
                <div className="w-full max-w-3xl flex flex-col items-center gap-6 animate-scale-up">
                    
                    {/* IMAGE FRAME */}
                    <div className="relative bg-white/5 p-1 md:p-3 rounded-[1.5rem] md:rounded-[2.5rem] shadow-[0_30px_80px_rgba(0,0,0,0.8)] border border-white/10 w-full overflow-hidden group">
                        <img 
                          src={imageUrls[fullscreenImageIndex]} 
                          alt="Fullscreen result" 
                          className="w-full max-h-[60vh] object-contain rounded-[1.2rem] md:rounded-[2rem] shadow-2xl mx-auto" 
                        />
                        {/* Counter Badge */}
                        <div className="absolute top-4 left-4 md:top-6 md:left-6 bg-black/60 backdrop-blur-2xl rounded-full px-3 py-1.5 text-[9px] md:text-[11px] font-black text-white uppercase tracking-[0.2em] border border-white/10 shadow-2xl">
                          {fullscreenImageIndex + 1} / {imageUrls.length}
                        </div>
                    </div>

                    {/* DETAILS CARD */}
                    <div className="w-full bg-white/10 backdrop-blur-2xl rounded-[1.2rem] md:rounded-[1.8rem] p-4 md:p-6 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.4)] animate-fade-in-up">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                            <div className="flex-1 text-center md:text-left min-w-0">
                                <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-accent-start animate-pulse"></span>
                                    <p className="text-accent-start text-[8px] md:text-[10px] font-black tracking-[0.4em] uppercase opacity-70">Visual Prompt</p>
                                </div>
                                <h2 className="text-white font-bold text-lg md:text-2xl italic leading-tight tracking-tight break-words">
                                    "{prompt}"
                                </h2>
                            </div>
                            
                            <div className="shrink-0 w-full md:w-auto flex flex-col items-center gap-2">
                                <button 
                                  onClick={(e) => { e.stopPropagation(); handleDownload(imageUrls[fullscreenImageIndex!], fullscreenImageIndex!); }}
                                  className="w-full md:w-auto flex items-center justify-center gap-3 px-8 py-3 bg-accent-start text-white rounded-xl font-black text-xs uppercase tracking-[0.2em] hover:brightness-110 active:scale-95 transition-all shadow-[0_10px_20px_rgba(14,165,233,0.3)]"
                                >
                                    <DownloadIcon className="h-4 w-4 md:h-5 md:w-5" />
                                    Export HD
                                </button>
                                <p className="text-white/20 text-[8px] md:text-[9px] font-bold uppercase tracking-[0.4em]">Gemini AI Engine</p>
                            </div>
                        </div>

                        {/* THUMBNAIL VARIATIONS SCROLLBAR */}
                        {imageUrls.length > 1 && (
                            <div className="mt-6 pt-5 border-t border-white/10">
                                <div className="flex gap-3 overflow-x-auto px-1 pb-2 custom-scrollbar snap-x scroll-smooth justify-center items-center">
                                    {imageUrls.map((url, i) => (
                                        <button 
                                            key={i} 
                                            onClick={(e) => { e.stopPropagation(); setFullscreenImageIndex(i); }}
                                            className={clsx(
                                                "shrink-0 w-12 h-12 md:w-16 md:h-16 rounded-xl border-2 transition-all snap-center overflow-hidden active:scale-90",
                                                fullscreenImageIndex === i 
                                                    ? "border-accent-start scale-110 shadow-[0_0_20px_rgba(14,165,233,0.3)] ring-2 ring-accent-start/20" 
                                                    : "border-white/10 opacity-30 hover:opacity-70"
                                            )}
                                        >
                                            <img src={url} alt={`Variation ${i + 1}`} className="w-full h-full object-cover" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Branding Credits */}
                    <div className="flex flex-col items-center gap-2 opacity-30 hover:opacity-100 transition-opacity duration-500">
                        <div className="flex items-center gap-5 text-[8px] md:text-[9px] font-black tracking-[0.5em] uppercase text-white/60">
                            <span>My-Ai Vision</span>
                            <span className="w-1 h-1 rounded-full bg-white/20"></span>
                            <span>Powered by Gemini</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* Enhanced Animations */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scale-up {
          from { opacity: 0; transform: scale(0.97); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-scale-up {
          animation: scale-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </>
  );
};

const EyeIcon: React.FC<{ className?: string }> = ({ className = "h-5 w-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
);

const ImageIcon: React.FC<{ className?: string }> = ({ className = "h-16 w-16" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`${className} mx-auto`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
);

const DownloadIcon: React.FC<{ className?: string }> = ({ className = "h-5 w-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
);

export default ImageStudio;
