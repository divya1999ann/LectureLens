import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import {
  GraduationCap, Mic, MessageSquare, FileText, Sparkles,
  Play, ArrowRight, BookOpen, Brain, Zap, ChevronRight, Star
} from 'lucide-react';
import { Button } from '../components/ui/button';

const FeatureCard = ({ icon: Icon, title, description, gradient, delay }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={`group relative bg-white dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br ${gradient} mb-6 group-hover:scale-110 transition-transform duration-300`}>
        <Icon className="w-7 h-7 text-white" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{description}</p>
    </div>
  );
};

const StatItem = ({ value, label }) => (
  <div className="text-center">
    <div className="text-3xl md:text-4xl font-extrabold text-white mb-1">{value}</div>
    <div className="text-sm text-blue-200/80">{label}</div>
  </div>
);

const LandingPage = () => {
  const [heroVisible, setHeroVisible] = useState(false);

  useEffect(() => {
    setHeroVisible(true);
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-lg border-b border-gray-200/30 dark:border-gray-800/30">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              Lecture<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600">AI</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                Sign In
              </Button>
            </Link>
            <Link to="/register">
              <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 shadow-lg shadow-blue-500/25">
                Get Started
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-44 md:pb-32 px-6">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-gradient-to-br from-blue-400/20 to-purple-500/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-gradient-to-br from-purple-400/15 to-pink-500/15 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div
            className={`inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-500/10 border border-blue-200/50 dark:border-blue-500/20 rounded-full mb-8 transition-all duration-700 ${
              heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <Sparkles className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
              AI-Powered Learning Assistant
            </span>
          </div>

          {/* Headline */}
          <h1
            className={`text-5xl md:text-7xl font-extrabold leading-tight mb-6 transition-all duration-700 delay-100 ${
              heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <span className="text-gray-900 dark:text-white">Transform Your </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
              Lectures
            </span>
            <br />
            <span className="text-gray-900 dark:text-white">Into Knowledge</span>
          </h1>

          {/* Subheading */}
          <p
            className={`text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed transition-all duration-700 delay-200 ${
              heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            Automatically transcribe lectures, get AI-powered summaries, and chat with
            your course material. Study smarter, not harder.
          </p>

          {/* CTA Buttons */}
          <div
            className={`flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 transition-all duration-700 delay-300 ${
              heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <Link to="/register">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 shadow-xl shadow-blue-500/30 px-8 py-6 text-lg rounded-xl"
              >
                Start Learning Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to="/login">
              <Button
                variant="outline"
                size="lg"
                className="px-8 py-6 text-lg rounded-xl border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <Play className="w-5 h-5 mr-2" />
                Sign In
              </Button>
            </Link>
          </div>

          {/* Stats Bar */}
          <div
            className={`inline-flex items-center gap-8 md:gap-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl px-8 md:px-12 py-6 shadow-2xl shadow-blue-500/20 transition-all duration-700 delay-[400ms] ${
              heroVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'
            }`}
          >
            <StatItem value="10K+" label="Students" />
            <div className="w-px h-10 bg-white/20" />
            <StatItem value="50K+" label="Lectures" />
            <div className="w-px h-10 bg-white/20" />
            <StatItem value="99%" label="Accuracy" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-28 px-6 bg-gray-50/50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-50 dark:bg-purple-500/10 border border-purple-200/50 dark:border-purple-500/20 rounded-full mb-4">
              <Zap className="w-3.5 h-3.5 text-purple-500" />
              <span className="text-xs font-semibold text-purple-700 dark:text-purple-300 uppercase tracking-wider">Features</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
              Everything you need to{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600">
                ace your courses
              </span>
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
              Powerful tools that work together to help you understand, retain, and succeed.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={Mic}
              title="Live Transcription"
              description="Real-time speech-to-text conversion that captures every word from your lectures with high accuracy."
              gradient="from-blue-500 to-cyan-500"
              delay={100}
            />
            <FeatureCard
              icon={Brain}
              title="AI-Powered Chat"
              description="Ask questions about your lectures and get intelligent answers sourced directly from your course material."
              gradient="from-purple-500 to-pink-500"
              delay={200}
            />
            <FeatureCard
              icon={FileText}
              title="Smart Summaries"
              description="Automatically generated lecture summaries, key points, and study notes to streamline your revision."
              gradient="from-orange-500 to-red-500"
              delay={300}
            />
            <FeatureCard
              icon={BookOpen}
              title="Subject Management"
              description="Organize all your courses in one place. Track progress, manage lectures, and never miss a beat."
              gradient="from-green-500 to-emerald-500"
              delay={400}
            />
            <FeatureCard
              icon={MessageSquare}
              title="Chat History"
              description="All your AI conversations are saved and searchable, so you can revisit insights anytime you need them."
              gradient="from-indigo-500 to-blue-500"
              delay={500}
            />
            <FeatureCard
              icon={Sparkles}
              title="Quiz Generation"
              description="AI-generated quizzes from your lecture content to test your understanding and prepare for exams."
              gradient="from-pink-500 to-rose-500"
              delay={600}
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 md:py-28 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
              How It Works
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
              Get started in three simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Upload or Record',
                description: 'Upload lecture recordings or use live transcription to capture content in real-time.',
                gradient: 'from-blue-500 to-cyan-500'
              },
              {
                step: '02',
                title: 'AI Processes',
                description: 'Our AI transcribes, summarizes, and indexes your lectures for quick retrieval.',
                gradient: 'from-purple-500 to-pink-500'
              },
              {
                step: '03',
                title: 'Learn & Chat',
                description: 'Ask questions, generate quizzes, and study with AI-powered assistance.',
                gradient: 'from-orange-500 to-red-500'
              }
            ].map((item, idx) => (
              <div key={idx} className="relative text-center group">
                <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${item.gradient} rounded-2xl mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <span className="text-2xl font-extrabold text-white">{item.step}</span>
                </div>
                {idx < 2 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%]">
                    <div className="border-t-2 border-dashed border-gray-300 dark:border-gray-700" />
                  </div>
                )}
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{item.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-28 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 rounded-3xl p-12 md:p-16 text-center shadow-2xl overflow-hidden">
            {/* Background sparkles */}
            <div className="absolute inset-0">
              <div className="absolute top-10 left-10 w-2 h-2 bg-white/30 rounded-full animate-pulse" />
              <div className="absolute top-20 right-20 w-3 h-3 bg-white/20 rounded-full animate-pulse" style={{ animationDelay: '500ms' }} />
              <div className="absolute bottom-16 left-1/4 w-2 h-2 bg-white/25 rounded-full animate-pulse" style={{ animationDelay: '1000ms' }} />
              <div className="absolute bottom-10 right-1/3 w-2 h-2 bg-white/20 rounded-full animate-pulse" style={{ animationDelay: '1500ms' }} />
            </div>

            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
                Ready to Transform Your Learning?
              </h2>
              <p className="text-lg text-blue-100 mb-8 max-w-lg mx-auto">
                Join thousands of students who are already studying smarter with AI-powered lecture tools.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/register">
                  <Button
                    size="lg"
                    className="bg-white text-blue-600 hover:bg-gray-100 border-0 shadow-xl px-8 py-6 text-lg rounded-xl font-bold"
                  >
                    Get Started Free
                    <ChevronRight className="w-5 h-5 ml-1" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-2 border-white/30 text-white hover:bg-white/10 px-8 py-6 text-lg rounded-xl"
                  >
                    Sign In
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900 dark:text-white">
              Lecture<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600">AI</span>
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            © 2026 LectureAI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
