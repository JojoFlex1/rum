import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Camera, AlertCircle, RefreshCw, CheckCircle, Wallet, ExternalLink, Copy, Shield, Globe, QrCode, Send, DollarSign } from "lucide-react";
import { NavigationBar } from "../../components/ui/navigation-bar";
import { parseQRCodeData, formatAddressForDisplay, getNetworkDisplayName, getNetworkColor, generateSampleQRCodes, WalletAddress, validateTransactionAmount, estimateTransactionFee } from "../../lib/crypto-utils";
import { useWallet } from "../../components/WalletProvider";
import { sendTransaction, parseWalletQRCode, handleWalletError } from "../../lib/reown";
import { apiClient, formatRouteDisplay, type RouteResponse } from "../../lib/api";

export const ScanToPayScreen = (): JSX.Element => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isConnected, account, sendTransaction: walletSendTransaction } = useWallet();
  
  const requestedAmount = location.state?.amount || 10000;
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cameraPermission, setCameraPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [currentStream, setCurrentStream] = useState<MediaStream | null>(null);
  const [detectedWallet, setDetectedWallet] = useState<WalletAddress | null>(null);
  const [showSampleQRs, setShowSampleQRs] = useState(false);
  const [isHttps, setIsHttps] = useState(false);
  const [showHttpsWarning, setShowHttpsWarning] = useState(false);
  const [showDemoPrompt, setShowDemoPrompt] = useState(true);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  const [routeData, setRouteData] = useState<RouteResponse | null>(null);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [routeError, setRouteError] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const detectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check if we're on HTTPS
  useEffect(() => {
    const isSecure = window.location.protocol === 'https:' || 
                    window.location.hostname === 'localhost' || 
                    window.location.hostname === '127.0.0.1';
    setIsHttps(isSecure);
    
    if (!isSecure) {
      setShowHttpsWarning(true);
      setError('Camera access requires HTTPS. Please use a secure connection or localhost.');
    }
  }, []);

  // Enhanced QR code detection with wallet address parsing
  const detectQRCode = (imageData: ImageData): WalletAddress | null => {
    // In a real implementation, you would use a QR code detection library like:
    // - jsQR
    // - qr-scanner
    // - @zxing/library
    
    // For demo purposes, we'll simulate detection after scanning for a few seconds
    return null;
  };

  const requestCameraPermission = async (): Promise<boolean> => {
    try {
      setError(null);
      
      // Check if we're on HTTPS or localhost
      if (!isHttps) {
        setError('Camera access requires HTTPS. Please use a secure connection.');
        setCameraPermission('denied');
        setShowHttpsWarning(true);
        return false;
      }

      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError('Camera access is not supported in this browser.');
        setCameraPermission('denied');
        return false;
      }
      
      // Get available devices first
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = allDevices.filter(device => device.kind === 'videoinput');
      setDevices(videoDevices);

      if (videoDevices.length === 0) {
        setError('No camera found on this device.');
        setCameraPermission('denied');
        return false;
      }

      // Try to get camera access with back camera preference
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 },
          frameRate: { ideal: 30, min: 15 }
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setCurrentStream(stream);
      setCameraPermission('granted');
      setShowHttpsWarning(false);
      return true;
    } catch (err: any) {
      console.error('Camera permission error:', err);
      setCameraPermission('denied');
      
      let errorMessage = 'Unable to access camera. ';
      
      if (err.name === 'NotAllowedError') {
        errorMessage += 'Please enable camera permissions in your browser settings and refresh the page.';
      } else if (err.name === 'NotFoundError') {
        errorMessage += 'No camera found on this device.';
      } else if (err.name === 'NotSupportedError') {
        errorMessage += 'Camera not supported on this device.';
      } else if (err.name === 'NotReadableError') {
        errorMessage += 'Camera is being used by another application.';
      } else if (err.name === 'OverconstrainedError') {
        errorMessage += 'Camera does not meet the required specifications.';
      } else {
        errorMessage += 'Please try again or use a different device.';
      }
      
      setError(errorMessage);
      return false;
    }
  };

  const startCamera = async (): Promise<boolean> => {
    if (!videoRef.current) return false;

    try {
      const hasPermission = await requestCameraPermission();
      if (!hasPermission || !currentStream) return false;

      videoRef.current.srcObject = currentStream;
      
      return new Promise((resolve) => {
        if (!videoRef.current) {
          resolve(false);
          return;
        }

        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            videoRef.current.play()
              .then(() => {
                setScanning(true);
                setShowDemoPrompt(false);
                startQRDetection();
                resolve(true);
              })
              .catch((err) => {
                console.error('Error playing video:', err);
                setError('Failed to start camera preview.');
                resolve(false);
              });
          }
        };

        videoRef.current.onerror = () => {
          setError('Error loading camera stream.');
          resolve(false);
        };
      });
    } catch (error: any) {
      console.error('Error starting camera:', error);
      setError('Failed to start camera. Please try again.');
      return false;
    }
  };

  const startQRDetection = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    // Set canvas size to match video
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    // Start detection loop
    scanIntervalRef.current = setInterval(() => {
      if (!video || !ctx || video.readyState !== 4) return;

      try {
        // Draw video frame to canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Get image data for QR detection
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        // Attempt QR code detection
        const detectedWallet = detectQRCode(imageData);
        if (detectedWallet) {
          handleQRDetection(detectedWallet);
        }
      } catch (error) {
        console.error('Error during QR detection:', error);
      }
    }, 100); // Check every 100ms

    // Auto-demo after 5 seconds for demonstration
    detectionTimeoutRef.current = setTimeout(() => {
      if (scanning) {
        const sampleQRs = generateSampleQRCodes();
        const randomQR = sampleQRs[Math.floor(Math.random() * sampleQRs.length)];
        const walletData = parseQRCodeData(randomQR.data);
        if (walletData) {
          handleQRDetection(walletData);
        }
      }
    }, 5000);
  };

  const handleQRDetection = (walletData: WalletAddress) => {
    if (!scanning && !showDemoPrompt) return;

    console.log("Wallet detected:", walletData);
    
    // Stop scanning
    stopScanning();
    
    // Set detected wallet for confirmation
    setDetectedWallet(walletData);
    setPaymentAmount(walletData.amount || '');
    setShowDemoPrompt(false);
    
    // Detect route if wallet is connected
    if (isConnected && account?.address) {
      detectPaymentRoute(walletData);
    }
  };

  const detectPaymentRoute = async (walletData: WalletAddress) => {
    if (!account?.address) return;
    
    setIsLoadingRoute(true);
    setRouteError(null);
    
    try {
      // Create QR data string for the API
      const qrString = `ethereum:${walletData.address}@${walletData.chainId}?token=${walletData.network === 'ethereum' ? 'ETH' : 'USDC'}`;
      
      const routeResponse = await apiClient.detectRoute({
        userWallet: account.address,
        merchantQR: qrString,
        amount: paymentAmount || '1.0'
      });
      
      setRouteData(routeResponse);
    } catch (error: any) {
      console.error('Route detection failed:', error);
      setRouteError(error.message || 'Failed to detect payment route');
    } finally {
      setIsLoadingRoute(false);
    }
  };

  const handleSampleQRSelect = (qrData: string) => {
    const walletData = parseQRCodeData(qrData);
    if (walletData) {
      handleQRDetection(walletData);
    }
    setShowSampleQRs(false);
  };

  const handleDemoWallet = () => {
    // Create a demo Ethereum wallet with payment amount
    const demoWalletData: WalletAddress = {
      address: "0x742d35Cc6634C0532925a3b8D4C9db7C4C4C4C4C",
      network: "ethereum",
      amount: "1.0",
      isValid: true,
      chainId: 1
    };
    
    // Simulate immediate detection and proceed to confirmation
    setDetectedWallet(demoWalletData);
    setPaymentAmount("1.0");
    setShowDemoPrompt(false);
    
    // Auto-proceed to payment confirmation after a short delay
    setTimeout(() => {
      navigate("/payment-confirmation", { 
        state: { 
          from: "scan-to-pay",
          amount: requestedAmount,
          walletAddress: demoWalletData.address,
          network: demoWalletData.network,
          transactionHash: "0xdemo123456789abcdef",
          paymentAmount: "1.0"
        } 
      });
    }, 1500);
  };

  const stopScanning = () => {
    setScanning(false);
    
    // Clear detection interval
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }

    // Clear detection timeout
    if (detectionTimeoutRef.current) {
      clearTimeout(detectionTimeoutRef.current);
      detectionTimeoutRef.current = null;
    }

    // Stop video stream
    if (currentStream) {
      currentStream.getTracks().forEach(track => track.stop());
      setCurrentStream(null);
    }

    // Clear video element
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const retryCamera = async () => {
    setError(null);
    setCameraPermission('prompt');
    setDetectedWallet(null);
    setShowDemoPrompt(true);
    stopScanning();
    
    // Small delay before retrying
    setTimeout(async () => {
      await startCamera();
    }, 500);
  };

  const initializeCamera = async () => {
    if (isHttps && !showDemoPrompt) {
      await startCamera();
    }
  };

  // Initialize camera on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!showDemoPrompt) {
        initializeCamera();
      }
    }, 500);

    return () => {
      clearTimeout(timer);
      stopScanning();
    };
  }, [isHttps, showDemoPrompt]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const openHttpsInstructions = () => {
    window.open('https://web.dev/how-to-use-local-https/', '_blank');
  };

  const handleSendPayment = async () => {
    if (!detectedWallet || !paymentAmount || !isConnected) return;

    setIsProcessingPayment(true);
    setError(null);

    try {
      // Validate amount
      const validation = validateTransactionAmount(paymentAmount, detectedWallet.network);
      if (!validation.isValid) {
        setError(validation.error || 'Invalid amount');
        setIsProcessingPayment(false);
        return;
      }

      // Convert amount to appropriate units for the network
      let valueInWei = '';
      
      switch (detectedWallet.network) {
        case 'ethereum':
          // Convert ETH to wei
          valueInWei = (parseFloat(paymentAmount) * Math.pow(10, 18)).toString();
          break;
        case 'solana':
          // Convert SOL to lamports
          valueInWei = (parseFloat(paymentAmount) * Math.pow(10, 9)).toString();
          break;
        case 'algorand':
          // Convert ALGO to microAlgos
          valueInWei = (parseFloat(paymentAmount) * Math.pow(10, 6)).toString();
          break;
        default:
          valueInWei = paymentAmount;
      }

      // Send transaction using Reown WalletConnect
      const txHash = await sendTransaction(
        detectedWallet.address,
        valueInWei,
        undefined,
        detectedWallet.network
      );

      setTransactionHash(txHash);
      setPaymentSuccess(true);
      
      // Navigate to confirmation after a short delay
      setTimeout(() => {
        navigate("/payment-confirmation", { 
          state: { 
            from: "scan-to-pay",
            amount: requestedAmount,
            walletAddress: detectedWallet.address,
            network: detectedWallet.network,
            transactionHash: txHash,
            paymentAmount: paymentAmount
          } 
        });
      }, 2000);

    } catch (error: any) {
      console.error('Payment failed:', error);
      setError(handleWalletError(error));
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const estimatedFee = detectedWallet ? estimateTransactionFee(detectedWallet.network, paymentAmount) : '0';

  return (
    <div className="flex justify-center w-full bg-[#1F2024]">
      <div className="relative w-[393px] bg-[#1F2024] min-h-screen">
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

        <div className="flex flex-col h-screen pt-[58px] pb-[83px]">
          <div className="flex items-center px-4 mb-4">
            <button 
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-full bg-[#2C2D32] flex items-center justify-center mr-4"
            >
              <ArrowLeft size={20} className="text-white" />
            </button>
            <h1 className="text-2xl font-bold text-white">Scan & Pay</h1>
          </div>

          <div className="flex-1 relative px-4">
            {/* Wallet Connection Check */}
            {!isConnected && !showDemoPrompt && (
              <div className="mb-6 p-6 bg-orange-500/10 border border-orange-500/20 rounded-xl">
                <div className="flex items-center mb-4">
                  <Wallet size={24} className="text-orange-500 mr-3" />
                  <h3 className="text-white font-semibold">Wallet Required</h3>
                </div>
                
                <p className="text-orange-400 text-sm mb-4">
                  Please connect your wallet to send payments. You can scan QR codes without a wallet, but you'll need one connected to send transactions.
                </p>
                
                <button
                  onClick={() => navigate('/payments')}
                  className="w-full bg-orange-500/20 text-orange-400 py-3 rounded-xl font-semibold hover:bg-orange-500/30 transition-colors"
                >
                  Connect Wallet
                </button>
              </div>
            )}

            {/* Demo Prompt */}
            {showDemoPrompt && !detectedWallet && (
              <div className="mb-6 p-6 bg-gradient-to-r from-[#CBAB58]/20 to-[#E1C87D]/20 border border-[#CBAB58]/30 rounded-xl">
                <div className="flex items-center mb-4">
                  <QrCode size={24} className="text-[#CBAB58] mr-3" />
                  <h3 className="text-white font-semibold">Scan Wallet QR Code</h3>
                </div>
                
                <p className="text-white/80 text-sm mb-4">
                  Point your camera at a wallet QR code to detect the address and send payments. Supports Ethereum, Bitcoin, Solana, and Algorand.
                </p>
                
                <div className="space-y-3">
                  <button
                    onClick={handleDemoWallet}
                    className="w-full bg-[#CBAB58] text-[#1F2024] py-3 rounded-xl font-semibold hover:bg-[#b69843] transition-colors flex items-center justify-center"
                  >
                    <Wallet size={20} className="mr-2" />
                    Try Demo Ethereum Payment
                  </button>
                  
                  <div className="flex space-x-3">
                    <button
                      onClick={() => {
                        setShowDemoPrompt(false);
                        if (isHttps) {
                          initializeCamera();
                        }
                      }}
                      className="flex-1 bg-[#2C2D32] text-white py-3 rounded-xl font-medium hover:bg-[#71727A] transition-colors flex items-center justify-center"
                    >
                      <Camera size={20} className="mr-2" />
                      Use Camera
                    </button>
                    
                    <button
                      onClick={() => setShowSampleQRs(!showSampleQRs)}
                      className="flex-1 bg-[#2C2D32] text-white py-3 rounded-xl font-medium hover:bg-[#71727A] transition-colors"
                    >
                      More Options
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* HTTPS Warning */}
            {showHttpsWarning && !showDemoPrompt && (
              <div className="mb-6 p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl">
                <div className="flex items-start">
                  <Shield size={20} className="text-orange-500 mr-3 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-orange-500 text-sm font-medium mb-2">HTTPS Required</p>
                    <p className="text-orange-400 text-xs mb-3">
                      Camera access requires a secure connection (HTTPS). For development, you can:
                    </p>
                    <div className="space-y-2 mb-3">
                      <p className="text-orange-400 text-xs">• Use localhost (already secure)</p>
                      <p className="text-orange-400 text-xs">• Set up HTTPS for development</p>
                      <p className="text-orange-400 text-xs">• Deploy to a secure hosting service</p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={openHttpsInstructions}
                        className="flex items-center bg-orange-500/20 text-orange-400 px-3 py-2 rounded-lg text-sm hover:bg-orange-500/30 transition-colors"
                      >
                        <Globe size={16} className="mr-2" />
                        Setup Guide
                      </button>
                      <button
                        onClick={() => {
                          setShowHttpsWarning(false);
                          setShowDemoPrompt(true);
                        }}
                        className="bg-orange-500/20 text-orange-400 px-3 py-2 rounded-lg text-sm hover:bg-orange-500/30 transition-colors"
                      >
                        Continue Demo
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Success */}
            {paymentSuccess && (
              <div className="mb-6 p-6 bg-green-500/10 border border-green-500/20 rounded-xl">
                <div className="flex items-center mb-4">
                  <CheckCircle size={24} className="text-green-500 mr-3" />
                  <h3 className="text-white font-semibold">Payment Sent!</h3>
                </div>
                
                <p className="text-green-400 text-sm mb-4">
                  Your payment has been successfully sent to the blockchain.
                </p>
                
                {transactionHash && (
                  <div className="bg-[#2C2D32] p-3 rounded-lg">
                    <p className="text-[#71727A] text-xs mb-1">Transaction Hash:</p>
                    <div className="flex items-center justify-between">
                      <p className="text-white font-mono text-sm">
                        {formatAddressForDisplay(transactionHash, 8, 8)}
                      </p>
                      <button
                        onClick={() => copyToClipboard(transactionHash)}
                        className="p-1 rounded hover:bg-[#1F2024] transition-colors"
                      >
                        <Copy size={14} className="text-[#71727A]" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Wallet Detection Result */}
            {detectedWallet && !paymentSuccess && !showDemoPrompt && (
              <div className="mb-6 p-6 bg-[#2C2D32] rounded-xl border border-[#CBAB58]">
                <div className="flex items-center mb-4">
                  <CheckCircle size={24} className="text-[#CBAB58] mr-3" />
                  <h3 className="text-white font-semibold">Wallet Detected!</h3>
                </div>
                
                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-[#71727A]">Network:</span>
                    <div className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-2" 
                        style={{ backgroundColor: getNetworkColor(detectedWallet.network) }}
                      />
                      <span className="text-white font-medium">
                        {getNetworkDisplayName(detectedWallet.network)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-[#71727A]">Address:</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-white font-mono text-sm">
                        {formatAddressForDisplay(detectedWallet.address)}
                      </span>
                      <button
                        onClick={() => copyToClipboard(detectedWallet.address)}
                        className="p-1 rounded hover:bg-[#1F2024] transition-colors"
                      >
                        <Copy size={14} className="text-[#71727A]" />
                      </button>
                    </div>
                  </div>

                  {/* Amount Input */}
                  <div>
                    <label className="block text-[#71727A] mb-2">
                      Amount ({getNetworkDisplayName(detectedWallet.network)})
                    </label>
                    <div className="relative">
                      <DollarSign size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#71727A]" />
                      <input
                        type="number"
                        step="any"
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full h-12 pl-10 pr-4 bg-[#1F2024] text-white rounded-xl border border-[#71727A] focus:border-[#CBAB58] focus:outline-none"
                      />
                    </div>
                    {paymentAmount && (
                      <p className="text-[#71727A] text-xs mt-1">
                        Estimated fee: {estimatedFee} {getNetworkDisplayName(detectedWallet.network)}
                      </p>
                    )}
                  </div>

                  {/* Route Information */}
                  {isLoadingRoute && (
                    <div className="bg-[#1F2024] p-4 rounded-xl">
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#CBAB58] mr-3"></div>
                        <span className="text-white">Detecting best payment route...</span>
                      </div>
                    </div>
                  )}

                  {routeError && (
                    <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl">
                      <div className="flex items-center">
                        <AlertCircle size={20} className="text-red-500 mr-3" />
                        <div>
                          <p className="text-red-500 text-sm font-medium">Route Detection Failed</p>
                          <p className="text-red-400 text-xs">{routeError}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {routeData && !isLoadingRoute && (
                    <div className="bg-[#1F2024] p-4 rounded-xl">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-white font-medium">Recommended Route</h4>
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: routeData.recommendedPath.color }}
                        />
                      </div>
                      
                      {(() => {
                        const routeDisplay = formatRouteDisplay(routeData.recommendedPath);
                        return (
                          <div>
                            <p className="text-white font-medium">{routeDisplay.title}</p>
                            <p className="text-[#71727A] text-sm">{routeDisplay.description}</p>
                            {routeDisplay.canProceed && (
                              <div className="flex justify-between mt-2 text-xs">
                                <span className="text-[#CBAB58]">Time: {routeDisplay.estimatedTime}</span>
                                <span className="text-[#CBAB58]">Cost: {routeDisplay.estimatedCost}</span>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={handleSendPayment}
                    disabled={!paymentAmount || !isConnected || isProcessingPayment || (routeData && !formatRouteDisplay(routeData.recommendedPath).canProceed)}
                    className={`flex-1 py-3 rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center ${
                      routeData && !formatRouteDisplay(routeData.recommendedPath).canProceed
                        ? 'bg-[#71727A] text-white'
                        : 'bg-[#CBAB58] text-[#1F2024] hover:bg-[#b69843]'
                    }`}
                  >
                    {isProcessingPayment ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#1F2024] mr-2"></div>
                        Sending...
                      </>
                    ) : routeData && !formatRouteDisplay(routeData.recommendedPath).canProceed ? (
                      'Cannot Send'
                    ) : (
                      <>
                        <Send size={20} className="mr-2" />
                        Send Payment
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setDetectedWallet(null);
                      setPaymentAmount('');
                      setRouteData(null);
                      setRouteError(null);
                      setShowDemoPrompt(true);
                    }}
                    className="px-4 py-3 bg-[#1F2024] text-white rounded-xl font-medium hover:bg-[#71727A] transition-colors"
                  >
                    Scan Again
                  </button>
                </div>
              </div>
            )}

            {/* Demo Processing State */}
            {detectedWallet && showDemoPrompt && (
              <div className="mb-6 p-6 bg-[#CBAB58]/10 border border-[#CBAB58] rounded-xl">
                <div className="flex items-center mb-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#CBAB58] mr-3"></div>
                  <h3 className="text-white font-semibold">Processing Demo Payment...</h3>
                </div>
                
                <p className="text-white/80 text-sm">
                  Simulating Ethereum payment to {formatAddressForDisplay(detectedWallet.address)}
                </p>
              </div>
            )}

            {/* Instructions */}
            {!detectedWallet && !showDemoPrompt && isHttps && (
              <div className="flex items-center justify-center bg-[#2C2D32] px-4 py-3 rounded-xl mb-6">
                <Camera size={20} className="text-[#CBAB58] mr-2 flex-shrink-0" />
                <span className="text-white text-sm text-center">
                  Point your camera at a wallet QR code
                </span>
              </div>
            )}

            {/* Error Display */}
            {error && !detectedWallet && !showDemoPrompt && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                <div className="flex items-start">
                  <AlertCircle size={20} className="text-red-500 mr-3 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-red-500 text-sm font-medium mb-2">Camera Error</p>
                    <p className="text-red-400 text-xs mb-3">{error}</p>
                    <div className="flex space-x-2">
                      {isHttps && (
                        <button
                          onClick={retryCamera}
                          className="flex items-center bg-red-500/20 text-red-400 px-3 py-2 rounded-lg text-sm hover:bg-red-500/30 transition-colors"
                        >
                          <RefreshCw size={16} className="mr-2" />
                          Try Again
                        </button>
                      )}
                      <button
                        onClick={() => setShowDemoPrompt(true)}
                        className="bg-red-500/20 text-red-400 px-3 py-2 rounded-lg text-sm hover:bg-red-500/30 transition-colors"
                      >
                        Use Demo
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Camera Permission Prompt */}
            {cameraPermission === 'prompt' && !scanning && !error && !detectedWallet && !showDemoPrompt && isHttps && (
              <div className="flex flex-col items-center justify-center bg-[#2C2D32] rounded-xl p-8 mb-6">
                <Camera size={48} className="text-[#CBAB58] mb-4" />
                <h3 className="text-white text-lg font-semibold mb-2">Camera Access Required</h3>
                <p className="text-[#71727A] text-center mb-4">
                  We need access to your camera to scan wallet QR codes
                </p>
                <button
                  onClick={initializeCamera}
                  className="bg-[#CBAB58] text-[#1F2024] px-6 py-3 rounded-xl font-semibold hover:bg-[#b69843] transition-colors"
                >
                  Enable Camera
                </button>
              </div>
            )}

            {/* Camera View */}
            {!detectedWallet && !showDemoPrompt && isHttps && (
              <div className="relative mb-6">
                {scanning && (
                  <div className="mb-4 text-center">
                    <div className="inline-flex items-center bg-[#CBAB58]/20 text-[#CBAB58] px-4 py-2 rounded-full">
                      <div className="w-2 h-2 bg-[#CBAB58] rounded-full animate-pulse mr-2"></div>
                      <span className="text-sm font-medium">Scanning for wallet QR codes...</span>
                    </div>
                  </div>
                )}
                
                <div className="relative w-full max-w-[320px] mx-auto rounded-xl overflow-hidden bg-[#2C2D32]">
                  <video
                    ref={videoRef}
                    className="w-full h-[320px] object-cover"
                    playsInline
                    muted
                    style={{ display: scanning ? 'block' : 'none' }}
                  />
                  
                  <canvas
                    ref={canvasRef}
                    className="hidden"
                  />
                  
                  {!scanning && cameraPermission === 'granted' && !error && (
                    <div className="w-full h-[320px] flex items-center justify-center">
                      <div className="text-center">
                        <Camera size={48} className="text-[#71727A] mx-auto mb-4" />
                        <p className="text-[#71727A]">Initializing camera...</p>
                      </div>
                    </div>
                  )}
                  
                  {scanning && (
                    <div className="absolute inset-0 pointer-events-none">
                      {/* Scanning overlay corners */}
                      <div className="absolute top-8 left-8 w-6 h-6 border-t-2 border-l-2 border-[#CBAB58]"></div>
                      <div className="absolute top-8 right-8 w-6 h-6 border-t-2 border-r-2 border-[#CBAB58]"></div>
                      <div className="absolute bottom-8 left-8 w-6 h-6 border-b-2 border-l-2 border-[#CBAB58]"></div>
                      <div className="absolute bottom-8 right-8 w-6 h-6 border-b-2 border-r-2 border-[#CBAB58]"></div>
                      
                      {/* Scanning line animation */}
                      <div className="absolute inset-x-8 top-8 bottom-8">
                        <div className="w-full h-0.5 bg-[#CBAB58] scan-line"></div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Demo info during scanning */}
                {scanning && (
                  <div className="mt-4 text-center">
                    <p className="text-[#71727A] text-sm">
                      Demo: Auto-detection will occur in a few seconds
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Sample QR Codes */}
            {showSampleQRs && (
              <div className="bg-[#2C2D32] rounded-xl p-4 mb-6">
                <h3 className="text-white font-medium mb-3">Sample Wallet QR Codes</h3>
                <div className="space-y-2">
                  {generateSampleQRCodes().map((sample, index) => (
                    <button
                      key={index}
                      onClick={() => handleSampleQRSelect(sample.data)}
                      className="w-full p-3 bg-[#1F2024] rounded-lg text-left hover:bg-[#71727A]/20 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-medium">{sample.label}</p>
                          <p className="text-[#71727A] text-sm font-mono">
                            {formatAddressForDisplay(sample.data)}
                          </p>
                          {sample.amount !== '0' && (
                            <p className="text-[#CBAB58] text-xs">
                              Amount: {sample.amount} {getNetworkDisplayName(sample.network)}
                            </p>
                          )}
                        </div>
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: getNetworkColor(sample.network) }}
                        />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <NavigationBar />
      </div>
    </div>
  );
};