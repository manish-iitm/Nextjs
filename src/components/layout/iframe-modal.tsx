'use client';

import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';

interface IframeModalProps {
  url: string;
  title: string;
  onClose: () => void;
}

export function IframeModal({ url, title, onClose }: IframeModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background/95 backdrop-blur-sm">
      <header className="flex h-16 shrink-0 items-center justify-between border-b bg-card px-4">
        <h2 className="text-lg font-semibold text-card-foreground font-headline">{title}</h2>
        <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close modal">
          <X className="h-6 w-6" />
        </Button>
      </header>
      <div className="flex-1">
        <iframe src={url} title={title} className="h-full w-full border-0" />
      </div>
    </div>
  );
}
