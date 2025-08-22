'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Deal } from '@/lib/types';
import { AlertCircle, Loader2, Search, Tag } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface DealsSectionProps {
  onIframeOpen: (url: string, title: string) => void;
}

const DEALS_URL = 'https://docs.google.com/spreadsheets/d/1aRxzczRbGURT6cNdhsj3EwtGK-PYZcgKCt4DVT0kvT0/export?format=csv';

const getSampleData = (): Deal[] => [
    { name: "Premium Web Hosting", thumbnail: "https://placehold.co/600x400", link: "#", category: "Hosting" },
    { name: "E-commerce Theme", thumbnail: "https://placehold.co/600x400", link: "#", category: "Themes" },
    { name: "SEO Optimization Tool", thumbnail: "https://placehold.co/600x400", link: "#", category: "Marketing" },
    { name: "WordPress Plugin Bundle", thumbnail: "https://placehold.co/600x400", link: "#", category: "Plugins" },
    { name: "Social Media Scheduler", thumbnail: "https://placehold.co/600x400", link: "#", category: "Marketing" },
    { name: "Email Marketing Service", thumbnail: "https://placehold.co/600x400", link: "#", category: "Marketing" }
];

const parseCSV = (csv: string): Deal[] => {
    const lines = csv.split('\n');
    const result: Deal[] = [];
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line) {
            const values = line.split(',').map(s => s.trim());
            if (values.length >= 4) {
                result.push({
                    name: values[0] || 'Unnamed Deal',
                    thumbnail: values[1] || '',
                    link: values[2] || '#',
                    category: values[3] || 'Uncategorized'
                });
            }
        }
    }
    return result;
};


export default function DealsSection({ onIframeOpen }: DealsSectionProps) {
    const [dealsData, setDealsData] = useState<Deal[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    useEffect(() => {
        const fetchDeals = async () => {
            try {
                const response = await fetch(DEALS_URL);
                if (!response.ok) throw new Error('Network response was not ok');
                const csvData = await response.text();
                const parsedDeals = parseCSV(csvData);
                setDealsData(parsedDeals);
                const uniqueCategories = [...new Set(parsedDeals.map(deal => deal.category))].filter(Boolean);
                setCategories(uniqueCategories);
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
                setError(`Failed to load deals. Using sample data. Error: ${errorMessage}`);
                const sampleData = getSampleData();
                setDealsData(sampleData);
                const uniqueCategories = [...new Set(sampleData.map(deal => deal.category))].filter(Boolean);
                setCategories(uniqueCategories);
            } finally {
                setLoading(false);
            }
        };

        fetchDeals();
    }, []);

    const filteredDeals = useMemo(() => {
        return dealsData.filter(deal => {
            const matchesSearch = deal.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = selectedCategory === 'all' || deal.category === selectedCategory;
            return matchesSearch && matchesCategory;
        });
    }, [dealsData, searchTerm, selectedCategory]);
    
    const handleDealClick = (deal: Deal) => {
        if(deal.link && deal.link !== '#') {
            onIframeOpen(deal.link, deal.name);
        }
    }

    return (
        <div className="py-8 px-4 animate-fadeIn">
            <h1 className="mb-8 text-center text-4xl font-bold font-headline text-foreground">Deals</h1>
            
            <Card className="mb-8 p-4 md:p-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-grow">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Search deals by name..."
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
            ) : filteredDeals.length === 0 ? (
                <div className="text-center py-20">
                    <Tag className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="mt-4 text-lg font-semibold">No Deals Found</p>
                    <p className="text-muted-foreground">No deals found matching your criteria.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredDeals.map((deal, index) => (
                        <Card key={index} className="flex flex-col overflow-hidden transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg">
                            <CardHeader className="p-0">
                                <div className="relative aspect-video w-full">
                                    <Image
                                        src={deal.thumbnail || 'https://placehold.co/600x400'}
                                        alt={deal.name}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                        data-ai-hint="deal offer"
                                    />
                                </div>
                            </CardHeader>
                            <CardContent className="p-4 flex-grow">
                                <CardTitle className="text-lg leading-snug mb-2">{deal.name}</CardTitle>
                                <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-secondary text-secondary-foreground">{deal.category}</span>
                            </CardContent>
                            <CardFooter className="p-0">
                                <Button onClick={() => handleDealClick(deal)} className="w-full rounded-t-none" variant="default">
                                    View Deal
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};
