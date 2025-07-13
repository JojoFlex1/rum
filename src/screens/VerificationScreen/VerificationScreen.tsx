import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "../../components/ui/card";
import { verifyOTP, resendOTP } from "../../lib/auth";
import { ArrowLeft, Mail, RefreshCw } from "lucide-react";

export const VerificationScreen = (): JSX.Element => {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(60);
  const navigate = useNavigate();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const email = localStorage.getItem('userEmail') || '';
  const isNewUser = localStorage.getItem('isNewUser') === 'true';

  useEffect(() => {
    // Focus first input on mount
    setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 100);

    // Start countdown timer
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleInputChange = (index: number, value: string) => {
    // Only allow single digits
    if (value.length > 1) {
      value = value.slice(-1);
    }
    
    // Only allow numbers
    if (value && !/^\d$/.test(value)) {
      return;
    }
    
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input if value is entered
    if (value && index < 5) {
      setTimeout(() => {
        inputRefs.current[index + 1]?.focus();
      }, 10);
    }

    // Auto-submit when all fields are filled
    if (newCode.every(digit => digit !== "") && newCode.join("").length === 6) {
      setTimeout(() => {
        handleVerify(newCode.join(""));
      }, 100);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    // Handle backspace
    if (e.key === 'Backspace') {
      e.preventDefault();
      const newCode = [...code];
      
      if (code[index]) {
        // Clear current field
        newCode[index] = '';
        setCode(newCode);
      } else if (index > 0) {
        // Move to previous field and clear it
        newCode[index - 1] = '';
        setCode(newCode);
        setTimeout(() => {
          inputRefs.current[index - 1]?.focus();
        }, 10);
      }
    }
    
    // Handle arrow keys
    if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
    }
    
    if (e.key === 'ArrowRight' && index < 5) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
    }
    
    // Handle Enter key
    if (e.key === 'Enter') {
      e.preventDefault();
      handleVerify();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    
    if (pastedData.length === 6) {
      const newCode = pastedData.split('');
      setCode(newCode);
      // Focus last input
      setTimeout(() => {
        inputRefs.current[5]?.focus();
      }, 10);
      // Auto-verify after paste
      setTimeout(() => {
        handleVerify(pastedData);
      }, 100);
    }
  };

  const handleVerify = async (verificationCode?: string) => {
    const codeToVerify = verificationCode || code.join("");
    
    if (codeToVerify.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { user, session } = await verifyOTP(email, codeToVerify);
      
      if (session && user) {
        // Clear stored data
        localStorage.removeItem('userEmail');
        localStorage.removeItem('isNewUser');
        
        // Navigate based on user status
        const needsProfile = isNewUser || !user.user_metadata?.first_name;
        
        if (needsProfile) {
          navigate("/create-profile");
        } else {
          navigate("/home");
        }
      }
    } catch (err: any) {
      setError(err.message || 'Invalid verification code');
      // Clear the code on error
      setCode(["", "", "", "", "", ""]);
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (timeLeft > 0) return;
    
    setIsResending(true);
    setError(null);

    try {
      await resendOTP(email);
      setTimeLeft(60);
      setCode(["", "", "", "", "", ""]);
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    } catch (err: any) {
      setError(err.message || 'Failed to resend code');
    } finally {
      setIsResending(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex justify-center w-full bg-[#1F2024]">
      <div className="relative w-[393px] h-[853px] overflow-hidden">
        <div className="w-full h-full">
          <div className="relative w-full h-full">
            {/* Status Bar */}
            <header className="relative h-[42px] bg-[#1F2024] backdrop-blur-[20px] backdrop-brightness-[100%] [-webkit-backdrop-filter:blur(20px)_brightness(100%)]">
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

            {/* Verification Form */}
            <div className="flex flex-col items-center px-8 pt-[72px]">
              <div className="w-[257px] h-[260px] mb-[72px] bg-[url(/screenshot-2025-02-02-at-10-49-52-am-3.png)] bg-[100%_100%]" />
              
              <Card className="w-full border-none bg-transparent shadow-none">
                <CardContent className="p-0 space-y-6">
                  <div className="flex items-center mb-6">
                    <button 
                      onClick={() => navigate("/login")}
                      className="w-10 h-10 rounded-full bg-[#2C2D32] flex items-center justify-center mr-4"
                    >
                      <ArrowLeft size={20} className="text-white" />
                    </button>
                    <div>
                      <h2 className="text-white text-2xl font-semibold">Enter Verification Code</h2>
                    </div>
                  </div>

                  <div className="text-center mb-8">
                    <div className="flex items-center justify-center mb-4">
                      <div className="w-12 h-12 rounded-full bg-[#CBAB58]/20 flex items-center justify-center">
                        <Mail size={24} className="text-[#CBAB58]" />
                      </div>
                    </div>
                    <p className="text-[#71727A]">
                      We've sent a 6-digit verification code to
                    </p>
                    <p className="text-white font-medium">{email}</p>
                  </div>

                  <div className="space-y-6">
                    {/* OTP Input */}
                    <div className="flex justify-center space-x-3">
                      {code.map((digit, index) => (
                        <input
                          key={index}
                          ref={(el) => (inputRefs.current[index] = el)}
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleInputChange(index, e.target.value)}
                          onKeyDown={(e) => handleKeyDown(index, e)}
                          onPaste={index === 0 ? handlePaste : undefined}
                          className="w-12 h-12 text-center text-white text-xl font-semibold bg-[#2C2D32] rounded-xl border-2 border-[#2C2D32] focus:border-[#CBAB58] focus:outline-none transition-colors"
                          disabled={isLoading}
                          autoComplete="off"
                          autoCorrect="off"
                          autoCapitalize="off"
                          spellCheck="false"
                        />
                      ))}
                    </div>

                    {error && (
                      <div className="text-red-500 text-sm text-center bg-red-500/10 p-3 rounded-lg">
                        {error}
                      </div>
                    )}

                    <button 
                      onClick={() => handleVerify()}
                      className="w-full h-[52px] text-[#1F2024] text-[17px] font-semibold rounded-[14px] bg-[#CBAB58] hover:bg-[#b69843] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      disabled={isLoading || code.some(digit => !digit)}
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#1F2024] mr-2"></div>
                          Verifying...
                        </div>
                      ) : (
                        'Verify Code'
                      )}
                    </button>
                  </div>

                  <div className="text-center">
                    <p className="text-[#71727A] text-sm mb-2">
                      Didn't receive the code?
                    </p>
                    {timeLeft > 0 ? (
                      <p className="text-[#71727A] text-sm">
                        Resend code in {formatTime(timeLeft)}
                      </p>
                    ) : (
                      <button 
                        onClick={handleResendCode}
                        disabled={isResending}
                        className="text-[#CBAB58] font-semibold hover:underline disabled:opacity-50 flex items-center justify-center mx-auto"
                      >
                        {isResending ? (
                          <>
                            <RefreshCw size={16} className="mr-2 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          'Resend Code'
                        )}
                      </button>
                    )}
                  </div>

                  <div className="text-center pt-4">
                    <p className="text-[#71727A] text-xs">
                      Check your spam folder if you don't see the email
                    </p>
                  </div>

                  {/* Demo Bypass Button */}
                  <div className="text-center pt-6 border-t border-[#2C2D32]">
                    <button 
                      onClick={() => navigate("/home")}
                      className="text-[#CBAB58] text-sm font-medium hover:underline"
                      disabled={isLoading}
                    >
                      DEMO - Skip Verification
                    </button>
                    <p className="text-[#71727A] text-xs mt-1">
                      For demonstration purposes only
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};