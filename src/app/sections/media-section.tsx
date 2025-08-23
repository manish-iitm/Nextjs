
'use client';

import React, { useState, useEffect, useMemo, ReactNode } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Media } from '@/lib/types';
import { AlertCircle, Loader2, Search, Clapperboard, Youtube, Music, Film, PlayCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface MediaSectionProps {
  onIframeOpen: (url: string, title: string) => void;
}

const MEDIA_URL = 'https://docs.google.com/spreadsheets/d/12wibaSapTFZqnDFmJsmQc0uSG5173kOfyqhy9QU0e1A/export?format=csv';

const getSampleData = (): Media[] => [
    { title: "Chill Lofi Beats", thumbnail: "https://placehold.co/600x400", link: "https://open.spotify.com/playlist/37i9dQZF1DWWQRwui0ExPn", category: "Music" },
    { title: "Learn JavaScript in 30 Days", thumbnail: "https://placehold.co/600x400", link: "https://www.youtube.com/watch?v=hdI2bqOjy3c", category: "Education" },
    { title: "Morning Meditation Guide", thumbnail: "https://placehold.co/600x400", link: "https://open.spotify.com/show/5MA2k0T2MNgk5ErMk3fKkc", category: "Wellness" },
    { title: "Documentary: The Deep Ocean", thumbnail: "https://placehold.co/600x400", link: "https://vimeo.com/22439234", category: "Documentary" },
    { title: "Top 100 Greatest Songs", thumbnail: "https://placehold.co/600x400", link: "https://open.spotify.com/playlist/37i9dQZF1DX4JAvHpjipBk", category: "Music" },
    { title: "Web Development Masterclass", thumbnail: "https://placehold.co/600x400", link: "https://www.youtube.com/watch?v=8ASjS4E9iq4", category: "Education" }
];

const parseCSV = (csv: string): Media[] => {
    const lines = csv.split('\n');
    const result: Media[] = [];
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line) {
            const values = line.split(',').map(s => s.trim());
            if (values.length >= 4) {
                result.push({
                    title: values[0] || 'Untitled Media',
                    thumbnail: values[1] || '',
                    link: values[2] || '#',
                    category: values[3] || 'Uncategorized'
                });
            }
        }
    }
    return result;
};

const getPlatformInfo = (link: string): { icon: ReactNode, text: string } => {
    if (link.includes('youtube.com') || link.includes('youtu.be')) return { icon: <Youtube />, text: 'Watch on YouTube' };
    if (link.includes('spotify.com')) return { icon: <Music />, text: 'Listen on Spotify' };
    if (link.includes('vimeo.com')) return { icon: <Film />, text: 'Watch on Vimeo' };
    return { icon: <PlayCircle />, text: 'View Media' };
};


export default function MediaSection({ onIframeOpen }: MediaSectionProps) {
    const [mediaData, setMediaData] = useState<Media[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    useEffect(() => {
        const fetchMedia = async () => {
            try {
                const response = await fetch(MEDIA_URL);
                if (!response.ok) throw new Error('Network response was not ok');
                const csvData = await response.text();
                const parsedMedia = parseCSV(csvData);
                setMediaData(parsedMedia);
                const uniqueCategories = [...new Set(parsedMedia.map(item => item.category))].filter(Boolean);
                setCategories(uniqueCategories);
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
                setError(`Failed to load media. Using sample data. Error: ${errorMessage}`);
                const sampleData = getSampleData();
                setMediaData(sampleData);
                const uniqueCategories = [...new Set(sampleData.map(item => item.category))].filter(Boolean);
                setCategories(uniqueCategories);
            } finally {
                setLoading(false);
            }
        };

        fetchMedia();
    }, []);

    const filteredMedia = useMemo(() => {
        return mediaData.filter(item => {
            const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
            return matchesSearch && matchesCategory;
        });
    }, [mediaData, searchTerm, selectedCategory]);
    
    const handleMediaClick = (media: Media) => {
        if(media.link && media.link !== '#') {
            let url = media.link;
             if (url.includes('spotify.com')) {
                window.open(url, '_blank', 'noopener,noreferrer');
                return;
            }

            if (url.includes("youtube.com/watch")) {
                const videoId = new URL(url).searchParams.get("v");
                if (videoId) {
                    url = `https://www.youtube.com/embed/${videoId}`;
                }
            } else if (url.includes("youtu.be/")) {
                const videoId = new URL(url).pathname.substring(1);
                 if (videoId) {
                    url = `https://www.youtube.com/embed/${videoId}`;
                }
            }
            onIframeOpen(url, media.title);
        }
    }

    return (
        <div className="py-8 px-4 animate-fadeIn">
            <h1 className="mb-8 text-center text-4xl font-bold font-headline text-foreground">Media</h1>
            
            <Card className="mb-8 p-4 md:p-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-grow">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Search media by title..."
                            className="pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                     <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger className="w-full md:w-[200px]">
                            <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {categories.map(category => (
                                <SelectItem key={category} value={category}>{category}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </Card>

            {error && (
                <Alert variant="destructive" className="mb-8">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {Array.from({ length: 8 }).map((_, index) => (
                        <Card key={index}>
                           <CardHeader className="p-0">
                                <Skeleton className="h-40 w-full" />
                           </CardHeader>
                           <CardContent className="p-4">
                                <Skeleton className="h-6 w-3/4 mb-2" />
                                <Skeleton className="h-4 w-1/2" />
                           </CardContent>
                           <CardFooter className="p-0">
                                <Skeleton className="h-10 w-full" />
                           </CardFooter>
                        </Card>
                    ))}
                </div>
            ) : filteredMedia.length === 0 ? (
                <div className="text-center py-20">
                    <Clapperboard className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="mt-4 text-lg font-semibold">No Media Found</p>
                    <p className="text-muted-foreground">No media found matching your criteria.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredMedia.map((item, index) => {
                        const platform = getPlatformInfo(item.link);
                        return (
                            <Card key={index} className="flex flex-col overflow-hidden transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg">
                                <CardHeader className="p-0">
                                    <div className="relative aspect-video w-full">
                                        <Image
                                            src={item.thumbnail || 'https://placehold.co/600x400'}
                                            alt={item.title}
                                            fill
                                            className="object-cover"
                                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                            data-ai-hint="media thumbnail"
                                        />
                                        <div className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white">
                                            {platform.icon}
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-4 flex-grow">
                                    <CardTitle className="text-lg leading-snug mb-2">{item.title}</CardTitle>
                                    <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-secondary text-secondary-foreground">{item.category}</span>
                                </CardContent>
                                <CardFooter className="p-0">
                                    <Button onClick={() => handleMediaClick(item)} className="w-full rounded-t-none" variant="default">
                                        {platform.icon}
                                        <span>{platform.text}</span>
                                    </Button>
                                </CardFooter>
                            </Card>
                        )
                    })}
                </div>
            )}
        </div>
    );
};
