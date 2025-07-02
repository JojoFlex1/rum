import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Mic, ChevronDown, Type, AlertCircle, Shield, RefreshCw } from "lucide-react";
import { NavigationBar } from "../../components/ui/navigation-bar";

const cryptoCurrencies = [
  { symbol: "USDC", name: "USD Coin", rate: 0.00086 },
  { symbol: "ETH", name: "Ethereum", rate: 0.000000487496429 },
  { symbol: "BTC", name: "Bitcoin", rate: 0.000000009305556 },
  { symbol: "CELO", name: "Celo", rate: 0.00268246 },
  { symbol: "STRK", name: "Starknet", rate: 0.005630630630630406 },
  { symbol: "XLM", name: "Stellar", rate: 0.003276481619608 }
];

export const VoiceCommandScreen = (): JSX.Element => {
  const navigate = useNavigate();
  const [showPaymentMethods, setShowPaymentMethods] = useState(false);
  const [showCryptoDropdown, setShowCryptoDropdown] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [selectedCrypto, setSelectedCrypto] = useState("USDC");
  const [isVoiceMode, setIsVoiceMode] = useState(true);
  const [requestAmount, setRequestAmount] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [isVoiceSupported, setIsVoiceSupported] = useState(false);
  const [isHttps, setIsHttps] = useState(false);
  const [showDemoPrompt, setShowDemoPrompt] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const cryptoDropdownRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Check if we're on HTTPS or localhost
    const isSecure = window.location.protocol === 'https:' || 
                    window.location.hostname === 'localhost' || 
                    window.location.hostname === '127.0.0.1';
    setIsHttps(isSecure);

    // Check if Speech Recognition is supported
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const isSupported = !!SpeechRecognition && isSecure;
    setIsVoiceSupported(isSupported);

    if (!isSupported) {
      if (!isSecure) {
        setVoiceError('Voice commands require HTTPS. Please use a secure connection.');
      } else {
        setVoiceError('Voice recognition is not supported in this browser. Please try Chrome, Edge, or Safari.');
      }
      setShowDemoPrompt(true);
      return;
    }

    try {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';
      recognitionRef.current.maxAlternatives = 1;

      recognitionRef.current.onstart = () => {
        console.log('Voice recognition started');
        setIsListening(true);
        setVoiceError(null);
      };

      recognitionRef.current.onresult = (event) => {
        const last = event.results.length - 1;
        const command = event.results[last][0].transcript.toLowerCase().trim();
        console.log('Voice command received:', command);
        setTranscript(command);
        
        // Extract amount from voice command
        const amountPatterns = [
          /(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(?:pesos?|ars|dollars?|usd)/i,
          /(\d+(?:,\d{3})*(?:\.\d{2})?)/i
        ];
        
        for (const pattern of amountPatterns) {
          const amountMatch = command.match(pattern);
          if (amountMatch) {
            const amount = amountMatch[1].replace(/,/g, '');
            setRequestAmount(amount);
            break;
          }
        }

        // Extract payment method from voice command
        if (command.includes('scan') || command.includes('qr')) {
          setSelectedMethod('Scan to Pay');
        } else if (command.includes('tap') || command.includes('nfc')) {
          setSelectedMethod('Tap to Pay');
        } else if (command.includes('cash') || command.includes('atm')) {
          setSelectedMethod('Cash to Pay');
        }

        setIsListening(false);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        
        let errorMessage = 'Voice recognition failed. ';
        switch (event.error) {
          case 'no-speech':
            errorMessage += 'No speech was detected. Please try again.';
            break;
          case 'audio-capture':
            errorMessage += 'No microphone was found. Please check your microphone.';
            break;
          case 'not-allowed':
            errorMessage += 'Microphone permission was denied. Please enable microphone access.';
            break;
          case 'network':
            errorMessage += 'Network error occurred. Please check your connection.';
            break;
          case 'service-not-allowed':
            errorMessage += 'Speech service is not allowed. Please try again.';
            break;
          default:
            errorMessage += 'Please try again or use manual input.';
        }
        setVoiceError(errorMessage);
      };

      recognitionRef.current.onend = () => {
        console.log('Voice recognition ended');
        setIsListening(false);
      };

    } catch (error) {
      console.error('Error setting up speech recognition:', error);
      setVoiceError('Failed to initialize voice recognition. Please use manual input.');
      setShowDemoPrompt(true);
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowPaymentMethods(false);
      }
      if (cryptoDropdownRef.current && !cryptoDropdownRef.current.contains(event.target as Node)) {
        setShowCryptoDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const startListening = () => {
    if (!isVoiceSupported) {
      setShowDemoPrompt(true);
      return;
    }

    if (recognitionRef.current && !isListening) {
      try {
        setVoiceError(null);
        setTranscript("");
        recognitionRef.current.start();
        
        // Auto-stop after 10 seconds
        timeoutRef.current = setTimeout(() => {
          if (recognitionRef.current && isListening) {
            recognitionRef.current.stop();
          }
        }, 10000);
      } catch (error) {
        console.error('Speech recognition start error:', error);
        setVoiceError('Failed to start voice recognition. Please try again.');
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const handleMethodSelect = (method: string) => {
    setSelectedMethod(method);
    setShowPaymentMethods(false);
  };

  const handleCryptoSelect = (crypto: string) => {
    setSelectedCrypto(crypto);
    setShowCryptoDropdown(false);
  };

  const handleProceed = () => {
    const amount = parseFloat(requestAmount);
    if (!amount || isNaN(amount)) {
      alert("Please enter a valid amount");
      return;
    }

    if (selectedMethod === "Cash to Pay") {
      navigate("/cash-to-pay", { state: { amount } });
    } else if (selectedMethod === "Scan to Pay") {
      navigate("/scan-to-pay", { state: { amount } });
    } else if (selectedMethod === "Tap to Pay") {
      navigate("/tap-to-pay", { state: { amount } });
    }
  };

  const toggleInputMode = () => {
    setIsVoiceMode(!isVoiceMode);
    setRequestAmount("");
    setTranscript("");
    setVoiceError(null);
    if (isListening) {
      stopListening();
    }
  };

  const handleDemoVoice = () => {
    // Simulate voice input for demo
    const demoCommands = [
      "Send 10000 pesos using scan to pay",
      "Pay 5000 ARS with tap to pay",
      "Transfer 15000 pesos via cash to pay"
    ];
    
    const randomCommand = demoCommands[Math.floor(Math.random() * demoCommands.length)];
    setTranscript(randomCommand);
    
    // Extract amount and method from demo command
    const amountMatch = randomCommand.match(/(\d+)/);
    if (amountMatch) {
      setRequestAmount(amountMatch[1]);
    }
    
    if (randomCommand.includes('scan')) {
      setSelectedMethod('Scan to Pay');
    } else if (randomCommand.includes('tap')) {
      setSelectedMethod('Tap to Pay');
    } else if (randomCommand.includes('cash')) {
      setSelectedMethod('Cash to Pay');
    }
    
    setShowDemoPrompt(false);
  };

  const calculateCryptoAmount = (arsAmount: number, selectedCrypto: string) => {
    const crypto = cryptoCurrencies.find(c => c.symbol === selectedCrypto);
    if (!crypto) return 0;
    return (arsAmount * crypto.rate).toFixed(8);
  };

  const arsAmount = parseFloat(requestAmount) || 0;
  const fee = arsAmount * 0.03; // 3% fee
  const totalAmount = arsAmount + fee;
  const cryptoAmount = calculateCryptoAmount(totalAmount, selectedCrypto);

  return (
    <div className="flex justify-center w-full bg-[#1F2024]">
      <div className="relative w-[393px] bg-[#1F2024]">
        <header className="fixed top-0 w-[393px] z-50 h-[42px] bg-[#1F2024] backdrop-blur-[20px] backdrop-brightness-[100%] [-webkit-backdrop-filter:blur(20px)_brightness(100%)]">
          <div className="absolute w-14 h-[17px] top-[13px] left-[21px]">
            <div className="absolute w-[54px] -top-px left-0 [font-family:'SF_Pro_Text-Semibold',Helvetica] font-normal text-white text-[15px] text-center tracking-[-0.17px] leading-[normal]">
              3:33
            </div>
          </div>

          <div className="absolute w-[68px] h-3.5 top-[15px] left-[311px] overflow-hidden">
            <div className="absolute -top-1 left-[41px] [font-family:'SF_Pro_Text-Regular',Helvetica] font-normal text-white text-[17px] tracking-[0] leading-[normal] whitespace-nowrap">
              􀛨
            </div>

            <img
              className="absolute w-[17px] h-[11px] top-0.5 left-0"
              alt="Signal"
              src="/signal.svg"
            />

            <div className="absolute -top-0.5 left-[21px] [font-family:'SF_Pro_Text-Regular',Helvetica] font-normal text-white text-sm tracking-[0] leading-[normal]">
              􀙇
            </div>
          </div>
        </header>

        <div className="flex flex-col px-4 pt-[58px] pb-[83px]">
          <div className="flex items-center mb-8">
            <button 
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-full bg-[#2C2D32] flex items-center justify-center mr-4"
            >
              <ArrowLeft size={20} className="text-white" />
            </button>
            <h1 className="text-2xl font-bold text-white">Voice Payment</h1>
          </div>

          {/* Voice Support Warning */}
          {!isHttps && (
            <div className="mb-6 p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl">
              <div className="flex items-start">
                <Shield size={20} className="text-orange-500 mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-orange-500 text-sm font-medium mb-2">HTTPS Required</p>
                  <p className="text-orange-400 text-xs mb-3">
                    Voice commands require a secure connection. Please use HTTPS or localhost for voice features.
                  </p>
                  <button
                    onClick={() => setShowDemoPrompt(true)}
                    className="bg-orange-500/20 text-orange-400 px-3 py-2 rounded-lg text-sm hover:bg-orange-500/30 transition-colors"
                  >
                    Try Demo Mode
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Demo Prompt */}
          {showDemoPrompt && (
            <div className="mb-6 p-6 bg-gradient-to-r from-[#CBAB58]/20 to-[#E1C87D]/20 border border-[#CBAB58]/30 rounded-xl">
              <div className="flex items-center mb-4">
                <Mic size={24} className="text-[#CBAB58] mr-3" />
                <h3 className="text-white font-semibold">Demo Voice Commands</h3>
              </div>
              
              <p className="text-white/80 text-sm mb-4">
                Voice commands are not available in this environment. Try our demo mode to see how voice payments work.
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={handleDemoVoice}
                  className="w-full bg-[#CBAB58] text-[#1F2024] py-3 rounded-xl font-semibold hover:bg-[#b69843] transition-colors flex items-center justify-center"
                >
                  <Mic size={20} className="mr-2" />
                  Try Demo Voice Command
                </button>
                
                <button
                  onClick={() => {
                    setShowDemoPrompt(false);
                    setIsVoiceMode(false);
                  }}
                  className="w-full bg-[#2C2D32] text-white py-3 rounded-xl font-medium hover:bg-[#71727A] transition-colors"
                >
                  Use Manual Input
                </button>
              </div>
            </div>
          )}

          {/* Input Mode Toggle */}
          {!showDemoPrompt && (
            <div className="flex justify-center mb-8">
              <button
                onClick={toggleInputMode}
                className="flex items-center space-x-2 bg-[#2C2D32] px-4 py-2 rounded-full"
              >
                {isVoiceMode ? (
                  <>
                    <Mic size={20} className="text-[#CBAB58]" />
                    <span className="text-white">Switch to Type</span>
                  </>
                ) : (
                  <>
                    <Type size={20} className="text-[#CBAB58]" />
                    <span className="text-white">Switch to Voice</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Voice Error Display */}
          {voiceError && isVoiceMode && !showDemoPrompt && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
              <div className="flex items-start">
                <AlertCircle size={20} className="text-red-500 mr-3 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-red-500 text-sm font-medium mb-2">Voice Recognition Error</p>
                  <p className="text-red-400 text-xs mb-3">{voiceError}</p>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setVoiceError(null);
                        startListening();
                      }}
                      className="flex items-center bg-red-500/20 text-red-400 px-3 py-2 rounded-lg text-sm hover:bg-red-500/30 transition-colors"
                    >
                      <RefreshCw size={16} className="mr-2" />
                      Try Again
                    </button>
                    <button
                      onClick={() => setIsVoiceMode(false)}
                      className="bg-red-500/20 text-red-400 px-3 py-2 rounded-lg text-sm hover:bg-red-500/30 transition-colors"
                    >
                      Use Manual Input
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col items-center justify-center">
            {isVoiceMode && !showDemoPrompt ? (
              <>
                <button
                  onClick={isListening ? stopListening : startListening}
                  className="w-[280px] h-[280px] rounded-full bg-[#2C2D32] flex items-center justify-center mb-12"
                  disabled={!isVoiceSupported}
                >
                  <div className={`w-[200px] h-[200px] rounded-full ${
                    isListening ? 'bg-red-500 animate-pulse' : 'bg-[#CBAB58]'
                  } flex items-center justify-center ${!isVoiceSupported ? 'opacity-50' : ''}`}>
                    <Mic size={80} className="text-[#1F2024]" />
                  </div>
                </button>

                <div className="text-center space-y-4 w-full">
                  <p className="text-[#71727A] text-lg">
                    {isListening ? 'Listening...' : 
                     !isVoiceSupported ? 'Voice not available' :
                     'Tap microphone to speak'}
                  </p>
                  
                  {isListening && (
                    <div className="flex items-center justify-center space-x-1">
                      {[...Array(30)].map((_, i) => (
                        <div
                          key={i}
                          className="w-1 bg-[#CBAB58] rounded-full animate-pulse"
                          style={{
                            height: `${Math.random() * 40 + 8}px`,
                            animationDelay: `${i * 0.1}s`
                          }}
                        />
                      ))}
                    </div>
                  )}
                  
                  {transcript && (
                    <div className="bg-[#2C2D32] p-4 rounded-xl">
                      <p className="text-[#71727A] text-sm mb-2">You said:</p>
                      <p className="text-white text-lg font-medium">"{transcript}"</p>
                    </div>
                  )}

                  {!isVoiceSupported && (
                    <div className="bg-[#2C2D32] p-4 rounded-xl">
                      <p className="text-[#71727A] text-sm">
                        Try saying: "Send 10000 pesos using scan to pay"
                      </p>
                    </div>
                  )}
                </div>
              </>
            ) : !showDemoPrompt ? (
              <div className="w-full mb-12">
                <div className="bg-[#2C2D32] p-6 rounded-xl">
                  <label className="block text-[#71727A] mb-2">Enter Amount (ARS)</label>
                  <input
                    type="number"
                    value={requestAmount}
                    onChange={(e) => setRequestAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-[#1F2024] text-white text-2xl font-semibold p-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#CBAB58]"
                  />
                </div>
              </div>
            ) : null}

            {!showDemoPrompt && (
              <div className="w-full bg-[#2C2D32] p-6 rounded-2xl">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[#71727A]">Request (ARS)</span>
                  <span className="text-white font-semibold">
                    {arsAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="flex justify-between items-center mb-4">
                  <span className="text-[#71727A]">Service Fee (3%)</span>
                  <span className="text-[#71727A] font-semibold">
                    {fee.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="flex justify-between items-center mb-4">
                  <span className="text-[#71727A]">Total (ARS)</span>
                  <span className="text-white font-semibold">
                    {totalAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="relative mb-6" ref={cryptoDropdownRef}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[#71727A]">Pay with</span>
                    <button
                      onClick={() => setShowCryptoDropdown(!showCryptoDropdown)}
                      className="flex items-center space-x-2 bg-[#1F2024] px-3 py-2 rounded-lg"
                    >
                      <span className="text-[#CBAB58] font-semibold">≈ {cryptoAmount} {selectedCrypto}</span>
                      <ChevronDown 
                        size={16} 
                        className={`text-[#CBAB58] transition-transform duration-200 ${showCryptoDropdown ? 'rotate-180' : ''}`} 
                      />
                    </button>
                  </div>

                  {showCryptoDropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-[#1F2024] rounded-xl overflow-hidden z-50 shadow-lg">
                      {cryptoCurrencies.map((crypto) => (
                        <button
                          key={crypto.symbol}
                          onClick={() => handleCryptoSelect(crypto.symbol)}
                          className="w-full p-3 text-left hover:bg-[#2C2D32] transition-colors flex justify-between items-center"
                        >
                          <span className="text-white">{crypto.name}</span>
                          <span className="text-[#CBAB58]">{crypto.symbol}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="relative mb-6" ref={dropdownRef}>
                  <button
                    onClick={() => setShowPaymentMethods(!showPaymentMethods)}
                    className="w-full bg-[#1F2024] p-4 rounded-xl flex justify-between items-center"
                  >
                    <span className="text-white">
                      {selectedMethod || "Select Payment Method"}
                    </span>
                    <ChevronDown 
                      size={20} 
                      className={`text-[#CBAB58] transition-transform duration-200 ${showPaymentMethods ? 'rotate-180' : ''}`} 
                    />
                  </button>

                  {showPaymentMethods && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-[#1F2024] rounded-xl overflow-hidden z-50 shadow-lg">
                      {["Scan to Pay", "Tap to Pay", "Cash to Pay"].map((method) => (
                        <button
                          key={method}
                          onClick={() => handleMethodSelect(method)}
                          className="w-full p-4 text-left text-white hover:bg-[#2C2D32] transition-colors"
                        >
                          {method}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <button 
                  onClick={handleProceed}
                  className={`w-full h-[52px] text-[#1F2024] text-[17px] font-semibold rounded-[14px] transition-colors ${
                    selectedMethod && arsAmount > 0
                      ? 'bg-[#CBAB58] hover:bg-[#b69843]' 
                      : 'bg-[#71727A] cursor-not-allowed'
                  }`}
                  disabled={!selectedMethod || arsAmount <= 0}
                >
                  Proceed
                </button>
              </div>
            )}
          </div>
        </div>

        <NavigationBar />
      </div>
    </div>
  );
};