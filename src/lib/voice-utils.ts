// Voice recognition utilities for AURUM payments

export interface VoiceCommand {
  amount?: number;
  currency?: string;
  method?: 'scan' | 'tap' | 'cash';
  action?: 'send' | 'pay' | 'transfer';
}

export const parseVoiceCommand = (transcript: string): VoiceCommand => {
  const command = transcript.toLowerCase().trim();
  const result: VoiceCommand = {};

  // Extract amount patterns
  const amountPatterns = [
    /(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(?:pesos?|ars)/i,
    /(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(?:dollars?|usd)/i,
    /(\d+(?:,\d{3})*(?:\.\d{2})?)/i
  ];

  for (const pattern of amountPatterns) {
    const match = command.match(pattern);
    if (match) {
      result.amount = parseFloat(match[1].replace(/,/g, ''));
      break;
    }
  }

  // Extract currency
  if (command.includes('peso') || command.includes('ars')) {
    result.currency = 'ARS';
  } else if (command.includes('dollar') || command.includes('usd')) {
    result.currency = 'USD';
  }

  // Extract payment method
  if (command.includes('scan') || command.includes('qr')) {
    result.method = 'scan';
  } else if (command.includes('tap') || command.includes('nfc')) {
    result.method = 'tap';
  } else if (command.includes('cash') || command.includes('atm')) {
    result.method = 'cash';
  }

  // Extract action
  if (command.includes('send')) {
    result.action = 'send';
  } else if (command.includes('pay')) {
    result.action = 'pay';
  } else if (command.includes('transfer')) {
    result.action = 'transfer';
  }

  return result;
};

export const isVoiceSupported = (): boolean => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const isHttps = window.location.protocol === 'https:' || 
                  window.location.hostname === 'localhost' || 
                  window.location.hostname === '127.0.0.1';
  
  return !!SpeechRecognition && isHttps;
};

export const getVoiceErrorMessage = (error: string): string => {
  switch (error) {
    case 'no-speech':
      return 'No speech was detected. Please try speaking again.';
    case 'audio-capture':
      return 'No microphone was found. Please check your microphone connection.';
    case 'not-allowed':
      return 'Microphone permission was denied. Please enable microphone access in your browser settings.';
    case 'network':
      return 'Network error occurred. Please check your internet connection.';
    case 'service-not-allowed':
      return 'Speech recognition service is not available. Please try again later.';
    case 'bad-grammar':
      return 'Speech was not recognized. Please try speaking more clearly.';
    case 'language-not-supported':
      return 'Language is not supported. Please ensure your browser supports English speech recognition.';
    default:
      return 'Voice recognition failed. Please try again or use manual input.';
  }
};

export const generateDemoCommands = (): string[] => {
  return [
    "Send 10000 pesos using scan to pay",
    "Pay 5000 ARS with tap to pay",
    "Transfer 15000 pesos via cash to pay",
    "Send 25000 pesos using QR code",
    "Pay 8000 ARS with NFC",
    "Transfer 12000 pesos to ATM"
  ];
};

export const requestMicrophonePermission = async (): Promise<boolean> => {
  try {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      return false;
    }

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    
    // Stop the stream immediately as we only needed permission
    stream.getTracks().forEach(track => track.stop());
    
    return true;
  } catch (error) {
    console.error('Microphone permission denied:', error);
    return false;
  }
};

export const createSpeechRecognition = (): SpeechRecognition | null => {
  if (!isVoiceSupported()) {
    return null;
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();
  
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = 'en-US';
  recognition.maxAlternatives = 1;
  
  return recognition;
};