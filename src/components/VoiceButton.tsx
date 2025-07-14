import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, AlertCircle } from 'lucide-react';
import { isVoiceSupported, createSpeechRecognition, getVoiceErrorMessage, parseVoiceCommand } from '../lib/voice-utils';
import { AccessibleButton } from './AccessibleButton';
import { LiveRegion } from './LiveRegion';

interface VoiceButtonProps {
  onCommand: (command: any) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
  className?: string;
  size?: 'small' | 'medium' | 'large';
  ariaLabel?: string;
}

export const VoiceButton: React.FC<VoiceButtonProps> = ({
  onCommand,
  onError,
  disabled = false,
  className = "",
  size = 'medium',
  ariaLabel = "Voice command button"
}) => {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [transcript, setTranscript] = useState<string>('');

  const sizeClasses = {
    small: 'w-12 h-12',
    medium: 'w-16 h-16',
    large: 'w-32 h-32'
  };

  const iconSizes = {
    small: 16,
    medium: 24,
    large: 64
  };

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
      setTranscript('');
      setAnnouncement('Voice recognition started. Speak your command now.');
    };

    recognitionRef.current.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      const command = parseVoiceCommand(transcript);
      setTranscript(transcript);
      setAnnouncement(`Voice command recognized: ${transcript}`);
      onCommand({ transcript, ...command });
      setIsListening(false);
    };

    recognitionRef.current.onerror = (event) => {
      const errorMessage = getVoiceErrorMessage(event.error);
      setError(errorMessage);
      setIsListening(false);
      setAnnouncement(`Voice recognition error: ${errorMessage}`);
      onError?.(errorMessage);
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
      if (!transcript && !error) {
        setAnnouncement('Voice recognition ended. No command detected.');
      }
    };

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [onCommand, onError, transcript, error]);

  const startListening = () => {
    if (!recognitionRef.current || isListening || disabled) return;

    try {
      setError(null);
      setAnnouncement('Starting voice recognition...');
      recognitionRef.current.start();
      
      // Auto-stop after 10 seconds
      timeoutRef.current = setTimeout(() => {
        if (recognitionRef.current && isListening) {
          recognitionRef.current.stop();
          setAnnouncement('Voice recognition timed out after 10 seconds.');
        }
      }, 10000);
    } catch (err) {
      const errorMsg = 'Failed to start voice recognition.';
      setError(errorMsg);
      setAnnouncement(errorMsg);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setAnnouncement('Voice recognition stopped.');
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
  const buttonVariant = isListening ? 'danger' : isSupported && !disabled ? 'primary' : 'secondary';

  return (
    <div className="flex flex-col items-center">
      <LiveRegion message={announcement} priority="assertive" />
      
      <AccessibleButton
        onClick={handleClick}
        disabled={disabled || !isSupported}
        variant={buttonVariant}
        ariaLabel={`${ariaLabel}. ${
          isListening 
            ? 'Currently listening. Press to stop.' 
            : isSupported && !disabled 
              ? 'Press to start voice recognition' 
              : 'Voice recognition not available'
        }`}
        className={`
          relative rounded-full transition-all duration-200 ${sizeClasses[size]} ${className}
          ${isListening ? 'animate-pulse shadow-lg shadow-red-500/25' : ''}
        `}
        leftIcon={
          isListening ? (
            <MicOff size={iconSizes[size]} aria-hidden="true" />
          ) : (
            <Mic size={iconSizes[size]} aria-hidden="true" />
          )
        }
      >
        <span className="sr-only">
          {isListening ? 'Stop listening' : 'Start voice command'}
        </span>
        
        {isListening && (
          <div className="absolute inset-0 rounded-full border-2 border-white/30 animate-ping" aria-hidden="true" />
        )}
      </AccessibleButton>

      {/* Status text */}
      <p className="mt-2 text-[#71727A] text-xs text-center" aria-live="polite">
        {isListening 
          ? 'Listening...' 
          : !isSupported 
            ? 'Voice not available'
            : disabled
              ? 'Voice disabled'
              : 'Tap to speak'
        }
      </p>

      {/* Error message */}
      {error && (
        <div className="mt-2 flex items-center text-red-400 text-xs max-w-[200px] text-center" role="alert">
          <AlertCircle size={12} className="mr-1 flex-shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      {/* Transcript display */}
      {transcript && !error && (
        <div className="mt-2 text-[#CBAB58] text-xs text-center max-w-[200px]" aria-live="polite">
          <span className="sr-only">Voice command recognized: </span>
          "{transcript}"
        </div>
      )}
    </div>
  );
};