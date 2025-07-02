import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, AlertCircle } from 'lucide-react';
import { isVoiceSupported, createSpeechRecognition, getVoiceErrorMessage, parseVoiceCommand } from '../lib/voice-utils';

interface VoiceButtonProps {
  onCommand: (command: any) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
  className?: string;
}

export const VoiceButton: React.FC<VoiceButtonProps> = ({
  onCommand,
  onError,
  disabled = false,
  className = ""
}) => {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isVoiceSupported()) {
      setError('Voice recognition is not supported in this browser or requires HTTPS.');
      return;
    }

    recognitionRef.current = createSpeechRecognition();
    
    if (!recognitionRef.current) {
      setError('Failed to initialize voice recognition.');
      return;
    }

    recognitionRef.current.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognitionRef.current.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      const command = parseVoiceCommand(transcript);
      onCommand({ transcript, ...command });
      setIsListening(false);
    };

    recognitionRef.current.onerror = (event) => {
      const errorMessage = getVoiceErrorMessage(event.error);
      setError(errorMessage);
      setIsListening(false);
      onError?.(errorMessage);
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
    };

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [onCommand, onError]);

  const startListening = () => {
    if (!recognitionRef.current || isListening || disabled) return;

    try {
      setError(null);
      recognitionRef.current.start();
      
      // Auto-stop after 10 seconds
      timeoutRef.current = setTimeout(() => {
        if (recognitionRef.current && isListening) {
          recognitionRef.current.stop();
        }
      }, 10000);
    } catch (err) {
      setError('Failed to start voice recognition.');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const handleClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const isSupported = isVoiceSupported();

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={handleClick}
        disabled={disabled || !isSupported}
        className={`
          relative flex items-center justify-center rounded-full transition-all duration-200
          ${isListening 
            ? 'bg-red-500 animate-pulse' 
            : isSupported && !disabled
              ? 'bg-[#CBAB58] hover:bg-[#b69843]' 
              : 'bg-[#71727A] cursor-not-allowed'
          }
          ${className}
        `}
      >
        {isListening ? (
          <MicOff size={24} className="text-white" />
        ) : (
          <Mic size={24} className={isSupported && !disabled ? "text-[#1F2024]" : "text-white"} />
        )}
        
        {isListening && (
          <div className="absolute inset-0 rounded-full border-2 border-white/30 animate-ping" />
        )}
      </button>

      {error && (
        <div className="mt-2 flex items-center text-red-400 text-xs">
          <AlertCircle size={12} className="mr-1" />
          <span>{error}</span>
        </div>
      )}

      <p className="mt-2 text-[#71727A] text-xs text-center">
        {isListening 
          ? 'Listening...' 
          : !isSupported 
            ? 'Voice not available'
            : disabled
              ? 'Voice disabled'
              : 'Tap to speak'
        }
      </p>
    </div>
  );
};