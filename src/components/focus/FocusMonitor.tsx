import React, { useState, useRef, useEffect } from 'react';
import Webcam from 'react-webcam';
import * as faceapi from 'face-api.js';
import { Camera, EyeOff, Eye, AlertCircle, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { usePomodoroStore } from '../../stores/pomodoroStore';
import { toast } from 'sonner';

const FocusMonitor: React.FC = () => {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [faceDetected, setFaceDetected] = useState(false);
  const [emotionState, setEmotionState] = useState<string>('neutral');
  const [distractionLevel, setDistractionLevel] = useState<number>(0);
  const [focusScore, setFocusScore] = useState<number>(100);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [showFaceCam, setShowFaceCam] = useState(false);
  const [availableDevices, setAvailableDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [isLoadingDevices, setIsLoadingDevices] = useState(false);
  const [emotionHistory, setEmotionHistory] = useState<Array<{emotion: string, timestamp: number}>>([]);
  const [attentionShifts, setAttentionShifts] = useState<number>(0);
  const prevNosePosition = useRef<{x: number, y: number} | null>(null);
  const { isActive, currentMode } = usePomodoroStore();

  // Load available camera devices
  const loadCameraDevices = async () => {
    setIsLoadingDevices(true);
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      setAvailableDevices(videoDevices);
      
      // Select laptop camera by default (typically the first camera)
      if (videoDevices.length > 0 && !selectedDeviceId) {
        setSelectedDeviceId(videoDevices[0].deviceId);
      }
    } catch (error) {
      console.error('Error loading camera devices:', error);
      toast.error('Failed to load camera devices');
    } finally {
      setIsLoadingDevices(false);
    }
  };
  
  // Load face-api models
  useEffect(() => {
    const loadModels = async () => {
      try {
        // Make sure the models directory exists in your public folder
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri('/models/tiny_face_detector'),
          faceapi.nets.faceLandmark68Net.loadFromUri('/models/face_landmark_68'),
          faceapi.nets.faceExpressionNet.loadFromUri('/models/face_expression'),
        ]);
        console.log('Face-API models loaded successfully');
        setModelsLoaded(true);
      } catch (error) {
        console.error('Error loading face-api models:', error);
        toast.error('Failed to load face detection models');
      }
    };
    
    loadModels();
    loadCameraDevices();
  }, []);
  
  // Request camera permission
  const requestCameraPermission = async () => {
    try {
      const constraints = {
        video: selectedDeviceId ? { deviceId: { exact: selectedDeviceId } } : true
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      stream.getTracks().forEach(track => track.stop());
      setHasCameraPermission(true);
      setShowFaceCam(true);
      setIsTracking(true);
      
      toast.success('Camera permission granted');
    } catch (error) {
      console.error('Camera permission error:', error);
      setHasCameraPermission(false);
      toast.error('Camera permission denied');
    }
  };

  // Detect emotions and focus
  useEffect(() => {
    let animationId: number;
    let lastWarningTime = Date.now();
    let faceDetectionMisses = 0;
    const maxFaceDetectionMisses = 10; // Threshold before considering face not detected
    
    const detectFace = async () => {
      if (!isTracking || !webcamRef.current || !canvasRef.current || !modelsLoaded) {
        return;
      }
      
      const webcam = webcamRef.current.video;
      
      if (!webcam || webcam.readyState !== 4) {
        animationId = requestAnimationFrame(detectFace);
        return;
      }
      
      const canvas = canvasRef.current;
      const displaySize = { width: webcam.videoWidth, height: webcam.videoHeight };
      faceapi.matchDimensions(canvas, displaySize);
      
      try {
        // Lower minConfidence to make face detection more sensitive
        const options = new faceapi.TinyFaceDetectorOptions({ 
          inputSize: 320, 
          scoreThreshold: 0.3 // Lower threshold for easier detection
        });
        
        // Detect faces with landmarks and expressions
        const detections = await faceapi
          .detectAllFaces(webcam, options)
          .withFaceLandmarks()
          .withFaceExpressions();
          
        const resizedDetections = faceapi.resizeResults(detections, displaySize);
        
        // Clear canvas
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          
          // Draw face detections if enabled
          if (showFaceCam) {
            faceapi.draw.drawDetections(canvas, resizedDetections);
            faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
          }
        }
        
        // Update metrics
        if (detections.length > 0) {
          faceDetectionMisses = 0;
          setFaceDetected(true);
          
          const detection = detections[0];
          const expressions = detection.expressions;
          
          // Get dominant emotion
          const emotionEntries = Object.entries(expressions);
          const dominantEmotion = emotionEntries.reduce((prev, current) => 
            prev[1] > current[1] ? prev : current
          );
          
          const currentEmotion = dominantEmotion[0];
          setEmotionState(currentEmotion);
          
          // Add to emotion history (keep last 10 emotions)
          const newEmotionEntry = {
            emotion: currentEmotion,
            timestamp: Date.now()
          };
          
          setEmotionHistory(prev => {
            const next = [...prev, newEmotionEntry].slice(-10);
            return next;
          });
          
          // Calculate distraction level based on emotions
          // Higher values for emotions that indicate distraction
          const distractionWeights = {
            'neutral': 10,
            'happy': 20,   // Some happiness is good, but too much might mean off-task
            'sad': 40,
            'angry': 60,
            'fearful': 70,
            'disgusted': 50,
            'surprised': 80  // Surprise often indicates distraction
          };
          
          // Calculate distraction level
          let newDistractionLevel = distractionWeights[currentEmotion as keyof typeof distractionWeights] || 30;
          let emotionScore = distractionWeights[currentEmotion as keyof typeof distractionWeights] || 30;
          // Check for rapid emotion changes (indicates distraction)
          if (emotionHistory.length >= 5) {
            const recentEmotions = emotionHistory.slice(-5);
            const uniqueEmotions = new Set(recentEmotions.map(e => e.emotion));
            if (uniqueEmotions.size >= 4) {
              emotionScore += 15;
            }
          }

          newDistractionLevel += emotionScore;
          let rawScore = 100 - newDistractionLevel;
          // Apply sigmoid-like curve to emphasize sustained focus
          let focusScore = Math.floor(
            (1 / (1 + Math.exp(-0.1 * (rawScore - 50))) * 100
          ));
          focusScore = Math.max(0, Math.min(100, focusScore));
          setFocusScore(focusScore);
          // Check for head movement by tracking landmarks
          const landmarks = detection.landmarks;
          const calculateEAR = (eye: faceapi.Point[]) => {
            try {
              // Convert points to {x, y} format
              const points = eye.map(p => ({ x: p.x, y: p.y }));
              
              // Use correct indices for 68-point model
              const verticalPoint1 = points[1];  // Top of eye
              const verticalPoint2 = points[5];  // Bottom of eye
              const horizontalPoint1 = points[0]; // Left corner
              const horizontalPoint2 = points[3]; // Right corner
        
              // Calculate distances manually
              const vertical = Math.sqrt(
                Math.pow(verticalPoint2.x - verticalPoint1.x, 2) + 
                Math.pow(verticalPoint2.y - verticalPoint1.y, 2)
              );
              
              const horizontal = Math.sqrt(
                Math.pow(horizontalPoint2.x - horizontalPoint1.x, 2) + 
                Math.pow(horizontalPoint2.y - horizontalPoint1.y, 2)
              );
        
              return horizontal !== 0 ? vertical / horizontal : 0;
            } catch (error) {
              console.error('EAR calculation error:', error);
              return 0;
            }
          };
        
          // Calculate eye metrics
          let leftEAR = 0;
          let rightEAR = 0;
          const leftEye = detection.landmarks.getLeftEye();
          const rightEye = detection.landmarks.getRightEye();
          try {
            
            if (leftEye.length >= 6 && rightEye.length >= 6) {
              leftEAR = calculateEAR(leftEye);
              rightEAR = calculateEAR(rightEye);
            }
          } catch (error) {
            console.error('Error processing eyes:', error);
          }
          const averageEAR = (leftEAR + rightEAR) / 2;
          console.log(averageEAR*100 );
          const EAR_THRESHOLD = 0.25;  // Adjust based on testing
          const eyesClosed = averageEAR < EAR_THRESHOLD;
        
          // Add to distraction calculation
          if (eyesClosed) {
            newDistractionLevel += 50;
            setAttentionShifts(prev => prev + 1);
          }
 
           // 2. Head orientation detection
           const leftEyeCenter = {
             x: leftEye.reduce((sum: number, p: any) => sum + p.x, 0) / leftEye.length,
             y: leftEye.reduce((sum: number, p: any) => sum + p.y, 0) / leftEye.length
           };
           
           const rightEyeCenter = {
             x: rightEye.reduce((sum: number, p: any) => sum + p.x, 0) / rightEye.length,
             y: rightEye.reduce((sum: number, p: any) => sum + p.y, 0) / rightEye.length
           };
 
           const eyesCenter = {
             x: (leftEyeCenter.x + rightEyeCenter.x) / 2,
             y: (leftEyeCenter.y + rightEyeCenter.y) / 2
           };

          const nose = landmarks.getNose()[0]; // Nose tip point
          const faceWidth = Math.abs(rightEye[3].x - leftEye[0].x);
          const horizontalDeviation = Math.abs(nose.x - eyesCenter.x);
          const leftDeviation = Math.abs(nose.x - leftEyeCenter.x);
          const rightDeviation = Math.abs(nose.x - rightEyeCenter.x);
          // Store nose position to track movement
          if (horizontalDeviation > faceWidth * 0.1) { // 10% deviation
            newDistractionLevel += 25;
            setAttentionShifts(prev => prev + 1);
          }
          if(leftDeviation<20 || rightDeviation<20){
            newDistractionLevel += 60;
          }
          if (prevNosePosition.current) {
            const dx = nose.x - prevNosePosition.current.x;
            const dy = nose.y - prevNosePosition.current.y;
            const movement = Math.sqrt(dx*dx + dy*dy);
            
            // If significant movement detected
            if (movement > displaySize.width * 0.03) { // 3% of screen width
              newDistractionLevel += 15;
              setAttentionShifts(prev => prev + 1);
            }
          }
          prevNosePosition.current = {x: nose.x, y: nose.y};
          
          // Cap distraction level at 100
          newDistractionLevel = Math.min(100, newDistractionLevel);
          setDistractionLevel(newDistractionLevel);
          
          // Calculate focus score (inverse of distraction)
          const newFocusScore = Math.max(0, 100 - newDistractionLevel);
          setFocusScore(newFocusScore);
          
          // If focus is very low during work session, show notification
          if (isActive && currentMode === 'work' && newFocusScore < 40) {
            // Limit notifications to one every 30 seconds
            const now = Date.now();
            if (now - lastWarningTime > 30000) {
              const suggestionIndex = Math.floor(Math.random() * focusSuggestions.length);
              toast.warning(`Low focus detected: ${focusSuggestions[suggestionIndex]}`);
              lastWarningTime = now;
            }
          }
          
        } else {
          // Count consecutive missed detections
          faceDetectionMisses++;
          // Gradually reduce focus score instead of immediate drop
          if (faceDetectionMisses >= maxFaceDetectionMisses) {
            setFaceDetected(false);
            setFocusScore(prev => Math.max(0, prev - 10));
          }
        }
      } catch (error) {
        console.error('Error in face detection:', error);
      }
      
      animationId = requestAnimationFrame(detectFace);
    };
    
    if (isTracking) {
      detectFace();
    }
    
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [isTracking, modelsLoaded, showFaceCam, isActive, currentMode, selectedDeviceId, emotionHistory]);
  
  // Suggestions for improving focus
  const focusSuggestions = [
    "Take a deep breath and reset your attention",
    "Look away from screen for 20 seconds, then refocus",
    "Consider a short 2-minute stretching break",
    "Your attention is wandering. Gently bring it back to your task",
    "Try the Pomodoro technique - work for 25 minutes, then take a break",
    "Minimize distractions in your environment",
    "Write down any distracting thoughts to address later"
  ];
  
  // Get focus status message
  const getFocusStatusMessage = () => {
    if (!isTracking) {
      return 'Tracking disabled';
    }
    if (!faceDetected) {
      return 'No face detected';
    }
    if (focusScore < 40) {
      return 'Distracted';
    }
    return 'Well focused';
  };
  
  // Get focus status color
  const getFocusStatusColor = () => {
    if (!isTracking) {
      return 'text-gray-500';
    }
    if (!faceDetected || focusScore < 40) {
      return 'text-red-500';
    }
    return 'text-green-500';
  };
  
  // Get emotion color
  const getEmotionColor = () => {
    const emotionColors = {
      'neutral': 'text-blue-500',
      'happy': 'text-green-500',
      'sad': 'text-purple-500',
      'angry': 'text-red-500',
      'fearful': 'text-yellow-500',
      'disgusted': 'text-orange-500',
      'surprised': 'text-pink-500'
    };
    
    return emotionColors[emotionState as keyof typeof emotionColors] || 'text-gray-500';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Focus Monitor</h2>
        <div className="flex space-x-2">
          {hasCameraPermission && (
            <>
              <button
                onClick={() => setShowFaceCam(!showFaceCam)}
                className="p-2 text-gray-600 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label={showFaceCam ? 'Hide face cam' : 'Show face cam'}
              >
                {showFaceCam ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
              <button
                onClick={loadCameraDevices}
                className="p-2 text-gray-600 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Refresh camera devices"
                disabled={isLoadingDevices}
              >
                <RefreshCw size={20} className={isLoadingDevices ? "animate-spin" : ""} />
              </button>
            </>
          )}
          <button
            onClick={() => {
              if (hasCameraPermission === null) {
                requestCameraPermission();
              } else if (hasCameraPermission) {
                setIsTracking(!isTracking);
              } else {
                requestCameraPermission();
              }
            }}
            className={`p-2 rounded-full text-white ${
              isTracking ? 'bg-red-500 hover:bg-red-600' : 'bg-primary-500 hover:bg-primary-600'
            } transition-colors`}
            aria-label={isTracking ? 'Stop tracking' : 'Start tracking'}
          >
            <Camera size={20} />
          </button>
        </div>
      </div>

      {availableDevices.length > 0 && (
        <div className="mb-4">
          <label htmlFor="camera-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Select Camera
          </label>
          <select
            id="camera-select"
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            value={selectedDeviceId}
            onChange={(e) => {
              setSelectedDeviceId(e.target.value);
              if (isTracking) {
                setIsTracking(false);
                setTimeout(() => {
                  setIsTracking(true);
                }, 500);
              }
            }}
          >
            {availableDevices.map((device) => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.label || `Camera ${availableDevices.indexOf(device) + 1}`}
              </option>
            ))}
          </select>
        </div>
      )}

      {hasCameraPermission === false && (
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                Camera access is required
              </h3>
              <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                <p>
                  Please allow camera access to use the focus monitoring features.
                  You can change this in your browser settings.
                </p>
              </div>
              <div className="mt-4">
                <button
                  type="button"
                  onClick={requestCameraPermission}
                  className="px-2 py-1.5 rounded-md text-sm font-medium text-red-800 dark:text-red-200 bg-red-100 dark:bg-red-900/40 hover:bg-red-200 dark:hover:bg-red-800"
                >
                  Request Permission
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {hasCameraPermission === null && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-md mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Camera access needed
              </h3>
              <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                <p>
                  FocusForge uses your camera to detect focus levels and provide personalized recommendations.
                  All processing is done locally and no video is stored or transmitted.
                </p>
              </div>
              <div className="mt-4">
                <button
                  type="button"
                  onClick={requestCameraPermission}
                  className="px-2 py-1.5 rounded-md text-sm font-medium text-yellow-800 dark:text-yellow-200 bg-yellow-100 dark:bg-yellow-900/40 hover:bg-yellow-200 dark:hover:bg-yellow-800"
                >
                  Enable Focus Tracking
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {hasCameraPermission && (
        <div className="mb-6 relative">
          <div className={`aspect-video bg-black rounded-md overflow-hidden ${!showFaceCam && 'hidden'}`}>
            <Webcam
              ref={webcamRef}
              muted
              screenshotFormat="image/jpeg"
              className="w-full h-full object-cover"
              videoConstraints={{
                deviceId: selectedDeviceId ? { exact: selectedDeviceId } : undefined,
                facingMode: "user"
              }}
              onUserMediaError={(error) => {
                console.error('Webcam error:', error);
                toast.error('Failed to access webcam');
                setHasCameraPermission(false);
              }}
            />
            <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" />
          </div>
        </div>
      )}

      {hasCameraPermission && (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Focus Status</div>
            <div className={`text-lg font-semibold ${getFocusStatusColor()}`}>
              {getFocusStatusMessage()}
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Focus Score</div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {isTracking ? `${focusScore}/100` : 'N/A'}
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Current Emotion</div>
            <div className={`text-lg font-semibold ${getEmotionColor()}`}>
              {isTracking && faceDetected ? emotionState.charAt(0).toUpperCase() + emotionState.slice(1) : 'N/A'}
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Attention Shifts</div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {isTracking ? attentionShifts : 'N/A'}
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md col-span-2">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Distraction Level</div>
            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5 mb-1">
              <motion.div 
                className="h-2.5 rounded-full bg-red-500"
                initial={{ width: '0%' }}
                animate={{ width: `${distractionLevel}%` }}
                transition={{ duration: 0.5 }}
              ></motion.div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>Focused</span>
              <span>Distracted</span>
            </div>
          </div>
        </div>
      )}

      {hasCameraPermission && isTracking && (
        <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          FocusForge is monitoring your focus levels. All processing happens locally on your device.
        </div>
      )}
    </div>
  );
};

export default FocusMonitor;