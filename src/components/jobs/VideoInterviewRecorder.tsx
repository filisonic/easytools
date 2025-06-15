
import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Video, VideoOff, Square, Play, Upload, Loader2 } from 'lucide-react';

interface VideoInterviewRecorderProps {
  onVideoRecorded: (videoBlob: Blob) => void;
  webhookUrl: string;
}

export function VideoInterviewRecorder({ onVideoRecorded, webhookUrl }: VideoInterviewRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideo, setRecordedVideo] = useState<Blob | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [stream, setStream] = useState<MediaStream | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const questions = [
    "Tell us about yourself and your background",
    "What interests you most about this position?",
    "Describe a challenging project you've worked on",
    "Where do you see yourself in 5 years?",
    "Why should we hire you for this role?"
  ];

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: true
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setStream(mediaStream);
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast({
        title: 'Camera Access Error',
        description: 'Unable to access your camera. Please check permissions.',
        variant: 'destructive',
      });
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, [stream]);

  const startRecording = useCallback(() => {
    if (!stream) return;

    try {
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9,opus'
      });
      
      chunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const videoBlob = new Blob(chunksRef.current, { type: 'video/webm' });
        setRecordedVideo(videoBlob);
        onVideoRecorded(videoBlob);
      };

      mediaRecorder.start(1000); // Collect data every second
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: 'Recording Error',
        description: 'Unable to start recording. Please try again.',
        variant: 'destructive',
      });
    }
  }, [stream, onVideoRecorded]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [isRecording]);

  const uploadVideo = async () => {
    if (!recordedVideo || !webhookUrl) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('video_interview', recordedVideo, `interview_q${currentQuestionIndex + 1}_${Date.now()}.webm`);
      formData.append('question', questions[currentQuestionIndex]);
      formData.append('question_number', (currentQuestionIndex + 1).toString());
      formData.append('timestamp', new Date().toISOString());

      const response = await fetch(webhookUrl, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        toast({
          title: 'Video Uploaded!',
          description: `Answer for question ${currentQuestionIndex + 1} uploaded successfully.`,
        });
        
        // Move to next question or finish
        if (currentQuestionIndex < questions.length - 1) {
          setCurrentQuestionIndex(prev => prev + 1);
          setRecordedVideo(null);
          setRecordingTime(0);
        } else {
          toast({
            title: 'Interview Complete!',
            description: 'All video answers have been submitted successfully.',
          });
          stopCamera();
        }
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Error uploading video:', error);
      toast({
        title: 'Upload Failed',
        description: 'Failed to upload video. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setRecordedVideo(null);
      setRecordingTime(0);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Video className="h-5 w-5" />
          Video Interview
        </CardTitle>
        <CardDescription>
          Answer the interview questions below. Each response should be 1-2 minutes long.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Question Progress */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h3 className="font-medium">Question {currentQuestionIndex + 1} of {questions.length}</h3>
            <Badge variant="outline">
              {currentQuestionIndex + 1}/{questions.length}
            </Badge>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Current Question */}
        <Card className="p-4 bg-blue-50 border-blue-200">
          <h4 className="font-medium text-blue-900 mb-2">Interview Question:</h4>
          <p className="text-blue-800">{questions[currentQuestionIndex]}</p>
        </Card>

        {/* Video Preview */}
        <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
          />
          {isRecording && (
            <div className="absolute top-4 right-4 flex items-center gap-2 bg-red-600 text-white px-3 py-1 rounded-full">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              REC {formatTime(recordingTime)}
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-3 justify-center">
          {!stream ? (
            <Button onClick={startCamera} className="flex items-center gap-2">
              <Video className="h-4 w-4" />
              Start Camera
            </Button>
          ) : (
            <>
              <Button 
                onClick={stopCamera} 
                variant="outline"
                className="flex items-center gap-2"
              >
                <VideoOff className="h-4 w-4" />
                Stop Camera
              </Button>

              {!isRecording ? (
                <Button 
                  onClick={startRecording}
                  className="flex items-center gap-2"
                  disabled={!stream}
                >
                  <Play className="h-4 w-4" />
                  Start Recording
                </Button>
              ) : (
                <Button 
                  onClick={stopRecording}
                  variant="destructive"
                  className="flex items-center gap-2"
                >
                  <Square className="h-4 w-4" />
                  Stop Recording
                </Button>
              )}

              {recordedVideo && !isRecording && (
                <Button 
                  onClick={uploadVideo}
                  disabled={isUploading || !webhookUrl}
                  className="flex items-center gap-2"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      Submit Answer
                    </>
                  )}
                </Button>
              )}

              {recordedVideo && !isRecording && currentQuestionIndex < questions.length - 1 && (
                <Button 
                  onClick={nextQuestion}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  Skip Question
                </Button>
              )}
            </>
          )}
        </div>

        {/* Instructions */}
        <div className="text-sm text-muted-foreground space-y-1">
          <p>📹 Make sure you're in a well-lit area with minimal background noise</p>
          <p>🎯 Keep your answers between 1-2 minutes per question</p>
          <p>💾 Each answer will be uploaded automatically when you submit</p>
        </div>
      </CardContent>
    </Card>
  );
}
