'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import { Camera, Activity, AlertCircle } from 'lucide-react';

export default function LiveCameraScanner({ onCountUpdate }: { onCountUpdate: (count: number) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let model: cocoSsd.ObjectDetection;
    let animationFrameId: number;

    const setupAI = async () => {
      try {
        // 1. Force TensorFlow to use the CPU/WebGL (browser-friendly)
        await tf.ready();
        
        // 2. Load the pre-trained COCO-SSD model
        model = await cocoSsd.load();
        setIsModelLoaded(true);

        // 3. Start the Webcam
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'environment' } // Uses back camera on phones, default on PC
          });
          
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.onloadedmetadata = () => {
              videoRef.current?.play();
              setIsCameraOn(true);
              detectFrame(); // Start scanning
            };
          }
        }
      } catch (err) {
        setError("Failed to access camera or load AI. Check browser permissions.");
        console.error(err);
      }
    };

    const detectFrame = async () => {
      if (!videoRef.current || !canvasRef.current || !model) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      // Make sure video is actually playing
      if (video.readyState !== 4) {
        animationFrameId = requestAnimationFrame(detectFrame);
        return;
      }

      // Match canvas size to video size
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Run AI Detection
      const predictions = await model.detect(video);

      // Clear previous drawings
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        let personCount = 0;

        // Draw new bounding boxes
        predictions.forEach(prediction => {
          // We only care about counting people for Crowd Check
          if (prediction.class === 'person') {
            personCount++;
            
            const [x, y, width, height] = prediction.bbox;
            
            // Draw Box
            ctx.strokeStyle = '#22c55e'; // Teal/Green box
            ctx.lineWidth = 4;
            ctx.strokeRect(x, y, width, height);

            // Draw Label
            ctx.fillStyle = '#22c55e';
            ctx.fillRect(x, y - 24, width, 24);
            ctx.fillStyle = '#000000';
            ctx.font = '16px Arial font-bold';
            ctx.fillText(`Person ${Math.round(prediction.score * 100)}%`, x + 4, y - 6);
          }
        });

        // Send the live count back to the dashboard!
        onCountUpdate(personCount);
      }

      // Loop the scan for the next frame
      animationFrameId = requestAnimationFrame(detectFrame);
    };

    setupAI();

    // Cleanup when closing the component
    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [onCountUpdate]);

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow-lg relative">
      {/* Top Header */}
      <div className="bg-slate-950 px-4 py-3 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Camera size={18} className="text-cyan-400" />
          <span className="font-semibold text-sm text-white">Live AI Vision Feed</span>
        </div>
        <div className="flex items-center gap-2">
          {!isModelLoaded ? (
            <span className="text-xs text-yellow-400 flex items-center gap-1 animate-pulse">
              <Activity size={14} /> Loading AI Core...
            </span>
          ) : (
            <span className="text-xs text-green-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Active
            </span>
          )}
        </div>
      </div>

      {/* Camera Container */}
      <div className="relative aspect-video bg-black w-full flex items-center justify-center">
        {error ? (
          <div className="text-red-400 flex flex-col items-center p-6 text-center">
            <AlertCircle size={32} className="mb-2" />
            <p className="text-sm font-semibold">{error}</p>
          </div>
        ) : (
          <>
            <video 
              ref={videoRef} 
              className="absolute top-0 left-0 w-full h-full object-cover opacity-80"
              playsInline 
              muted
            />
            {/* The canvas sits directly on top of the video to draw the boxes */}
            <canvas 
              ref={canvasRef} 
              className="absolute top-0 left-0 w-full h-full object-cover z-10"
            />
          </>
        )}
      </div>
    </div>
  );
}
