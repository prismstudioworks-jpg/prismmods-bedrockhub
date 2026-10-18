import React, { useState, useEffect } from 'react';
import { MemberUser } from '../types/addon';
import { 
  X, Check, LogIn, UserPlus, 
  ArrowRight, Upload, Camera, Shield, KeyRound, Mail, Lock
} from 'lucide-react';
import { processImageFile } from '../utils/imageHelper';
import { 
  getSavedAccounts, saveAccount, findAccountByEmailOrUsername, sendPinRecoveryEmail 
} from '../utils/storage';
import { 
  OFFICIAL_MINECRAFT_CHARACTERS, 
  getMinecraftCharacterAvatar, 
  getRandomMinecraftCharacter 
} from '../utils/minecraftAvatars';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: MemberUser) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  // Mode: 'login' (already has account) or 'signin' (new account registration)
  const [authMode, setAuthMode] = useState<'login' | 'signin'>('signin');

  // Sign In Method: 'email_password' (Option 1) or 'email_password_pin' (Option 2 - Tagged "safer")
  const [signInOption, setSignInOption] = useState<'email_password' | 'email_password_pin'>('email_password');

  // Common form fields
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [pinCode, setPinCode] = useState(''); // 6-digit pin code
  // Default to official Steve character avatar
  const [selectedAvatar, setSelectedAvatar] = useState(OFFICIAL_MINECRAFT_CHARACTERS[0].svgDataUri);
  const [hasManuallySelectedAvatar, setHasManuallySelectedAvatar] = useState(false);
  const [customAvatar1x1, setCustomAvatar1x1] = useState<string>('');
  const [isProcessing1x1, setIsProcessing1x1] = useState(false);

  // Log In fields
  const [loginIdentifier, setLoginIdentifier] = useState(''); // email or username
  const [loginPassword, setLoginPassword] = useState('');
  const [loginPin, setLoginPin] = useState('');
  const [savedAccounts, setSavedAccounts] = useState<MemberUser[]>([]);

  // Messages & Toasts
  const [error, setError] = useState('');
  const [pinSentNotice, setPinSentNotice] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSavedAccounts(getSavedAccounts());
      setError('');
      setPinSentNotice(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // 1x1 Custom Photo Upload handler
  const handlePhotoUpload1x1 = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsProcessing1x1(true);
      setError('');
      // Force 1:1 square crop and compression (256x256 px)
      const cropped1x1DataUrl = await processImageFile(file, 256, 256, 0.9);
      setCustomAvatar1x1(cropped1x1DataUrl);
      setSelectedAvatar(cropped1x1DataUrl);
    } catch {
      setError('Could not process 1:1 image. Please select another image.');
    } finally {
      setIsProcessing1x1(false);
    }
  };

  // Forgot PIN handler - sends PIN to the email
  const handleForgotPin = (targetEmail?: string) => {
    const emailToUse = targetEmail || email || loginIdentifier;
    if (!emailToUse.trim()) {
      setError('Please provide your email address to recover your PIN code');
      return;
    }

    const res = sendPinRecoveryEmail(emailToUse.trim());
    setPinSentNotice(`Your 6-digit PIN code has been sent to ${emailToUse.trim()} (PIN: ${res.pin})`);
    setError('');
  };

  // Handle New Account Sign In (Registration)
  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    if (!username.trim()) {
      setError('Please choose a custom username');
      return;
    }

    const cleanUsername = username.trim().replace(/[^a-zA-Z0-9_]/g, '');
    if (cleanUsername.length < 3) {
      setError('Username must be at least 3 characters (letters, numbers, underscores)');
      return;
    }

    if (!password.trim() || password.length < 4) {
      setError('Please enter a custom password (at least 4 characters)');
      return;
    }

    // Option 2 requires a 6-digit PIN code
    if (signInOption === 'email_password_pin') {
      const cleanPin = pinCode.replace(/\D/g, '');
      if (cleanPin.length !== 6) {
        setError('Please enter exactly 6 digits for your PIN code');
        return;
      }
    }

    const finalAvatar = customAvatar1x1 || selectedAvatar;
    const isSafer = signInOption === 'email_password_pin';

    const newUser: MemberUser = {
      id: 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      username: cleanUsername,
      displayName: displayName.trim() || cleanUsername,
      email: email.trim().toLowerCase(),
      password: password,
      pinCode: isSafer ? pinCode.replace(/\D/g, '').slice(0, 6) : undefined,
      isSaferPin: isSafer,
      avatar: finalAvatar,
      joinedAt: Date.now(),
    };

    saveAccount(newUser);
    onSuccess(newUser);
    onClose();
  };

  // Handle Existing Account Log In
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginIdentifier.trim()) {
      setError('Please enter your email or username');
      return;
    }

    const target = findAccountByEmailOrUsername(loginIdentifier.trim());
    if (target) {
      if (target.password && loginPassword && target.password !== loginPassword) {
        setError('Incorrect password. Please try again.');
        return;
      }
      if (target.isSaferPin && target.pinCode) {
        if (loginPin && loginPin !== target.pinCode) {
          setError('Incorrect 6-digit PIN code. Tap "I forgot my pin" to recover it.');
          return;
        }
      }
      onSuccess(target);
      onClose();
      return;
    }

    // Allow logging in with that email/username
    const loggedInUser: MemberUser = {
      id: 'usr_' + Date.now(),
      username: loginIdentifier.trim().includes('@') ? loginIdentifier.split('@')[0] : loginIdentifier.trim(),
      displayName: loginIdentifier.trim(),
      email: loginIdentifier.includes('@') ? loginIdentifier.trim() : undefined,
      password: loginPassword || undefined,
      avatar: getMinecraftCharacterAvatar(loginIdentifier),
      joinedAt: Date.now(),
    };
    saveAccount(loggedInUser);
    onSuccess(loggedInUser);
    onClose();
  };

  const handleQuickGuest = () => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const randomChar = getRandomMinecraftCharacter();
    const guestUser: MemberUser = {
      id: 'usr_' + Date.now(),
      username: `Bedrocker_${randomNum}`,
      displayName: `${randomChar.name}_${randomNum}`,
      avatar: randomChar.svgDataUri,
      joinedAt: Date.now(),
    };
    saveAccount(guestUser);
    onSuccess(guestUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl p-5 sm:p-7 max-h-[92vh] overflow-y-auto text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-cyan-400" />
              <span>Visitor Member Account</span>
            </h2>
            <p className="text-xs text-slate-400">
              Personal sign in, reviews, custom usernames & profile photo
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition border border-slate-700 flex items-center gap-1.5"
            title="Cancel and close dialog"
          >
            <X className="w-4 h-4" />
            <span className="hidden sm:inline">Cancel / Go Back</span>
          </button>
        </div>

        {/* Tab Toggle: Log In vs Sign In */}
        <div className="grid grid-cols-2 gap-2 mt-4 p-1 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setAuthMode('login');
              setError('');
              setPinSentNotice(null);
            }}
            className={`py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 ${
              authMode === 'login'
                ? 'bg-cyan-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Log In</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setAuthMode('signin');
              setError('');
              setPinSentNotice(null);
            }}
            className={`py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 ${
              authMode === 'signin'
                ? 'bg-cyan-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Sign In (2 Options)</span>
          </button>
        </div>

        {/* Error notification */}
        {error && (
          <div className="mt-3 p-3 rounded-2xl bg-rose-950/70 border border-rose-500/50 text-rose-300 text-xs font-semibold animate-fade-in flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* PIN Recovery Sent Alert */}
        {pinSentNotice && (
          <div className="mt-3 p-3.5 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs font-bold animate-fade-in flex items-center gap-2.5">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{pinSentNotice}</span>
          </div>
        )}

        {/* MODE 1: LOG IN (FOR VISITORS WHO ALREADY HAVE AN ACCOUNT) */}
        {authMode === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="mt-4 space-y-4">
            {savedAccounts.length > 0 && (
              <div className="space-y-2">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Select Existing Account:
                </label>
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {savedAccounts.map((acc) => (
                    <div
                      key={acc.id}
                      onClick={() => {
                        onSuccess(acc);
                        onClose();
                      }}
                      className="p-2.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-cyan-500/50 cursor-pointer transition flex items-center justify-between gap-3 group"
                    >
                      <div className="flex items-center gap-2.5">
                        <img
                          src={acc.avatar}
                          alt={acc.username}
                          className="w-8 h-8 rounded-xl object-cover bg-slate-800 border border-slate-700"
                        />
                        <div>
                          <div className="font-bold text-xs text-white group-hover:text-cyan-300 transition flex items-center gap-1.5">
                            <span>{acc.displayName || acc.username}</span>
                            {acc.isSaferPin && (
                              <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-bold">
                                safer
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            @{acc.username} {acc.email && `• ${acc.email}`}
                          </div>
                        </div>
                      </div>

                      <span className="text-[10px] px-2 py-1 rounded-lg bg-cyan-500/10 text-cyan-400 font-bold group-hover:bg-cyan-500 group-hover:text-slate-950 transition">
                        Log In
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300">
                Email or Username
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="e.g. alex@example.com or BedrockMaster"
                  value={loginIdentifier}
                  onChange={(e) => {
                    setLoginIdentifier(e.target.value);
                    setError('');
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={loginPassword}
                  onChange={(e) => {
                    setLoginPassword(e.target.value);
                    setError('');
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300">
                  6-Digit PIN Code (If account uses PIN)
                </label>
                <button
                  type="button"
                  onClick={() => handleForgotPin(loginIdentifier)}
                  className="text-[11px] text-cyan-400 hover:text-cyan-300 underline font-semibold transition"
                >
                  I forgot my pin
                </button>
              </div>
              <div className="relative">
                <KeyRound className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  maxLength={6}
                  placeholder="6 digits PIN (optional if not set)"
                  value={loginPin}
                  onChange={(e) => {
                    setLoginPin(e.target.value.replace(/\D/g, '').slice(0, 6));
                    setError('');
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 font-mono tracking-widest focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={onClose}
                className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs border border-slate-700 transition"
              >
                Cancel / Go Back
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span>Log In Now</span>
              </button>
            </div>
          </form>
        ) : (
          /* MODE 2: SIGN IN / REGISTER (WITH TWO OPTIONS) */
          <form onSubmit={handleSignUpSubmit} className="mt-4 space-y-4">
            {/* TWO OPTIONS FOR SIGN IN */}
            <div className="space-y-2">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300">
                Choose Sign In Method:
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Option 1: Email + Custom Password */}
                <div
                  onClick={() => setSignInOption('email_password')}
                  className={`p-3 rounded-2xl border-2 cursor-pointer transition-all ${
                    signInOption === 'email_password'
                      ? 'bg-slate-950 border-cyan-400 shadow-md shadow-cyan-950/40'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-white">Option 1: Standard</span>
                    {signInOption === 'email_password' && (
                      <Check className="w-4 h-4 text-cyan-400" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Sign in using email and custom password
                  </p>
                </div>

                {/* Option 2: Email + Custom Password + 6-digit PIN (Tagged "safer") */}
                <div
                  onClick={() => setSignInOption('email_password_pin')}
                  className={`p-3 rounded-2xl border-2 cursor-pointer transition-all ${
                    signInOption === 'email_password_pin'
                      ? 'bg-slate-950 border-emerald-400 shadow-md shadow-emerald-950/40 ring-2 ring-emerald-500/20'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-white">Option 2: High Security</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-black text-[10px] uppercase tracking-wider flex items-center gap-1">
                      <Shield className="w-3 h-3 text-emerald-400" />
                      <span>safer</span>
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Sign in with email, password and easy 6-digit PIN code
                  </p>
                </div>
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300">
                Email Address <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="e.g. crafter@bedrockhub.com"
                  value={email}
                  onChange={(e) => {
                    const val = e.target.value;
                    setEmail(val);
                    setError('');
                    if (!customAvatar1x1 && !hasManuallySelectedAvatar) {
                      setSelectedAvatar(getMinecraftCharacterAvatar(username || val || 'steve'));
                    }
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            {/* Custom Username Field */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300">
                Custom Username <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. BedrockMaster_42"
                value={username}
                onChange={(e) => {
                  const val = e.target.value;
                  setUsername(val);
                  setError('');
                  if (!customAvatar1x1 && !hasManuallySelectedAvatar) {
                    setSelectedAvatar(getMinecraftCharacterAvatar(val || email || 'steve'));
                  }
                }}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
              />
            </div>

            {/* Custom Password Field */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300">
                Custom Password <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="Create your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            {/* OPTION 2 ONLY: 6-DIGIT PIN CODE WITH "I FORGOT MY PIN" RECOVERY */}
            {signInOption === 'email_password_pin' && (
              <div className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 space-y-2 animate-fade-in">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
                    <span>6-Digit PIN Code (Only 6 digits to remember)</span>
                  </label>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                    safer
                  </span>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    maxLength={6}
                    required
                    placeholder="Enter 6-digit PIN (e.g. 123456)"
                    value={pinCode}
                    onChange={(e) => {
                      setPinCode(e.target.value.replace(/\D/g, '').slice(0, 6));
                      setError('');
                    }}
                    className="w-full bg-slate-950 border border-emerald-500/40 rounded-xl px-3.5 py-2.5 text-sm text-emerald-200 placeholder-slate-600 font-mono tracking-widest text-center focus:outline-none focus:border-emerald-400"
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] pt-1">
                  <span className="text-slate-400">Easy 6-digit security protection</span>
                  <button
                    type="button"
                    onClick={() => handleForgotPin(email)}
                    className="text-cyan-400 hover:text-cyan-300 underline font-semibold transition"
                  >
                    I forgot my pin
                  </button>
                </div>
              </div>
            )}

            {/* Display Name (Optional) */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Display Name (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Master Crafter"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>

            {/* 1x1 Custom Photo for Profile Picture */}
            <div className="space-y-2 p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Custom 1x1 Profile Picture</span>
                </label>
                <span className="text-[10px] text-cyan-400 font-semibold">1:1 Square Only</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative w-14 h-14 rounded-2xl bg-slate-900 border-2 border-cyan-500/40 p-0.5 shrink-0 overflow-hidden aspect-square flex items-center justify-center">
                  <img
                    src={customAvatar1x1 || selectedAvatar}
                    alt="1x1 Avatar"
                    className="w-full h-full object-cover rounded-xl"
                  />
                  {isProcessing1x1 && (
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center text-[10px] text-cyan-300">
                      Processing...
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-1">
                  <label className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 font-bold text-xs transition cursor-pointer flex items-center gap-2 justify-center">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload 1x1 Custom Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload1x1}
                      className="hidden"
                    />
                  </label>
                  <p className="text-[10px] text-slate-400 text-center">
                    Auto-cropped to 1:1 aspect ratio square
                  </p>
                </div>
              </div>
            </div>

            {/* Official Mojang Minecraft Character Selection */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300">
                  Official Mojang Bedrock Character
                </label>
                <span className="text-[10px] text-emerald-400 font-semibold">
                  Steve, Alex, Makena & More
                </span>
              </div>
              <p className="text-[10px] text-slate-400">
                You will be an official Minecraft character unless you upload a custom 1x1 photo above. Pick your favorite:
              </p>

              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {OFFICIAL_MINECRAFT_CHARACTERS.map((char) => {
                  const isSelected = selectedAvatar === char.svgDataUri && !customAvatar1x1;
                  return (
                    <div
                      key={char.id}
                      onClick={() => {
                        setSelectedAvatar(char.svgDataUri);
                        setCustomAvatar1x1('');
                        setHasManuallySelectedAvatar(true);
                      }}
                      className={`p-1.5 rounded-2xl border cursor-pointer transition flex flex-col items-center justify-center gap-1 bg-slate-950 hover:border-emerald-400 ${
                        isSelected 
                          ? 'border-emerald-400 ring-2 ring-emerald-400/40 bg-emerald-950/20 shadow-md' 
                          : 'border-slate-800 hover:bg-slate-900'
                      }`}
                      title={`${char.name} - ${char.role}`}
                    >
                      <div className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center p-0.5 bg-slate-900 border border-slate-700/60">
                        <img 
                          src={char.svgDataUri} 
                          alt={char.name} 
                          className="w-full h-full object-contain [image-rendering:pixelated]" 
                        />
                      </div>
                      <span className={`text-[10px] font-bold truncate max-w-[50px] ${
                        isSelected ? 'text-emerald-300' : 'text-slate-400'
                      }`}>
                        {char.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={onClose}
                className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs border border-slate-700 transition"
              >
                Cancel / Go Back
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition flex items-center justify-center gap-2"
              >
                <span>Complete Sign In ({signInOption === 'email_password_pin' ? 'Option 2 - Safer' : 'Option 1'})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* 1-Click Guest Alternative */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={handleQuickGuest}
            className="py-2 px-3 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs font-semibold border border-slate-800 transition"
          >
            Quick 1-Click Guest Sign In
          </button>

          <button
            type="button"
            onClick={onClose}
            className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition border border-slate-700"
          >
            Cancel / Go Back
          </button>
        </div>
      </div>
    </div>
  );
};
