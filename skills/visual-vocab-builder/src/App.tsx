/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Loader2, X, Volume2, Sparkles, Share2, Download, Play, Pause } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { cn } from './lib/utils';
import { VocabItem, AnalysisResult } from './types';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default function App() {
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPlayingStory, setIsPlayingStory] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Cleanup audio on unmount or image change
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result as string);
        setResults(null);
        setError(null);
        setAudioUrl(null);
        setIsPlayingStory(false);
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
        }
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: false
  } as any);

  const [overlayBounds, setOverlayBounds] = useState({ width: 0, height: 0, top: 0, left: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!imageRef.current || !containerRef.current) return;

    const updateBounds = () => {
      const img = imageRef.current;
      if (!img) return;

      const r = img.getBoundingClientRect();
      const naturalAspect = img.naturalWidth / img.naturalHeight;
      const displayAspect = r.width / r.height;

      let actualWidth, actualHeight, actualTop, actualLeft;

      if (displayAspect > naturalAspect) {
        actualHeight = r.height;
        actualWidth = actualHeight * naturalAspect;
        actualTop = 0;
        actualLeft = (r.width - actualWidth) / 2;
      } else {
        actualWidth = r.width;
        actualHeight = actualWidth / naturalAspect;
        actualLeft = 0;
        actualTop = (r.height - actualHeight) / 2;
      }

      setOverlayBounds({
        width: actualWidth,
        height: actualHeight,
        top: actualTop,
        left: actualLeft
      });
    };

    const observer = new ResizeObserver(updateBounds);
    observer.observe(imageRef.current);
    window.addEventListener('resize', updateBounds);
    updateBounds();

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateBounds);
    };
  }, [results, image]);

  const analyzeImage = async () => {
    if (!image) return;

    setIsAnalyzing(true);
    setError(null);
    setResults(null);

    try {
      const base64Data = image.split(',')[1];
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          {
            parts: [
              {
                inlineData: {
                  mimeType: "image/jpeg",
                  data: base64Data,
                },
              },
              {
                text: `Analyze this image with the soul of a poet and a linguist. 
                1. Identify 6-8 evocative objects or abstract elements. Spread them out to avoid overlap.
                2. For each, provide: English word, IPA phonetic transcription, part of speech (n., v., adj.), Chinese translation, and a short example.
                3. Provide bounding box coordinates (ymin, xmin, ymax, xmax) in normalized units (0-1000).
                4. Write a short, high-end literary description of the scene in both English and Chinese.
                5. Give the scene a poetic title.
                Return as a JSON object matching the AnalysisResult schema.`,
              },
            ],
          },
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              literaryDescription: {
                type: Type.OBJECT,
                properties: {
                  english: { type: Type.STRING },
                  chinese: { type: Type.STRING },
                },
                required: ["english", "chinese"],
              },
              items: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    english: { type: Type.STRING },
                    phonetic: { type: Type.STRING },
                    partOfSpeech: { type: Type.STRING },
                    chinese: { type: Type.STRING },
                    example: { type: Type.STRING },
                    boundingBox: {
                      type: Type.OBJECT,
                      properties: {
                        ymin: { type: Type.NUMBER },
                        xmin: { type: Type.NUMBER },
                        ymax: { type: Type.NUMBER },
                        xmax: { type: Type.NUMBER },
                      },
                      required: ["ymin", "xmin", "ymax", "xmax"],
                    },
                  },
                  required: ["english", "phonetic", "partOfSpeech", "chinese", "example", "boundingBox"],
                },
              },
            },
            required: ["items", "literaryDescription", "title"],
          },
        },
      });

      const data = JSON.parse(response.text || '{}') as AnalysisResult;
      setResults(data);
    } catch (err) {
      console.error("Analysis failed:", err);
      setError("The muse is silent. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  const [isTogglingAudio, setIsTogglingAudio] = useState(false);

  const withRetry = async <T,>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> => {
    try {
      return await fn();
    } catch (err) {
      if (retries <= 0) throw err;
      await new Promise(resolve => setTimeout(resolve, delay));
      return withRetry(fn, retries - 1, delay * 2);
    }
  };

  const createWavUrl = (base64Data: string) => {
    const binaryString = window.atob(base64Data);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Add WAV header for 24kHz mono 16-bit PCM
    const wavHeader = new ArrayBuffer(44);
    const view = new DataView(wavHeader);
    
    view.setUint32(0, 0x52494646, false); // "RIFF"
    view.setUint32(4, 36 + len, true);
    view.setUint32(8, 0x57415645, false); // "WAVE"
    view.setUint32(12, 0x666d7420, false); // "fmt "
    view.setUint16(16, 16, true);
    view.setUint16(20, 1, true); // PCM
    view.setUint16(22, 1, true); // Mono
    view.setUint32(24, 24000, true); // 24kHz
    view.setUint32(28, 24000 * 2, true); // Byte rate
    view.setUint16(32, 2, true); // Block align
    view.setUint16(34, 16, true); // 16-bit
    view.setUint32(36, 0x64617461, false); // "data"
    view.setUint32(40, len, true);

    const blob = new Blob([wavHeader, bytes], { type: 'audio/wav' });
    return URL.createObjectURL(blob);
  };

  const playWordAudio = async (word: string) => {
    try {
      const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await withRetry(() => genAI.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: `Pronounce clearly: ${word}` }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Puck' },
            },
          },
        },
      }));

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        const url = createWavUrl(base64Audio);
        const audio = new Audio(url);
        try {
          await audio.play();
        } catch (e: any) {
          if (e.name !== 'AbortError') {
            console.error("Word playback failed:", e);
          }
        }
        // Clean up URL after playback
        audio.onended = () => URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error("Word TTS failed:", err);
      speak(word); // Fallback to native
    }
  };

  const playStoryAudio = async () => {
    if (!results || isAudioLoading || isTogglingAudio) return;
    
    setIsTogglingAudio(true);
    try {
      if (audioUrl && audioRef.current) {
        if (isPlayingStory) {
          audioRef.current.pause();
          setIsPlayingStory(false);
        } else {
          try {
            await audioRef.current.play();
            setIsPlayingStory(true);
          } catch (e: any) {
            if (e.name !== 'AbortError') {
              console.error("Playback failed:", e);
            }
            setIsPlayingStory(false);
          }
        }
        return;
      }

      setIsAudioLoading(true);
      const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await withRetry(() => genAI.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ 
          parts: [{ 
            text: `Read this literary description with a gentle, magnetic, young, and whispering male voice. Speak slowly and with deep emotion: ${results.literaryDescription.english}` 
          }] 
        }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Zephyr' },
            },
          },
        },
      }));

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        const url = createWavUrl(base64Audio);
        setAudioUrl(url);
        const audio = new Audio(url);
        audioRef.current = audio;
        
        audio.onended = () => {
          setIsPlayingStory(false);
        };

        try {
          await audio.play();
          setIsPlayingStory(true);
        } catch (e: any) {
          if (e.name !== 'AbortError') {
            console.error("Initial playback failed:", e);
          }
          setIsPlayingStory(false);
        }
      }
    } catch (err) {
      console.error("TTS failed:", err);
      // Fallback to native TTS if AI TTS fails
      if (results) {
        speak(results.literaryDescription.english);
        setIsPlayingStory(true);
        // We don't have an audioRef for native TTS, so we just simulate it
        setTimeout(() => setIsPlayingStory(false), results.literaryDescription.english.length * 100);
      } else {
        setError("The voice is lost in the wind. Please try again.");
      }
    } finally {
      setIsAudioLoading(false);
      setIsTogglingAudio(false);
    }
  };

  // Improved collision-avoidance algorithm for label positioning
  const positionedItems = useMemo(() => {
    if (!results) return [];
    
    const placed: { x: number, y: number, w: number, h: number }[] = [];

    return results.items.map((item, idx) => {
      const centerX = (item.boundingBox.xmin + item.boundingBox.xmax) / 20;
      const centerY = (item.boundingBox.ymin + item.boundingBox.ymax) / 20;
      
      // Estimate label width based on word length for more accurate collision detection
      const labelW = Math.max(18, Math.min(35, item.english.length * 1.8 + item.chinese.length * 2.5));
      const labelH = 12;
      
      let bestX = centerX;
      let bestY = centerY;
      let found = false;

      // Try increasing distances and various angles to find a clear spot
      const distances = [20, 30, 40, 50];
      const angles = Array.from({ length: 24 }, (_, i) => (i * Math.PI * 2) / 24);
      
      angles.sort(() => Math.random() - 0.5);

      for (const dist of distances) {
        for (const angle of angles) {
          const testX = Math.max(labelW/2 + 2, Math.min(98 - labelW/2, centerX + Math.cos(angle) * dist));
          const testY = Math.max(labelH/2 + 2, Math.min(98 - labelH/2, centerY + Math.sin(angle) * dist));
          
          const collision = placed.some(p => {
            const dx = Math.abs(p.x - testX);
            const dy = Math.abs(p.y - testY);
            return dx < (p.w + labelW) * 0.45 && dy < (p.h + labelH) * 0.45;
          });
          
          if (!collision) {
            bestX = testX;
            bestY = testY;
            found = true;
            break;
          }
        }
        if (found) break;
      }

      placed.push({ x: bestX, y: bestY, w: labelW, h: labelH });
      
      const distFromCenter = Math.sqrt(Math.pow(bestX - centerX, 2) + Math.pow(bestY - centerY, 2));
      
      return {
        ...item,
        x: bestX,
        y: bestY,
        centerX,
        centerY,
        isRight: bestX > centerX,
        showIndicator: (idx % 3 === 0) || distFromCenter > 35
      };
    });
  }, [results]);

  return (
    <div className="min-h-screen bg-[#fdfdfb] font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-zinc-100 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 text-white">
              <Sparkles className="h-5 w-5" />
            </div>
            <span className="font-display text-xl font-bold tracking-tight">Aesthetic Vocab</span>
          </div>
          <div className="flex items-center gap-4">
            <button className="rounded-full p-2 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-900">
              <Share2 className="h-5 w-5" />
            </button>
            <button className="rounded-full p-2 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-900">
              <Download className="h-5 w-5" />
            </button>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-4xl px-6 py-12">
        <div className="space-y-16">
          {!image ? (
            <div
              {...getRootProps()}
              className={cn(
                "group relative flex aspect-[4/5] w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-[2rem] border border-zinc-200 bg-white transition-all duration-500 hover:border-zinc-400 hover:shadow-2xl",
                isDragActive && "border-zinc-900 bg-zinc-50"
              )}
            >
              <input {...getInputProps()} />
              <div className="z-10 flex flex-col items-center gap-6 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-zinc-50 text-zinc-300 transition-transform duration-500 group-hover:scale-110 group-hover:bg-zinc-900 group-hover:text-white">
                  <Upload className="h-8 w-8" />
                </div>
                <div className="space-y-2">
                  <p className="font-display text-2xl font-medium text-zinc-900">Begin your visual journey</p>
                  <p className="text-zinc-400">Upload an image to weave words into art</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-12">
              <div className="relative mx-auto max-w-2xl overflow-hidden rounded-[2rem] bg-white shadow-2xl shadow-zinc-200/50">
                <div ref={containerRef} className="relative flex items-center justify-center bg-zinc-100 min-h-[400px]">
                  <img
                    ref={imageRef}
                    src={image}
                    alt="Canvas"
                    onLoad={() => {
                      // Trigger a bounds update when image loads
                      window.dispatchEvent(new Event('resize'));
                    }}
                    className="max-h-[85vh] w-full object-contain"
                    referrerPolicy="no-referrer"
                  />
                  
                  {results && (
                    <div 
                      className="absolute pointer-events-none"
                      style={{
                        width: overlayBounds.width,
                        height: overlayBounds.height,
                        top: overlayBounds.top,
                        left: overlayBounds.left,
                      }}
                    >
                      <AnimatePresence>
                        {positionedItems.map((item, idx) => {
                          const { x, y, centerX, centerY, isRight, showIndicator } = item;
                          
                          // Organic hand-drawn circle path
                          const circlePath = "M50,15 C70,12 88,32 85,52 C82,72 68,88 48,85 C28,82 12,65 15,45 C18,25 35,12 55,14";

                          return (
                            <motion.div
                              key={idx}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: idx * 0.08 }}
                              className="absolute pointer-events-none"
                              style={{
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                zIndex: 100 - idx
                              }}
                            >
                              {/* Indicator Layer */}
                              {showIndicator && (
                                <svg 
                                  className="absolute inset-0 h-full w-full text-white/80 drop-shadow-md"
                                  viewBox="0 0 100 100"
                                  preserveAspectRatio="none"
                                >
                                  {/* Hand-drawn Circle at object center */}
                                  <g transform={`translate(${centerX - 3}, ${centerY - 3}) scale(0.06)`}>
                                    <motion.path
                                      initial={{ pathLength: 0 }}
                                      animate={{ pathLength: 1 }}
                                      transition={{ duration: 0.8, delay: idx * 0.12 }}
                                      d={circlePath}
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="4"
                                      strokeLinecap="round"
                                    />
                                  </g>

                                  {/* Sketchy Arrow connecting label to circle */}
                                  <motion.path
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: 1 }}
                                    transition={{ duration: 0.6, delay: idx * 0.15 + 0.4 }}
                                    d={`M${x},${y} Q${(x + centerX) / 2 + (isRight ? -5 : 5)},${(y + centerY) / 2 - 5} ${centerX},${centerY}`}
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="0.4"
                                    strokeDasharray="1 1"
                                    strokeLinecap="round"
                                  />
                                </svg>
                              )}

                              {/* The Label */}
                              <div 
                                onClick={() => playWordAudio(item.english)}
                                className={cn(
                                  "absolute pointer-events-auto flex flex-col font-hand text-white transition-transform hover:scale-105 cursor-pointer",
                                  isRight ? "items-start" : "items-end"
                                )} style={{
                                  left: `${x}%`,
                                  top: `${y}%`,
                                  transform: `translate(${isRight ? '-10%' : '-90%'}, -50%)`,
                                  textShadow: '0 2px 4px rgba(0,0,0,0.8), 0 0 2px rgba(0,0,0,1)'
                                }}>
                                <div className="flex flex-col leading-[0.85]">
                                  <span className="text-[clamp(1.4rem,3.5vw,2.2rem)] font-bold whitespace-nowrap tracking-tight">{item.english}</span>
                                  <div className={cn(
                                    "flex items-baseline gap-1 mt-1",
                                    isRight ? "flex-row" : "flex-row-reverse"
                                  )}>
                                    <span className="text-[clamp(0.6rem,1.2vw,0.75rem)] opacity-70 italic font-sans font-bold">{item.partOfSpeech}</span>
                                    <span className="text-[clamp(0.9rem,2.2vw,1.3rem)] whitespace-nowrap font-medium">{item.chinese}</span>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => { setImage(null); setResults(null); }}
                  className="absolute top-6 right-6 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition-all hover:bg-black/60 z-50"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {!results && !isAnalyzing && (
                <div className="flex justify-center">
                  <button
                    onClick={analyzeImage}
                    className="group relative flex items-center gap-3 overflow-hidden rounded-full bg-zinc-900 px-10 py-5 text-lg font-medium text-white transition-all hover:scale-105 hover:shadow-2xl active:scale-95"
                  >
                    <Sparkles className="h-5 w-5 transition-transform group-hover:rotate-12" />
                    <span>Analyze the Scene</span>
                  </button>
                </div>
              )}

              {isAnalyzing && (
                <div className="flex flex-col items-center gap-6 py-12">
                  <Loader2 className="h-12 w-12 animate-spin text-zinc-900" />
                  <p className="font-serif text-xl italic text-zinc-500">Seeking the perfect words...</p>
                </div>
              )}

              {results && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-20 pb-24"
                >
                  <div className="space-y-12 text-center">
                    <div className="space-y-4">
                      <span className="text-xs font-bold uppercase tracking-[0.3em] text-zinc-400">Reflections</span>
                      <h2 className="font-serif text-5xl font-light italic text-zinc-900">{results.title}</h2>
                    </div>
                    
                    <div className="mx-auto max-w-2xl space-y-8">
                      <div className="relative group">
                        <p className="font-serif text-2xl leading-relaxed text-zinc-700">
                          {results.literaryDescription.english}
                        </p>
                        <button
                          onClick={playStoryAudio}
                          disabled={isAudioLoading}
                          className={cn(
                            "mt-8 flex items-center gap-3 mx-auto rounded-full px-8 py-4 text-sm font-medium transition-all hover:scale-105",
                            isPlayingStory ? "bg-indigo-600 text-white" : "bg-zinc-900 text-white hover:bg-zinc-800",
                            isAudioLoading && "opacity-50 cursor-not-allowed"
                          )}
                        >
                          {isAudioLoading ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                          ) : isPlayingStory ? (
                            <Pause className="h-5 w-5" />
                          ) : (
                            <Play className="h-5 w-5" />
                          )}
                          <span>
                            {isAudioLoading ? "Preparing Voice..." : isPlayingStory ? "Pause Story" : "Listen to the Story"}
                          </span>
                        </button>
                      </div>
                      <p className="font-serif text-lg leading-relaxed text-zinc-400 italic">
                        ({results.literaryDescription.chinese})
                      </p>
                    </div>
                  </div>

                  <div className="space-y-12">
                    <div className="flex items-center gap-4">
                      <div className="h-px flex-1 bg-zinc-100" />
                      <span className="text-xs font-bold uppercase tracking-[0.3em] text-zinc-400">Glossary</span>
                      <div className="h-px flex-1 bg-zinc-100" />
                    </div>

                    <div className="grid gap-x-12 gap-y-16 sm:grid-cols-2">
                      {results.items.map((item, idx) => (
                        <div key={idx} className="group space-y-4">
                          <div className="flex items-end justify-between border-b border-zinc-100 pb-2">
                            <div className="flex items-baseline gap-3">
                              <h3 className="font-display text-2xl font-bold text-zinc-900">{item.english}</h3>
                              <span className="font-serif text-sm italic text-zinc-400">[{item.phonetic}]</span>
                            </div>
                            <button 
                              onClick={() => playWordAudio(item.english)}
                              className="text-zinc-300 transition-colors hover:text-zinc-900"
                            >
                              <Volume2 className="h-5 w-5" />
                            </button>
                          </div>
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-zinc-900">
                              <span className="mr-2 italic text-zinc-400">{item.partOfSpeech}</span>
                              {item.chinese}
                            </p>
                            <p className="font-serif text-lg leading-relaxed text-zinc-500">
                              {item.example}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {error && (
                <div className="rounded-3xl bg-red-50 p-8 text-center">
                  <p className="font-serif text-lg text-red-600">{error}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <footer className="border-t border-zinc-100 bg-white py-20">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <div className="space-y-6">
            <div className="mx-auto h-12 w-px bg-zinc-200" />
            <p className="font-serif text-sm italic text-zinc-400">
              Where vision meets vocabulary.
            </p>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-300">
              © 2026 Visual Vocab Studio
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
