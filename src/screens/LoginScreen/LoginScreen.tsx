import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "../../components/ui/card";
import { 
  signInWithGoogle, 
  signInWithApple, 
  signInWithEmail, 
  signUpWithEmail, 
  signInWithMagicLink,
  signInDemo 
} from "../../lib/auth";
import { Mail, ArrowRight, Chrome, Apple, Zap, Shield, Users, Globe } from "lucide-react";

export const LoginScreen = (): JSX.Element => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [isAppleSupported, setIsAppleSupported] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if Apple Sign In is supported (iOS/macOS Safari)
    const isAppleDevice = /iPad|iPhone|iPod|Macintosh/.test(navigator.userAgent);
    const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
    setIsAppleSupported(isAppleDevice && isSafari);
  }, []);

  const handleGoogleSignIn = async () => {
    setLoadingProvider('google');
    setError(null);

    try {
      await signInWithGoogle();
      // Redirect will be handled by Supabase
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Google');
    } finally {
      setLoadingProvider(null);
    }
  };

  const handleAppleSignIn = async () => {
    setLoadingProvider('apple');
    setError(null);

    try {
      await signInWithApple();
      // Redirect will be handled by Supabase
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Apple');
    } finally {
      setLoadingProvider(null);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (isSignUp) {
        await signUpWithEmail(email, password, firstName);
        setSuccess("Account created! Please check your email to verify your account.");
      } else {
        const { data } = await signInWithEmail(email, password);
        if (data.user) {
          navigate("/home");
        }
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMagicLink = async () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await signInWithMagicLink(email);
      setSuccess("Magic link sent! Check your email to sign in.");
    } catch (err: any) {
      setError(err.message || 'Failed to send magic link');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoSignIn = async () => {
    setLoadingProvider('demo');
    setError(null);

    try {
      await signInDemo();
      navigate("/home");
    } catch (err: any) {
      setError(err.message || 'Demo sign in failed');
    } finally {
      setLoadingProvider(null);
    }
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

            {/* Login Form */}
            <div className="flex flex-col items-center px-8 pt-[72px]">
              <div className="w-[257px] h-[260px] mb-[72px] bg-[url(/screenshot-2025-02-02-at-10-49-52-am-3.png)] bg-[100%_100%]" />
              
              <Card className="w-full border-none bg-transparent shadow-none">
                <CardContent className="p-0 space-y-6">
                  <div className="text-center mb-6">
                    <h2 className="text-white text-2xl font-semibold">Welcome to AURUM</h2>
                    <p className="text-[#71727A] mt-2">
                      Sign in to start making payments and collect rewards
                    </p>
                  </div>

                  {/* Social Sign In Buttons */}
                  {!showEmailForm && (
                    <div className="space-y-4">
                      {/* Google Sign In */}
                      <button
                        onClick={handleGoogleSignIn}
                        disabled={loadingProvider === 'google'}
                        className="w-full h-[52px] bg-white text-[#1F2024] rounded-[14px] font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center disabled:opacity-50"
                      >
                        {loadingProvider === 'google' ? (
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#1F2024] mr-2"></div>
                        ) : (
                          <Chrome size={20} className="mr-3" />
                        )}
                        Continue with Google
                      </button>

                      {/* Apple Sign In */}
                      {isAppleSupported && (
                        <button
                          onClick={handleAppleSignIn}
                          disabled={loadingProvider === 'apple'}
                          className="w-full h-[52px] bg-black text-white rounded-[14px] font-semibold hover:bg-gray-900 transition-colors flex items-center justify-center disabled:opacity-50"
                        >
                          {loadingProvider === 'apple' ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          ) : (
                            <Apple size={20} className="mr-3" />
                          )}
                          Continue with Apple
                        </button>
                      )}

                      {/* Email Option */}
                      <button
                        onClick={() => setShowEmailForm(true)}
                        className="w-full h-[52px] bg-[#2C2D32] text-white rounded-[14px] font-semibold hover:bg-[#3C3D42] transition-colors flex items-center justify-center"
                      >
                        <Mail size={20} className="mr-3" />
                        Continue with Email
                      </button>

                      {/* Divider */}
                      <div className="flex items-center my-6">
                        <div className="flex-1 border-t border-[#2C2D32]"></div>
                        <span className="px-4 text-[#71727A] text-sm">or</span>
                        <div className="flex-1 border-t border-[#2C2D32]"></div>
                      </div>

                      {/* Demo Sign In */}
                      <button
                        onClick={handleDemoSignIn}
                        disabled={loadingProvider === 'demo'}
                        className="w-full h-[52px] bg-[#CBAB58] text-[#1F2024] rounded-[14px] font-semibold hover:bg-[#b69843] transition-colors flex items-center justify-center disabled:opacity-50"
                      >
                        {loadingProvider === 'demo' ? (
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#1F2024] mr-2"></div>
                        ) : (
                          <Zap size={20} className="mr-3" />
                        )}
                        Try Demo Account
                      </button>
                    </div>
                  )}

                  {/* Email Form */}
                  {showEmailForm && (
                    <form onSubmit={handleEmailSubmit} className="space-y-4">
                      {isSignUp && (
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="First Name"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            className="w-full h-[52px] px-6 text-white bg-[#2C2D32] rounded-[14px] border-2 border-[#2C2D32] focus:border-[#CBAB58] focus:outline-none placeholder:text-[#71727A]"
                            required={isSignUp}
                            disabled={isLoading}
                          />
                        </div>
                      )}
                      
                      <div className="relative">
                        <Mail size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#71727A]" />
                        <input
                          type="email"
                          placeholder="Email address"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full h-[52px] pl-12 pr-6 text-white bg-[#2C2D32] rounded-[14px] border-2 border-[#2C2D32] focus:border-[#CBAB58] focus:outline-none placeholder:text-[#71727A]"
                          required
                          disabled={isLoading}
                        />
                      </div>

                      <div className="relative">
                        <input
                          type="password"
                          placeholder="Password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full h-[52px] px-6 text-white bg-[#2C2D32] rounded-[14px] border-2 border-[#2C2D32] focus:border-[#CBAB58] focus:outline-none placeholder:text-[#71727A]"
                          required
                          disabled={isLoading}
                          minLength={6}
                        />
                      </div>

                      <button 
                        type="submit"
                        className="w-full h-[52px] text-[#1F2024] text-[17px] font-semibold rounded-[14px] bg-[#CBAB58] hover:bg-[#b69843] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <div className="flex items-center">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#1F2024] mr-2"></div>
                            {isSignUp ? 'Creating Account...' : 'Signing In...'}
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
                            <ArrowRight size={20} className="ml-2" />
                          </div>
                        )}
                      </button>

                      {/* Magic Link Option */}
                      <button
                        type="button"
                        onClick={handleMagicLink}
                        disabled={isLoading}
                        className="w-full text-[#CBAB58] text-sm font-medium hover:underline"
                      >
                        Send Magic Link Instead
                      </button>

                      {/* Back to Social */}
                      <button
                        type="button"
                        onClick={() => setShowEmailForm(false)}
                        className="w-full text-[#71727A] text-sm font-medium hover:underline"
                      >
                        ← Back to Social Sign In
                      </button>
                    </form>
                  )}

                  {error && (
                    <div className="text-red-500 text-sm text-center bg-red-500/10 p-3 rounded-lg">
                      {error}
                    </div>
                  )}

                  {success && (
                    <div className="text-green-500 text-sm text-center bg-green-500/10 p-3 rounded-lg flex items-center justify-center">
                      <Mail size={16} className="mr-2" />
                      {success}
                    </div>
                  )}

                  {showEmailForm && (
                    <div className="text-center">
                      <span className="text-[#71727A]">
                        {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
                      </span>
                      <button 
                        onClick={() => {
                          setIsSignUp(!isSignUp);
                          setError(null);
                          setSuccess(null);
                          setFirstName('');
                          setPassword('');
                        }}
                        className="text-[#CBAB58] font-semibold hover:underline"
                        disabled={isLoading}
                      >
                        {isSignUp ? 'Sign In' : 'Sign Up'}
                      </button>
                    </div>
                  )}

                  {/* Features */}
                  <div className="pt-6 border-t border-[#2C2D32]">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="flex flex-col items-center">
                        <Shield size={24} className="text-[#CBAB58] mb-2" />
                        <p className="text-[#71727A] text-xs">Secure</p>
                      </div>
                      <div className="flex flex-col items-center">
                        <Users size={24} className="text-[#CBAB58] mb-2" />
                        <p className="text-[#71727A] text-xs">Social</p>
                      </div>
                      <div className="flex flex-col items-center">
                        <Globe size={24} className="text-[#CBAB58] mb-2" />
                        <p className="text-[#71727A] text-xs">Global</p>
                      </div>
                    </div>
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