import React, { useState, useEffect } from 'react';
import apiService from './services/api';
import './App.css';

function App() {
  const [feelings, setFeelings] = useState([]);
  const [selectedFeeling, setSelectedFeeling] = useState(null);
  const [verse, setVerse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isApiHealthy, setIsApiHealthy] = useState(false);
  const [showVerse, setShowVerse] = useState(false);
  const [history, setHistory] = useState([]);
  const [theme, setTheme] = useState('light');

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('findyourpeace_theme');
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const initialTheme = prefersDark ? 'dark' : 'light';
      setTheme(initialTheme);
      document.documentElement.setAttribute('data-theme', initialTheme);
    }
  }, []);

  // Check API health on mount
  useEffect(() => {
    checkApiHealth();
    loadFeelings();
    loadHistoryFromStorage();
  }, []);

  const checkApiHealth = async () => {
    try {
      await apiService.healthCheck();
      setIsApiHealthy(true);
    } catch (err) {
      setIsApiHealthy(false);
      setError('Cannot connect to API. Please ensure the backend is running on port 8000.');
    }
  };

  const loadFeelings = async () => {
    try {
      const data = await apiService.getFeelings();
      setFeelings(data);
    } catch (err) {
      setError('Failed to load feelings. Please try again.');
    }
  };

  const loadHistoryFromStorage = () => {
    const saved = localStorage.getItem('findyourpeace_history');
    if (saved) {
      setHistory(JSON.parse(saved));
    }
  };

  const saveHistoryToStorage = (newHistory) => {
    localStorage.setItem('findyourpeace_history', JSON.stringify(newHistory));
  };

  const handleFeelingSelect = async (feeling) => {
    setSelectedFeeling(feeling);
    setLoading(true);
    setError(null);
    setShowVerse(false);

    try {
      // Get excluded verses from history for this feeling
      const excludeVerses = history
        .filter(h => h.feeling_id === feeling.id)
        .map(h => `${h.surah_number}:${h.ayah_number}`);

      const verseData = await apiService.getVerse(
        feeling.id,
        'anonymous',
        excludeVerses
      );

      setVerse(verseData);
      
      // Update history
      const newHistoryItem = {
        feeling_id: feeling.id,
        feeling_label: feeling.label,
        surah_number: verseData.surah_number,
        ayah_number: verseData.ayah_number,
        timestamp: new Date().toISOString(),
      };
      
      const newHistory = [...history, newHistoryItem].slice(-30); // Keep last 30
      setHistory(newHistory);
      saveHistoryToStorage(newHistory);

      // Trigger animation
      setTimeout(() => setShowVerse(true), 100);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load verse. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedFeeling(null);
    setVerse(null);
    setShowVerse(false);
    setError(null);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('findyourpeace_theme', newTheme);
  };

  const getGradientStyle = (theme) => {
    return {
      background: theme?.gradient || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    };
  };

  return (
    <div className="app">
      {/* Enterprise-Level Header with Glassmorphism */}
      <header className="header">
        <div className="header-background-pattern"></div>
        <div className="container">
          <div className="header-content">
            <div className="header-left">
              <div className="logo-container">
                <div className="logo-icon">
                  <svg width="48" height="48" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      {/* Enhanced Quran cover gradient with depth */}
                      <linearGradient id="quranGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="currentColor" stopOpacity="0.35"/>
                        <stop offset="50%" stopColor="currentColor" stopOpacity="0.25"/>
                        <stop offset="100%" stopColor="currentColor" stopOpacity="0.15"/>
                      </linearGradient>
                      {/* Spine gradient for 3D effect */}
                      <linearGradient id="spineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="currentColor" stopOpacity="0.5"/>
                        <stop offset="100%" stopColor="currentColor" stopOpacity="0.3"/>
                      </linearGradient>
                      {/* Heart gradient */}
                      <linearGradient id="heartGlow" x1="50%" y1="0%" x2="50%" y2="100%">
                        <stop offset="0%" stopColor="currentColor" stopOpacity="0.85"/>
                        <stop offset="100%" stopColor="currentColor" stopOpacity="0.55"/>
                      </linearGradient>
                      {/* Shadow filter for depth */}
                      <filter id="bookShadow">
                        <feGaussianBlur in="SourceAlpha" stdDeviation="1"/>
                        <feOffset dx="1" dy="1" result="offsetblur"/>
                        <feComponentTransfer>
                          <feFuncA type="linear" slope="0.3"/>
                        </feComponentTransfer>
                      </filter>
                    </defs>
                    
                    {/* ENHANCED SQUARE QURAN BOOK */}
                    <g filter="url(#bookShadow)">
                      {/* Shadow base */}
                      <rect x="11" y="11" width="80" height="80" rx="3" fill="currentColor" opacity="0.08"/>
                    </g>
                    
                    <g>
                      {/* Main Quran book cover with enhanced depth */}
                      <rect x="10" y="10" width="80" height="80" rx="3" 
                            fill="url(#quranGradient)" 
                            stroke="currentColor" 
                            strokeWidth="2.5" 
                            opacity="0.95"/>
                      
                      {/* Enhanced book spine with 3D effect */}
                      <rect x="10" y="10" width="8" height="80" rx="1.5" 
                            fill="url(#spineGradient)"/>
                      <line x1="18" y1="10" x2="18" y2="90" 
                            stroke="currentColor" 
                            strokeWidth="1.5" 
                            opacity="0.5"/>
                      
                      {/* Spine detail lines for texture */}
                      <g opacity="0.3">
                        <line x1="11" y1="15" x2="17" y2="15" stroke="currentColor" strokeWidth="0.4"/>
                        <line x1="11" y1="85" x2="17" y2="85" stroke="currentColor" strokeWidth="0.4"/>
                        <line x1="14" y1="12" x2="14" y2="88" stroke="currentColor" strokeWidth="0.3"/>
                      </g>
                      
                      {/* Enhanced book pages on right edge with depth */}
                      <g opacity="0.4">
                        <line x1="89.5" y1="12" x2="89.5" y2="88" stroke="currentColor" strokeWidth="0.8"/>
                        <line x1="88.5" y1="12.5" x2="88.5" y2="87.5" stroke="currentColor" strokeWidth="0.6"/>
                        <line x1="87.5" y1="13" x2="87.5" y2="87" stroke="currentColor" strokeWidth="0.5"/>
                        <line x1="86.5" y1="13.5" x2="86.5" y2="86.5" stroke="currentColor" strokeWidth="0.4"/>
                        <line x1="85.5" y1="14" x2="85.5" y2="86" stroke="currentColor" strokeWidth="0.3"/>
                      </g>
                      
                      {/* Double ornamental border - more Islamic style */}
                      <rect x="20" y="20" width="60" height="60" rx="2" 
                            stroke="currentColor" 
                            strokeWidth="1" 
                            opacity="0.4" 
                            fill="none"/>
                      <rect x="23" y="23" width="54" height="54" rx="1.5" 
                            stroke="currentColor" 
                            strokeWidth="0.6" 
                            opacity="0.3" 
                            fill="none"/>
                      
                      {/* Enhanced corner ornaments */}
                      <g opacity="0.45">
                        {/* Top-left */}
                        <path d="M25 25 L32 25 M25 25 L25 32" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                        <path d="M27 27 L30 27 M27 27 L27 30" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round"/>
                        <circle cx="26" cy="26" r="1.2" fill="currentColor"/>
                        
                        {/* Top-right */}
                        <path d="M75 25 L68 25 M75 25 L75 32" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                        <path d="M73 27 L70 27 M73 27 L73 30" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round"/>
                        <circle cx="74" cy="26" r="1.2" fill="currentColor"/>
                        
                        {/* Bottom-left */}
                        <path d="M25 75 L32 75 M25 75 L25 68" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                        <path d="M27 73 L30 73 M27 73 L27 70" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round"/>
                        <circle cx="26" cy="74" r="1.2" fill="currentColor"/>
                        
                        {/* Bottom-right */}
                        <path d="M75 75 L68 75 M75 75 L75 68" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                        <path d="M73 73 L70 73 M73 73 L73 70" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round"/>
                        <circle cx="74" cy="74" r="1.2" fill="currentColor"/>
                      </g>
                      
                      {/* Enhanced Arabic text representation */}
                      <g opacity="0.3">
                        {/* Top section - title */}
                        <line x1="32" y1="28" x2="68" y2="28" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
                        <line x1="35" y1="32" x2="65" y2="32" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round"/>
                        
                        {/* Bottom section - text */}
                        <line x1="30" y1="68" x2="70" y2="68" stroke="currentColor" strokeWidth="0.7" strokeLinecap="round"/>
                        <line x1="32" y1="71" x2="68" y2="71" stroke="currentColor" strokeWidth="0.7" strokeLinecap="round"/>
                        <line x1="30" y1="74" x2="70" y2="74" stroke="currentColor" strokeWidth="0.7" strokeLinecap="round"/>
                      </g>
                      
                      {/* Enhanced Islamic geometric pattern - more detailed */}
                      <g opacity="0.35">
                        {/* Outer circles */}
                        <circle cx="50" cy="50" r="15" stroke="currentColor" strokeWidth="1" fill="none"/>
                        <circle cx="50" cy="50" r="11" stroke="currentColor" strokeWidth="0.8" fill="none"/>
                        <circle cx="50" cy="50" r="7" stroke="currentColor" strokeWidth="0.6" fill="none"/>
                        <circle cx="50" cy="50" r="4" stroke="currentColor" strokeWidth="0.5" fill="none"/>
                        
                        {/* 8-pointed star in center */}
                        <path d="M50 40 L51.5 46 L57 46 L52 49.5 L54 56 L50 52 L46 56 L48 49.5 L43 46 L48.5 46 Z" 
                              fill="currentColor" 
                              opacity="0.6"/>
                        
                        {/* Cross pattern */}
                        <line x1="50" y1="35" x2="50" y2="42" stroke="currentColor" strokeWidth="0.8"/>
                        <line x1="50" y1="58" x2="50" y2="65" stroke="currentColor" strokeWidth="0.8"/>
                        <line x1="35" y1="50" x2="42" y2="50" stroke="currentColor" strokeWidth="0.8"/>
                        <line x1="58" y1="50" x2="65" y2="50" stroke="currentColor" strokeWidth="0.8"/>
                      </g>
                      
                      {/* Top bookmark ribbon - added detail */}
                      <g opacity="0.35">
                        <path d="M49 10 L49 18 L50 17 L51 18 L51 10" 
                              fill="currentColor" 
                              stroke="currentColor" 
                              strokeWidth="0.5"/>
                      </g>
                    </g>
                    
                    {/* PERFECT HEART IN THE MIDDLE */}
                    <g>
                      {/* Perfect heart shape - centered */}
                      <path 
                        d="M50 65 C50 65 35 55 35 45 C35 40 38 37 41 37 C43.5 37 45.5 38.5 46.5 41 L50 48 L53.5 41 C54.5 38.5 56.5 37 59 37 C62 37 65 40 65 45 C65 55 50 65 50 65 Z" 
                        fill="url(#heartGlow)"
                      />
                      
                      {/* Heart outline - perfect stroke */}
                      <path 
                        d="M50 65 C50 65 35 55 35 45 C35 40 38 37 41 37 C43.5 37 45.5 38.5 46.5 41 L50 48 L53.5 41 C54.5 38.5 56.5 37 59 37 C62 37 65 40 65 45 C65 55 50 65 50 65 Z" 
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        opacity="0.9"
                      />
                      
                      {/* Inner heart glow */}
                      <path 
                        d="M50 60 C50 60 40 53 40 46 C40 42.5 42 41 43.5 41 C45 41 46.5 42 47 44 L50 49 L53 44 C53.5 42 55 41 56.5 41 C58 41 60 42.5 60 46 C60 53 50 60 50 60 Z" 
                        fill="currentColor"
                        opacity="0.15"
                      />
                    </g>
                    
                    {/* Subtle spiritual aura around entire logo */}
                    <rect x="8" y="8" width="84" height="84" rx="4" 
                          stroke="currentColor" 
                          strokeWidth="0.5" 
                          opacity="0.1" 
                          fill="none"/>
                  </svg>
                </div>
                <div className="logo-text-group">
                  <h1 className="logo">
                    <span className="logo-text">FindYourPeace</span>
                  </h1>
                  <p className="tagline">Quranic Guidance for Every Emotion</p>
                </div>
              </div>
            </div>
            
            <div className="header-right">
              <button 
                className="theme-toggle" 
                onClick={toggleTheme}
                aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              >
                <span className="theme-icon-wrapper">
                  {theme === 'light' ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="5"/>
                      <line x1="12" y1="1" x2="12" y2="3"/>
                      <line x1="12" y1="21" x2="12" y2="23"/>
                      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                      <line x1="1" y1="12" x2="3" y2="12"/>
                      <line x1="21" y1="12" x2="23" y2="12"/>
                      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                    </svg>
                  )}
                </span>
                <span className="theme-label">{theme === 'light' ? 'Dark' : 'Light'}</span>
              </button>
            </div>
          </div>
          
          {!isApiHealthy && (
            <div className="api-warning">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              <span>Backend not connected. Please start the API server.</span>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        <div className="container">
          {!selectedFeeling ? (
            /* Feeling Selection View */
            <div className="selection-view fade-in">
              <h2 className="section-title">How are you feeling today?</h2>
              <p className="section-subtitle">
                Select your current emotional state to receive guidance from the Quran
              </p>

              <div className="feelings-grid">
                {feelings.map((feeling, index) => {
                  // Enterprise-level styling - 16 unique gradients with emotion-based color psychology
                  const feelingStyles = {
                    'alone': {
                      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      pattern: 'radial',
                      glow: 'rgba(102, 126, 234, 0.4)',
                      emotion: 'solitude' // Purple = introspection, spirituality
                    },
                    'depressed': {
                      gradient: 'linear-gradient(135deg, #4b5563 0%, #1f2937 100%)',
                      pattern: 'wave',
                      glow: 'rgba(75, 85, 99, 0.4)',
                      emotion: 'heavy' // Gray = neutral, weight, depression
                    },
                    'grateful': {
                      gradient: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                      pattern: 'light',
                      glow: 'rgba(251, 191, 36, 0.4)',
                      emotion: 'joyful' // Gold = warmth, appreciation, abundance
                    },
                    'confused': {
                      gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                      pattern: 'maze',
                      glow: 'rgba(139, 92, 246, 0.4)',
                      emotion: 'uncertain' // Violet = mystery, seeking clarity
                    },
                    'frustrated': {
                      gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                      pattern: 'fire',
                      glow: 'rgba(239, 68, 68, 0.4)',
                      emotion: 'intense' // Red = urgency, passion, anger
                    },
                    'unloved': {
                      gradient: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
                      pattern: 'rain',
                      glow: 'rgba(236, 72, 153, 0.4)',
                      emotion: 'tender' // Pink = compassion, need for love
                    },
                    'happy': {
                      gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      pattern: 'flow',
                      glow: 'rgba(16, 185, 129, 0.4)',
                      emotion: 'vibrant' // Green = growth, harmony, vitality
                    },
                    'blessed': {
                      gradient: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
                      pattern: 'path',
                      glow: 'rgba(20, 184, 166, 0.4)',
                      emotion: 'serene' // Teal = balance, spiritual blessing
                    },
                    'fearful': {
                      gradient: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                      pattern: 'dawn',
                      glow: 'rgba(249, 115, 22, 0.4)',
                      emotion: 'alert' // Orange = caution, hope emerging
                    },
                    'hopeless': {
                      gradient: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                      pattern: 'mist',
                      glow: 'rgba(99, 102, 241, 0.4)',
                      emotion: 'deep' // Indigo = depth, contemplation
                    },
                    'worried': {
                      gradient: 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)',
                      pattern: 'spiral',
                      glow: 'rgba(168, 85, 247, 0.4)',
                      emotion: 'restless' // Purple = anxious energy, seeking
                    },
                    'seeking': {
                      gradient: 'linear-gradient(135deg, #fb923c 0%, #f97316 100%)',
                      pattern: 'compass',
                      glow: 'rgba(251, 146, 60, 0.4)',
                      emotion: 'searching' // Amber = guidance, direction, warmth
                    },
                    'peaceful': {
                      gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
                      pattern: 'tranquil',
                      glow: 'rgba(168, 237, 234, 0.5)',
                      emotion: 'calm' // Soft cyan/pink = tranquility, contentment
                    },
                    'heartbroken': {
                      gradient: 'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)',
                      pattern: 'healing',
                      glow: 'rgba(210, 153, 194, 0.4)',
                      emotion: 'grieving' // Mauve/cream = gentle healing, soft sadness
                    },
                    'anxious': {
                      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #8B5CF6 100%)',
                      pattern: 'storm',
                      glow: 'rgba(139, 92, 246, 0.5)',
                      emotion: 'turbulent' // Purple storm = inner turmoil, seeking calm
                    },
                    'repentant': {
                      gradient: 'linear-gradient(135deg, #06B6D4 0%, #0EA5E9 50%, #38BDF8 100%)',
                      pattern: 'renewal',
                      glow: 'rgba(6, 182, 212, 0.5)',
                      emotion: 'purifying' // Clear blue = cleansing, fresh start, hope
                    }
                  };
                  
                  const style = feelingStyles[feeling.id] || {
                    gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    pattern: 'default',
                    glow: 'rgba(16, 185, 129, 0.4)'
                  };
                  
                  return (
                    <button
                      key={feeling.id}
                      className={`feeling-card feeling-card-${style.pattern}`}
                      style={{ 
                        background: style.gradient,
                        '--card-glow': style.glow
                      }}
                      onClick={() => handleFeelingSelect(feeling)}
                      disabled={loading}
                    >
                      <div className="feeling-card-pattern"></div>
                      <div className="feeling-card-content">
                        <h3 className="feeling-name">{feeling.label}</h3>
                        <p className="feeling-desc">{feeling.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {feelings.length === 0 && !error && (
                <div className="loading-state">
                  <div className="spinner"></div>
                  <p>Loading feelings...</p>
                </div>
              )}
            </div>
          ) : (
            /* Verse Display View */
            <div className="verse-view">
              {loading ? (
                <div className="loading-state">
                  <div className="spinner"></div>
                  <p>Finding the perfect verse for you...</p>
                </div>
              ) : verse ? (
                <div className={`verse-card ${showVerse ? 'show' : ''}`}>
                  <div className="verse-header" style={getGradientStyle(verse.ui_theme)}>
                    <span className="feeling-label">{verse.feeling}</span>
                  </div>

                  <div className="verse-content">
                    <div className="verse-text">
                      "{verse.ayah}"
                    </div>

                    <div className="verse-reference">
                      <span className="reference-text">{verse.reference}</span>
                      <a
                        href={verse.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="source-link"
                      >
                        📖 View on Quran.com
                      </a>
                    </div>

                    <div className="verse-actions">
                      <button
                        className="btn btn-primary"
                        onClick={() => handleFeelingSelect(selectedFeeling)}
                      >
                        ✨ Get Another Verse
                      </button>
                      <button
                        className="btn btn-secondary"
                        onClick={handleReset}
                      >
                        🔄 Choose Different Feeling
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="error-message">
              <p>❌ {error}</p>
              <button className="btn btn-secondary" onClick={handleReset}>
                Try Again
              </button>
            </div>
          )}
        </div>
      </main>


      {/* Clean Professional Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-sections-wrapper">
            
            {/* About Section */}
            <div className="footer-section footer-about-section">
              <p className="about-text">
                FindYourPeace connects your emotions with Quranic wisdom, providing personalized verses 
                that offer comfort, guidance, and spiritual connection when you need it most.
              </p>
            </div>

            {/* Contact Form Section */}
            <div className="footer-section footer-contact-section">
              <h3 className="section-title-footer">Contact Me</h3>
              <form className="contact-form" onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const name = formData.get('name');
                const email = formData.get('email');
                const message = formData.get('message');
                
                const subject = `FindYourPeace Feedback from ${name}`;
                const body = `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`;
                
                const mailtoLink = `mailto:syedsajjadhussain014@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                window.location.href = mailtoLink;
              }}>
                <div className="form-row">
                  <div className="form-group">
                    <input 
                      type="text" 
                      name="name"
                      placeholder="Your Name" 
                      required 
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <input 
                      type="email" 
                      name="email"
                      placeholder="Your Email" 
                      required 
                      className="form-input"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <textarea 
                    name="message"
                    placeholder="Your feedback, questions, or problems..." 
                    rows="4" 
                    required 
                    className="form-textarea"
                  ></textarea>
                </div>
                <button type="submit" className="form-submit-btn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="22" y1="2" x2="11" y2="13"/>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                  </svg>
                  <span>Send Message</span>
                </button>
              </form>
            </div>

            {/* LinkedIn Connection */}
            <div className="footer-section footer-linkedin-section">
              <a 
                href="https://www.linkedin.com/in/01syedsajjadhussain/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="linkedin-link"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                <span>Connect on LinkedIn</span>
              </a>
            </div>

          </div>

          {/* Footer Bottom Bar */}
          <div className="footer-bottom">
            <div className="footer-bottom-content">
              <div className="footer-credits">
                <p className="creator-name">
                  Created by <span className="highlight-name"> ~Syed Sajjad Hussain</span>
                </p>
                <p className="copyright-text">
                  © 2025 FindYourPeace. All Rights Reserved.
                </p>
                <p className="dedication-text">
                  Built with love, reflection, and a prayer for peace in every heart.
                </p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
