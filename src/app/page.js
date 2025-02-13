"use client";

import React, { useState, useEffect } from 'react';
import { Play, Brain, Trophy, ArrowRight, LogIn, Film } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import VideoQuizDemo from '@/components/VideoQuizDemo';

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.push('/quiz');
    } catch (error) {
      console.error('Authentication error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-tr from-red-950 via-black to-black" />
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,rgba(255,0,0,0.15),transparent_50%)]" />
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_left,rgba(255,50,50,0.15),transparent_50%)]" />
      </div>

      {/* Navigation */}
      <nav className={`fixed w-full z-50 transition-all duration-500 ${scrolled ? 'bg-black/50 backdrop-blur-lg' : ''}`}>
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative group">
                <Film className="w-8 h-8 text-red-500" />
                <div className="absolute -inset-2 bg-red-500/20 rounded-full blur group-hover:bg-red-500/30 transition-all duration-500" />
              </div>
              <span className="text-2xl font-bold tracking-wider">Reel Quiz</span>
            </div>
            <button 
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition-all font-medium flex items-center space-x-2"
            >
              <span>{isLoading ? 'Signing in...' : 'Start Playing'}</span>
              <LogIn className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      <main className="relative pt-32">
        {/* Hero Section */}
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto text-center mb-20">
            <div className="inline-flex items-center px-4 py-2 bg-red-500/10 rounded-full text-sm font-medium backdrop-blur-sm mb-8">
              <Trophy className="w-4 h-4 mr-2 text-red-500" />
              Learn While You Watch
            </div>
            <h1 className="text-7xl font-bold mb-8 leading-tight tracking-tight">
              Watch Videos.
              <span className="block relative mt-2">
                Answer Questions.
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-300">Win Rewards.</span>
              </span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Join thousands of users watching vertical format videos and testing their knowledge. Learn, compete, and earn rewards!
            </p>
          </div>

          {/* Demo Section */}
          <div className="max-w-md mx-auto mb-32">
            <VideoQuizDemo />
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-8 mb-32">
            {[
              {
                title: 'Watch & Learn',
                desc: 'Engaging vertical format videos curated just for you',
                icon: Film,
                gradient: 'from-red-500 to-red-400'
              },
              {
                title: 'Test Knowledge',
                desc: 'Answer questions and challenge your understanding',
                icon: Brain,
                gradient: 'from-red-400 to-red-300'
              },
              {
                title: 'Win Rewards',
                desc: 'Earn points and compete for exclusive prizes',
                icon: Trophy,
                gradient: 'from-red-300 to-red-200'
              }
            ].map((feature, index) => (
              <div key={index} className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500/20 to-red-300/20 rounded-2xl opacity-50 group-hover:opacity-100 blur transition duration-500" />
                <div className="relative p-8 bg-black/50 backdrop-blur-sm rounded-2xl border border-red-500/10 h-full">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className={`p-3 bg-gradient-to-r ${feature.gradient} rounded-xl`}>
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold">{feature.title}</h3>
                  </div>
                  <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-red-500/10 mt-32">
        <div className="container mx-auto px-6 py-12">
          <div className="flex justify-between items-center">
            <span className="text-gray-500">© 2025 Reel Quiz. All rights reserved.</span>
            <div className="flex space-x-8">
              <a href="#" className="text-gray-500 hover:text-white transition-colors">
                Privacy
              </a>
              <a href="#" className="text-gray-500 hover:text-white transition-colors">
                Terms
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}