'use client';

import React, { useState, useCallback, useEffect } from 'react';
import HomeSection from '@/app/sections/home-section';
import ProjectsSection from '@/app/sections/projects-section';
import ContactSection from '@/app/sections/contact-section';
import SettingsSection from '@/app/sections/settings-section';
import DealsSection from '@/app/sections/deals-section';
import GamesSection from '@/app/sections/games-section';
import MediaSection from '@/app/sections/media-section';
import CoursesSection from '@/app/sections/courses-section';
import ArticleSection from '@/app/sections/article-section';
import { BottomNav } from '@/components/layout/bottom-nav';
import { IframeModal } from '@/components/layout/iframe-modal';
import { AnnouncementSheet } from '@/components/announcement-sheet';
import { AnnouncementIcon } from '@/components/announcement-icon';
import { Notification, NewsItem } from '@/lib/types';
import Papa from 'papaparse';

type Section = 'home' | 'projects' | 'contact' | 'settings' | 'deals' | 'games' | 'media' | 'courses' | 'article';
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
  const [notificationCount, setNotificationCount] = useState(0);
  const [news, setNews] = useState<NewsItem[]>([]);

  const fetchNews = useCallback(async () => {
    try {
      const res = await fetch(ANNOUNCEMENTS_URL);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const csvText = await res.text();
      
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        transformHeader: header => header.toLowerCase().trim(),
        complete: (results) => {
          if (results.errors.length) {
            console.error('Error parsing CSV:', results.errors);
          } else {
            const items: NewsItem[] = (results.data as any[]).map((item: any) => ({
              title: item.title || '',
              pubDate: item.pubdate || new Date().toISOString(),
              link: item.link || '',
              author: item.author || 'Author',
              thumbnail: item.thumbnail || '',
              description: item.description || '',
            })).filter(item => item.title && item.pubDate).reverse();
            setNews(items);
            
            const lastReadCount = parseInt(localStorage.getItem('lastReadNewsCount') || '0', 10);
            const newCount = items.length - lastReadCount;
            setNotificationCount(newCount > 0 ? newCount : 0);
          }
        },
        error: (err: any) => {
          console.error('Error fetching or parsing news:', err);
        }
      });
    } catch (e: any) {
      console.error('Error fetching news:', e);
    }
  }, []);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);
  
  const handleNotificationsRead = () => {
    localStorage.setItem('lastReadNewsCount', news.length.toString());
    setNotificationCount(0);
  };

  const handleIframeOpen = useCallback((url: string, title: string) => {
    let embedUrl = url;
    if (url.includes('spotify.com/playlist') || url.includes('spotify.com/album') || url.includes('spotify.com/track')) {
      window.open(url, '_blank', 'noopener,noreferrer');
      return;
    } else if (url.includes('spotify.com')) {
      embedUrl = url.replace('spotify.com', 'spotify.com/embed');
    }
    
    if (embedUrl.includes("youtube.com/watch")) {
        const videoId = new URL(embedUrl).searchParams.get("v");
        if (videoId) {
            embedUrl = `https://www.youtube.com/embed/${videoId}`;
        }
    } else if (embedUrl.includes("youtu.be/")) {
        const videoId = new URL(embedUrl).pathname.substring(1);
          if (videoId) {
            embedUrl = `https://www.youtube.com/embed/${videoId}`;
        }
    }

    setIframeState({ isOpen: true, url: embedUrl, title });
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
        return <ProjectsSection onIframeOpen={handleIframeOpen} initialCategory={projectCategory} />;
      case 'deals':
        return <DealsSection onIframeOpen={handleIframeOpen} />;
      case 'games':
        return <GamesSection onIframeOpen={handleIframeOpen} />;
      case 'media':
        return <MediaSection onIframeOpen={handleIframeOpen} />;
      case 'courses':
        return <CoursesSection onIframeOpen={handleIframeOpen} />;
      case 'article':
        return <ArticleSection onIframeOpen={handleIframeOpen} />;
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
