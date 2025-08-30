'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  const handleThemeChange = (checked: boolean) => {
    setTheme(checked ? 'dark' : 'light');
  };

  return (
    <div className="flex items-center space-x-2">
      <Switch
        id="theme-switch-toggle"
        checked={theme === 'dark'}
        onCheckedChange={handleThemeChange}
        aria-label="Toggle dark mode"
      />
      <Label htmlFor="theme-switch-toggle" className="font-semibold text-primary">
        Dark Mode
      </Label>
    </div>
  );
}
