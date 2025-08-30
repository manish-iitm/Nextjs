'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Link } from 'lucide-react';

interface AnimatedLinkButtonProps {
  onClick: () => void;
  thumbnail: string;
  text?: string;
}

export function AnimatedLinkButton({ onClick, thumbnail, text = 'Read More' }: AnimatedLinkButtonProps) {
  const [isToggled, setIsToggled] = useState(false);

  useEffect(() => {
    if (isToggled) {
      const timer = setTimeout(() => {
        onClick();
        setIsToggled(false);
      }, 500); 
      return () => clearTimeout(timer);
    }
  }, [isToggled, onClick]);

  const handleClick = () => {
    if (!isToggled) {
      setIsToggled(true);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        'relative flex items-center h-10 w-40 cursor-pointer rounded-full p-1 transition-colors duration-300',
        isToggled ? 'bg-green-500' : 'bg-muted'
      )}
      disabled={isToggled}
    >
      <div
        className={cn(
          'absolute flex items-center justify-center h-8 w-8 rounded-full bg-background shadow-md transition-transform duration-500 ease-in-out',
          isToggled ? 'translate-x-[118px] rotate-45' : 'translate-x-0'
        )}
      >
        {thumbnail ? (
          <Image src={thumbnail} alt="toggle icon" width={32} height={32} className="rounded-full object-cover"/>
        ) : (
          <Link className="h-5 w-5 text-muted-foreground" />
        )}
      </div>
      <span className={cn(
        "absolute font-semibold text-sm transition-opacity duration-300",
        isToggled 
          ? 'left-6 text-white opacity-100'
          : 'right-6 text-foreground opacity-100'
      )}>
        {isToggled ? 'Opening...' : text}
      </span>
    </button>
  );
}
