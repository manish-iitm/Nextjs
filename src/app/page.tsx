'use client';

import React, { useState, useCallback, useEffect } from 'react';
import HomeSection from '@/app/sections/home-section';
import ProjectsSection from '@/app/sections/projects-section';
import ContactSection from '@/app/sections/contact-section';
import SettingsSection from '@/app/sections/settings-section';
import { BottomNav } from '@/components/layout/bottom-nav';
import { IframeModal } from '@/components/layout/iframe-modal';
import { AnnouncementSheet } from '@/components/announcement-sheet';
import { AnnouncementIcon } from '@/components/announcement-icon';
import { fetchAndParseNotifications } from '@/lib/utils';
import { Notification, NewsItem } from '@/lib/types';
import Papa from 'papaparse';

type Section = 'home' | 'projects' | 'contact' | 'settings';
export type ProjectCategory = 'Alpha' | 'Beta' | 'Gamma' | null;

const ANNOUNCEMENTS_URL = 'https://docs.google.com/spreadsheets/d/1G0L_oKetzel-cj6nbp2Qf_elgc45YFyJS_pUR4Ytn0A/export?format=csv';

export default function Home() {
  const [activeSection, setActiveSection] = useState<Section>('home');
  const [projectCategory, setProjectCategory] = useState<ProjectCategory>(null);
  const [iframeState, setIframeState] = useState<{ isOpen: boolean; url: string; title: string }>({
    isOpen: false,
    url: '',
    title: '',
  });
  const [isAnnouncementSheetOpen, setIsAnnouncementSheetOpen] = useState(false);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(true);
  const [notificationCount, setNotificationCount] = useState(0);
  const [news, setNews] = useState<NewsItem[]>([]);
  
  const fetchNews = async () => {
    setLoadingAnnouncements(true);
    try {
      const res = await fetch(ANNOUNCEMENTS_URL);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const csvText = await res.text();
      
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.errors.length) {
            console.error('Error parsing CSV:', results.errors);
          } else {
            const items: NewsItem[] = (results.data as any[]).map((item: any) => ({
              title: item.title || '',
              pubDate: item.pubDate || new Date().toISOString(),
              link: item.link || '',
              author: item.author || 'Author',
              thumbnail: item.thumbnail || '',
              description: item.description || '',
            })).filter(item => item.title && item.pubDate);
            setNews(items);
            
            const lastReadCount = parseInt(localStorage.getItem('lastReadNewsCount') || '0', 10);
            const newCount = items.length - lastReadCount;
            setNotificationCount(newCount > 0 ? newCount : 0);
          }
          setLoadingAnnouncements(false);
        },
        error: (err: any) => {
          console.error('Error fetching or parsing news:', err);
          setLoadingAnnouncements(false);
        }
      });

    } catch (e: any) {
      console.error('Error fetching news:', e);
      setLoadingAnnouncements(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);
  
  const handleNotificationsRead = () => {
    localStorage.setItem('lastReadNewsCount', news.length.toString());
    setNotificationCount(0);
  };

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
      case 'contact':
        return <ContactSection />;
      case 'settings':
        return <SettingsSection />;
      default:
        return <HomeSection onIframeOpen={handleIframeOpen} />;
    }
  };
  
  const handleSheetOpen = () => {
    handleNotificationsRead();
    setIsAnnouncementSheetOpen(true);
  }

  return (
    <main className="relative min-h-screen pb-24">
      <AnnouncementIcon onOpen={() => setIsAnnouncementSheetOpen(true)} notificationCount={notificationCount} />
      <AnnouncementSheet 
        isOpen={isAnnouncementSheetOpen} 
        onClose={() => setIsAnnouncementSheetOpen(false)} 
        onOpen={handleNotificationsRead}
        news={news}
        loading={loadingAnnouncements}
        onIframeOpen={handleIframeOpen}
      />
      <div className="container mx-auto">
        {renderSection()}
      </div>

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
