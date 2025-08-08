'use client';

import React, { useState, useCallback, useEffect } from 'react';
import HomeSection from '@/app/sections/home-section';
import ProjectsSection from '@/app/sections/projects-section';
import ContactSection from '@/app/sections/contact-section';
import SettingsSection from '@/app/sections/settings-section';
import NewsSection from '@/app/sections/news-section';
import { BottomNav } from '@/components/layout/bottom-nav';
import { IframeModal } from '@/components/layout/iframe-modal';
import { NotificationPopup } from '@/components/notification-popup';

type Section = 'home' | 'projects' | 'contact' | 'settings' | 'news';
export type ProjectCategory = 'Alpha' | 'Beta' | 'Gamma' | null;

export default function Home() {
  const [activeSection, setActiveSection] = useState<Section>('home');
  const [projectCategory, setProjectCategory] = useState<ProjectCategory>(null);
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
  
  const handleCategorySelect = (category: ProjectCategory) => {
    setActiveSection('projects');
    setProjectCategory(category);
  }

  const renderSection = () => {
    switch (activeSection) {
      case 'home':
        return <HomeSection onIframeOpen={handleIframeOpen} />;
      case 'projects':
        return <ProjectsSection onIframeOpen={handleIframeOpen} category={projectCategory} />;
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

      <NotificationPopup />

      <BottomNav 
        activeSection={activeSection} 
        setActiveSection={setActiveSection} 
        onIframeOpen={handleIframeOpen}
        onCategorySelect={handleCategorySelect} 
      />

      {iframeState.isOpen && (
        <IframeModal url={iframeState.url} title={iframeState.title} onClose={handleIframeClose} />
      )}
    </main>
  );
}
