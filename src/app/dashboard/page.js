"use client";

import { useState, useEffect } from 'react';
import { Eye, Brain, Book, LogOut, Users, Globe, 
         Linkedin, Twitter, Instagram, Facebook, Youtube,
         Target, Sparkles, ArrowRight, Share2, PenTool, Plus } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [selectedTab, setSelectedTab] = useState('overview');
  const router = useRouter();
  
  const socialPlatforms = [
    { name: 'LinkedIn', icon: Linkedin, percentage: 85, color: 'bg-[#0077B5]', engagement: 'Very High' },
    { name: 'Twitter', icon: Twitter, percentage: 65, color: 'bg-[#1DA1F2]', engagement: 'High' },
    { name: 'Youtube', icon: Youtube, percentage: 55, color: 'bg-[#FF0000]', engagement: 'Medium' },
    { name: 'Instagram', icon: Instagram, percentage: 45, color: 'bg-[#E4405F]', engagement: 'Medium' },
    { name: 'Facebook', icon: Facebook, percentage: 30, color: 'bg-[#1877F2]', engagement: 'Low' }
  ];

  const platformContent = {
    LinkedIn: {
      icon: Linkedin,
      color: '#0077B5',
      stories: [
        {
          title: 'AI Transformation in Enterprise',
          type: 'Article',
          hook: 'How leading companies are leveraging AI to transform their operations',
          engagement: 'High',
          status: 'draft',
          hashtags: ['#AI', '#DigitalTransformation', '#Enterprise'],
          wordCount: '800 words'
        },
        {
          title: 'The Future of Remote Work',
          type: 'Case Study',
          hook: 'Real stories from companies that went fully remote',
          engagement: 'Very High',
          status: 'draft',
          hashtags: ['#RemoteWork', '#FutureOfWork'],
          wordCount: '1200 words'
        },
        {
          title: 'Tech Leadership in 2025',
          type: 'Thought Leadership',
          hook: 'Key skills and strategies for next-gen tech leaders',
          engagement: 'High',
          status: 'draft',
          hashtags: ['#Leadership', '#Technology'],
          wordCount: '1000 words'
        },
        {
          title: 'Building Scalable Teams',
          type: 'Guide',
          hook: 'A framework for scaling engineering teams effectively',
          engagement: 'High',
          status: 'draft',
          hashtags: ['#Engineering', '#TeamBuilding'],
          wordCount: '1500 words'
        },
        {
          title: 'Innovation at Scale',
          type: 'Success Story',
          hook: 'How we implemented innovation processes across 500+ teams',
          engagement: 'Very High',
          status: 'draft',
          hashtags: ['#Innovation', '#Scale'],
          wordCount: '900 words'
        }
      ]
    },
    Twitter: {
      icon: Twitter,
      color: '#1DA1F2',
      stories: [
        {
          title: '10 AI Predictions for 2025',
          type: 'Thread',
          hook: 'Breaking down the future of AI in simple terms',
          engagement: 'High',
          status: 'draft',
          tweetCount: '12 tweets'
        },
        {
          title: 'Behind Our Tech Stack',
          type: 'Tech Thread',
          hook: 'A deep dive into our engineering decisions',
          engagement: 'High',
          status: 'draft',
          tweetCount: '15 tweets'
        },
        {
          title: 'Product Development Tips',
          type: 'Tips Thread',
          hook: 'Lessons learned from building our product',
          engagement: 'High',
          status: 'draft',
          tweetCount: '10 tweets'
        },
        {
          title: 'Code Review Best Practices',
          type: 'Tutorial Thread',
          hook: 'Improve your code review process',
          engagement: 'Medium',
          status: 'draft',
          tweetCount: '8 tweets'
        },
        {
          title: 'DevOps Journey',
          type: 'Story Thread',
          hook: 'Our transition to DevOps culture',
          engagement: 'High',
          status: 'draft',
          tweetCount: '14 tweets'
        }
      ]
    },
    // Add similar detailed structures for other platforms...
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
      } else {
        router.push('/');
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('scanUrl');
      router.push('/');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  if (!user) return null;

  const renderOverviewTab = () => (
    <>
      {/* Primary Stats */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
          <h3 className="text-gray-400 font-light mb-2">Primary Audience</h3>
          <div className="text-2xl font-light">Tech Professionals</div>
          <div className="text-sm text-gray-500 mt-1">85% of audience</div>
        </div>
        <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
          <h3 className="text-gray-400 font-light mb-2">Age Range</h3>
          <div className="text-2xl font-light">25-40 years</div>
          <div className="text-sm text-gray-500 mt-1">75% of audience</div>
        </div>
        <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
          <h3 className="text-gray-400 font-light mb-2">Key Interests</h3>
          <div className="flex flex-wrap gap-2">
            {['Technology', 'Innovation', 'AI/ML'].map((interest) => (
              <span key={interest} className="px-2 py-1 bg-[#A578FF]/20 rounded-full text-sm">
                {interest}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Detailed Insights */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
          <h3 className="text-xl font-light mb-4">Behavior Pattern</h3>
          <ul className="space-y-3">
            {[
              "Most active during business hours (9am-5pm)",
              "Engages with technical content",
              "Prefers detailed, in-depth analysis",
              "Values data-driven insights"
            ].map((pattern, i) => (
              <li key={i} className="flex items-center text-gray-400">
                <div className="w-1.5 h-1.5 bg-[#A578FF] rounded-full mr-3" />
                {pattern}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
          <h3 className="text-xl font-light mb-4">Content Preferences</h3>
          <ul className="space-y-3">
            {[
              "Technical documentation",
              "Industry analysis",
              "Case studies",
              "How-to guides"
            ].map((preference, i) => (
              <li key={i} className="flex items-center text-gray-400">
                <div className="w-1.5 h-1.5 bg-[#63FF93] rounded-full mr-3" />
                {preference}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Platform Distribution */}
      <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
        <h3 className="text-xl font-light mb-6">Platform Distribution</h3>
        <div className="space-y-4">
          {socialPlatforms.map((platform) => (
            <div key={platform.name} 
                 className="bg-black/30 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <platform.icon className={`w-5 h-5`} />
                <span className="font-light">{platform.name}</span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-400">
                  {platform.engagement}
                </div>
                <div className="w-32 h-1 bg-white/10 rounded-full">
                  <div 
                    className={`h-full ${platform.color} rounded-full`}
                    style={{ width: `${platform.percentage}%` }}
                  />
                </div>
                <span className="text-sm text-gray-400 w-12">
                  {platform.percentage}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );

  const renderStoriesTab = () => (
    <div className="space-y-12">
      {Object.entries(platformContent).map(([platform, content]) => (
        <div key={platform} className="relative">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <content.icon className="w-6 h-6" style={{ color: content.color }} />
              <h2 className="text-2xl font-light">{platform}</h2>
            </div>
            <button 
              className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors flex items-center space-x-2"
              onClick={() => {/* Add new story logic */}}
            >
              <Plus className="w-4 h-4" />
              <span>New Story</span>
            </button>
          </div>

          {/* Carousel Container */}
          <div className="relative">
            <div className="overflow-x-auto pb-4 hide-scrollbar">
              <div className="flex space-x-4">
                {content.stories.map((story, index) => (
                  <div 
                    key={index}
                    className="min-w-[300px] bg-white/5 rounded-xl border border-white/10 p-5 hover:border-[#A578FF]/50 transition-colors"
                  >
                    {/* Card Header */}
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-light text-lg mb-1">{story.title}</h3>
                        <span className="text-sm text-gray-400">{story.type}</span>
                      </div>
                      <span className="px-2 py-1 bg-[#A578FF]/20 text-[#A578FF] rounded-full text-xs">
                        {story.engagement}
                      </span>
                    </div>

                    {/* Story Hook */}
                    <p className="text-gray-400 text-sm mb-4">{story.hook}</p>

                    {/* Story Details */}
                    {platform === 'LinkedIn' && (
                      <div className="space-y-2 mb-4">
                        <div className="flex flex-wrap gap-1">
                          {story.hashtags.map((tag, i) => (
                            <span key={i} className="text-xs text-gray-500">
                              {tag}
                            </span>
                          ))}
                        </div>
                        <div className="text-xs text-gray-500">
                          {story.wordCount}
                        </div>
                      </div>
                    )}

                    {platform === 'Twitter' && (
                      <div className="text-xs text-gray-500 mb-4">
                        {story.tweetCount}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex space-x-2 mt-auto">
                      <button className="flex-1 px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-sm">
                        Edit
                      </button>
                      <button className="flex-1 px-3 py-2 bg-[#A578FF] text-black rounded-lg hover:opacity-90 transition-opacity text-sm">
                        Post
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Scroll Indicators/Controls */}
            <button className="absolute left-0 top-1/2 -translate-y-1/2 -ml-4 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/10">
              <ArrowRight className="w-4 h-4 rotate-180" />
            </button>
            <button className="absolute right-0 top-1/2 -translate-y-1/2 -mr-4 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/10">
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-tr from-violet-950 via-black to-black" />
      </div>

      {/* Main Layout */}
      <div className="flex">
        {/* Sidebar */}
        <div className="fixed left-0 top-0 h-full w-64 bg-black/50 backdrop-blur-sm border-r border-white/10">
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-8">
              <Eye className="w-8 h-8 text-[#A578FF]" />
              <span className="text-xl font-light">eyeballs</span>
            </div>

            {/* Navigation Tabs */}
            <nav className="space-y-2">
              {[
                { id: 'overview', name: 'Overview', icon: Brain },
                { id: 'stories', name: 'Stories', icon: PenTool }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedTab(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors ${
                    selectedTab === item.id ? 'bg-white/5 text-white' : ''
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-light">{item.name}</span>
                </button>
              ))}
            </nav>

            {/* User Profile */}
            <div className="absolute bottom-20 w-full left-0 px-6">
              <div className="p-4 bg-white/5 rounded-lg">
                {user?.photoURL && (
                  <img 
                    src={user.photoURL} 
                    alt="Profile" 
                    className="w-10 h-10 rounded-full mb-3"
                  />
                )}
                <div className="font-light text-sm text-gray-400">
                  {user?.displayName}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {user?.email}
                </div>
              </div>
            </div>

            <div className="absolute bottom-0 w-full left-0 p-6">
              <button 
                onClick={handleSignOut}
                className="flex items-center space-x-3 text-gray-400 hover:text-white transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-light">Sign Out</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="ml-64 flex-1 p-8">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-12">
              <h1 className="text-4xl font-light mb-2">
                {selectedTab === 'overview' ? 'Audience Analysis' : 'Story Ideas'}
              </h1>
              <p className="text-gray-400 font-light">
                {selectedTab === 'overview' 
                  ? 'Understand your audience and their preferences'
                  : 'Platform-specific content recommendations'}
              </p>
            </div>

            {/* Tab Content */}
            {selectedTab === 'overview' ? renderOverviewTab() : renderStoriesTab()}
          </div>
        </div>
      </div>
    </div>
  );
}