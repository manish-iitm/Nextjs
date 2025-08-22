'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Game } from '@/lib/types';
import { AlertCircle, Gamepad2, Search } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface GamesSectionProps {
  onIframeOpen: (url: string, title: string) => void;
}

const GAMES_URL = 'https://docs.google.com/spreadsheets/d/1c-6L8fkiy3sVkGtQUJYE85t1K1l1ZI1XiH89Ck8WFhY/export?format=csv';

const getSampleData = (): Game[] => [
    { title: "Tic Tac Toe Infinite", thumbnail: "https://placehold.co/600x400", link: "#", category: "Puzzle" },
    { title: "Chess Master", thumbnail: "https://placehold.co/600x400", link: "#", category: "Strategy" },
    { title: "Space Adventure", thumbnail: "https://placehold.co/600x400", link: "#", category: "Adventure" },
    { title: "Racing Extreme", thumbnail: "https://placehold.co/600x400", link: "#", category: "Racing" },
    { title: "Word Puzzle", thumbnail: "https://placehold.co/600x400", link: "#", category: "Puzzle" },
    { title: "Fantasy Quest", thumbnail: "https://placehold.co/600x400", link: "#", category: "RPG" }
];

const parseCSV = (csv: string): Game[] => {
    const lines = csv.split('\n');
    const result: Game[] = [];
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line) {
            const values = line.split(',').map(s => s.trim());
            if (values.length >= 4) {
                result.push({
                    title: values[0] || 'Untitled Game',
                    thumbnail: values[1] || '',
                    link: values[2] || '#',
                    category: values[3] || 'Uncategorized'
                });
            }
        }
    }
    return result;
};


export default function GamesSection({ onIframeOpen }: GamesSectionProps) {
    const [gamesData, setGamesData] = useState<Game[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    useEffect(() => {
        const fetchGames = async () => {
            try {
                const response = await fetch(GAMES_URL);
                if (!response.ok) throw new Error('Network response was not ok');
                const csvData = await response.text();
                const parsedGames = parseCSV(csvData);
                setGamesData(parsedGames);
                const uniqueCategories = [...new Set(parsedGames.map(game => game.category))].filter(Boolean);
                setCategories(uniqueCategories);
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
                setError(`Failed to load games. Using sample data. Error: ${errorMessage}`);
                const sampleData = getSampleData();
                setGamesData(sampleData);
                const uniqueCategories = [...new Set(sampleData.map(game => game.category))].filter(Boolean);
                setCategories(uniqueCategories);
            } finally {
                setLoading(false);
            }
        };

        fetchGames();
    }, []);

    const filteredGames = useMemo(() => {
        return gamesData.filter(game => {
            const matchesSearch = game.title.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = selectedCategory === 'all' || game.category === selectedCategory;
            return matchesSearch && matchesCategory;
        });
    }, [gamesData, searchTerm, selectedCategory]);
    
    const handleGameClick = (game: Game) => {
        if(game.link && game.link !== '#') {
            onIframeOpen(game.link, game.title);
        }
    }

    return (
        <div className="py-8 px-4 animate-fadeIn">
            <h1 className="mb-8 text-center text-4xl font-bold font-headline text-foreground">Games Collection</h1>
            
            <Card className="mb-8 p-4 md:p-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-grow">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Search games by title..."
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
                           <CardHeader>
                                <Skeleton className="h-40 w-full" />
                           </CardHeader>
                           <CardContent>
                                <Skeleton className="h-6 w-3/4 mb-2" />
                                <Skeleton className="h-4 w-1/2" />
                           </CardContent>
                           <CardFooter>
                                <Skeleton className="h-10 w-full" />
                           </CardFooter>
                        </Card>
                    ))}
                </div>
            ) : filteredGames.length === 0 ? (
                <div className="text-center py-20">
                    <Gamepad2 className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="mt-4 text-lg font-semibold">No Games Found</p>
                    <p className="text-muted-foreground">No games found matching your criteria.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredGames.map((game, index) => (
                        <Card key={index} className="flex flex-col overflow-hidden transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg">
                            <CardHeader className="p-0">
                                <div className="relative aspect-video w-full">
                                    <Image
                                        src={game.thumbnail || 'https://placehold.co/600x400'}
                                        alt={game.title}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                        data-ai-hint="game"
                                    />
                                </div>
                            </CardHeader>
                            <CardContent className="p-4 flex-grow">
                                <CardTitle className="text-lg leading-snug mb-2">{game.title}</CardTitle>
                                <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-secondary text-secondary-foreground">{game.category}</span>
                            </CardContent>
                            <CardFooter className="p-0">
                                <Button onClick={() => handleGameClick(game)} className="w-full rounded-t-none" variant="default">
                                    Play Game
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};
