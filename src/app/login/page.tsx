'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Lock, User, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check for your exact credentials
    if (username === 'admin' && password === '2009') {
      setError('');
      // ADD THIS LINE: Save the login status to the browser
      sessionStorage.setItem('isLoggedIn', 'true'); 
      router.push('/'); // Redirects to your main dashboard
    } else {
      setError('Invalid username or password. Access denied.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4">
      
      {/* Branding Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-teal-500/10 rounded-xl border border-teal-500/20">
          <Shield className="w-8 h-8 text-teal-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            SANJAY <span className="text-teal-400">AI</span>
          </h1>
          <p className="text-slate-400 text-sm">Secure Command Center</p>
        </div>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
        <h2 className="text-xl font-semibold text-white mb-6">Administrator Login</h2>
        
        <form onSubmit={handleLogin} className="space-y-5">
          {/* Username Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300 block">Username</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input 
                type="text" 
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg py-2.5 pl-10 pr-4 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors"
                placeholder="admin"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300 block">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg py-2.5 pl-10 pr-4 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors"
                placeholder="••••"
              />
            </div>
          </div>

          {/* Error Message Display */}
          {error && (
            <div className="text-red-400 text-sm font-medium bg-red-400/10 border border-red-400/20 rounded py-2 px-3">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button 
            type="submit"
            className="w-full bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold rounded-lg py-2.5 mt-2 flex items-center justify-center gap-2 transition-colors"
          >
            Access Dashboard
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
