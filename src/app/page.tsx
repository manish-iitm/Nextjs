'use client';

import React, { useState, useCallback, useEffect } from 'react';
import HomeSection from '@/app/sections/home-section';
import ProjectsSection from '@/app/sections/projects-section';
import ContactSection from '@/app/sections/contact-section';
import SettingsSection from '@/app/sections/settings-section';
import NewsSection from '@/app/sections/news-section';
import { BottomNav } from '@/components/layout/bottom-nav';
import { IframeModal } from '@/components/layout/iframe-modal';
import { AnnouncementSheet } from '@/components/announcement-sheet';
import { AnnouncementIcon } from '@/components/announcement-icon';
import { fetchAndParseNotifications } from '@/lib/utils';
import { Notification } from '@/lib/types';

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
  const [isAnnouncementSheetOpen, setIsAnnouncementSheetOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [hasFetched, setHasFetched] = useState(false);

  const checkForNewAnnouncements = useCallback(async () => {
    if (hasFetched) return;
    try {
      const fetchedNotifications = await fetchAndParseNotifications();
      setNotifications(fetchedNotifications);
      const lastReadCount = parseInt(localStorage.getItem('lastReadNotificationCount') || '0', 10);
      const newCount = fetchedNotifications.length - lastReadCount;
      setNotificationCount(newCount > 0 ? newCount : 0);
    } catch (error) {
      console.error("Failed to check for new announcements:", error);
    } finally {
      setHasFetched(true);
    }
  }, [hasFetched]);

  useEffect(() => {
    checkForNewAnnouncements();
  }, [checkForNewAnnouncements]);
  
  const handleNotificationsRead = () => {
    localStorage.setItem('lastReadNotificationCount', notifications.length.toString());
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
      <AnnouncementIcon onOpen={() => setIsAnnouncementSheetOpen(true)} notificationCount={notificationCount} />
      <AnnouncementSheet 
        isOpen={isAnnouncementSheetOpen} 
        onClose={() => setIsAnnouncementSheetOpen(false)} 
        onOpen={handleNotificationsRead}
        notifications={notifications}
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
