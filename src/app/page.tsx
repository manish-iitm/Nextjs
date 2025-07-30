'use client';

import React, { useState, useCallback } from 'react';
import HomeSection from '@/app/sections/home-section';
import ProjectsSection from '@/app/sections/projects-section';
import ContactSection from '@/app/sections/contact-section';
import SettingsSection from '@/app/sections/settings-section';
import NewsSection from '@/app/sections/news-section';
import { BottomNav } from '@/components/layout/bottom-nav';
import { IframeModal } from '@/components/layout/iframe-modal';

type Section = 'home' | 'projects' | 'contact' | 'settings' | 'news';

export default function Home() {
  const [activeSection, setActiveSection] = useState<Section>('home');
  const [iframeState, setIframeState] = useState<{ isOpen: boolean; url: string; title: string }>({
    isOpen: false,
    url: '',
    title: '',
  });

  const handleIframeOpen = useCallback((url: string, title: string) => {
    setIframeState({ isOpen: true, url, title });
    document.body.style.overflow = 'hidden';
  }, []);

  const handleIframeClose = useCallback(() => {
    setIframeState({ isOpen: false, url: '', title: '' });
    document.body.style.overflow = '';
  }, []);

  const renderSection = () => {
    switch (activeSection) {
      case 'home':
        return <HomeSection onIframeOpen={handleIframeOpen} />;
      case 'projects':
        return <ProjectsSection onIframeOpen={handleIframeOpen} />;
      case 'news':
        return <NewsSection onIframeOpen={handleIframeOpen} />;
      case 'contact':
        return <ContactSection />;
      case 'settings':
        return <SettingsSection />;
      default:
        return <HomeSection onIframeOpen={handleIframeOpen} />;
    }
  };

  return (
    <main className="relative min-h-screen pb-24">
      <div className="container mx-auto">
        {renderSection()}
      </div>

      <BottomNav 
        activeSection={activeSection} 
        setActiveSection={setActiveSection} 
        onIframeOpen={handleIframeOpen} 
      />

      {iframeState.isOpen && (
        <IframeModal url={iframeState.url} title={iframeState.title} onClose={handleIframeClose} />
      )}
    </main>
  );
}
