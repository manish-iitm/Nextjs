'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Article } from '@/lib/types';
import { AlertCircle, Search, Newspaper } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface ArticleSectionProps {
  onIframeOpen: (url: string, title: string) => void;
}

const ARTICLES_URL = 'https://docs.google.com/spreadsheets/d/1x9gScboM65ANb9jhUtQ9Jzb1rZDL_yUqv8aEnHPtjUg/export?format=csv';

const getSampleData = (): Article[] => [
    { title: "The Future of Web Development", thumbnail: "https://placehold.co/600x400", link: "#", category: "Technology" },
    { title: "Understanding AI and Machine Learning", thumbnail: "https://placehold.co/600x400", link: "#", category: "Artificial Intelligence" },
    { title: "Healthy Eating Habits for Programmers", thumbnail: "https://placehold.co/600x400", link: "#", category: "Health" },
    { title: "Best Practices for Remote Work", thumbnail: "https://placehold.co/600x400", link: "#", category: "Career" },
    { title: "Introduction to Blockchain Technology", thumbnail: "https://placehold.co/600x400", link: "#", category: "Technology" },
    { title: "Mental Health in the Tech Industry", thumbnail: "https://placehold.co/600x400", link: "#", category: "Health" }
];

const parseCSV = (csv: string): Article[] => {
    const lines = csv.split('\n');
    const result: Article[] = [];
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line) {
            const values = line.split(',').map(s => s.trim());
            if (values.length >= 4) {
                result.push({
                    title: values[0] || 'Untitled Article',
                    thumbnail: values[1] || '',
                    link: values[2] || '#',
                    category: values[3] || 'Uncategorized'
                });
            }
        }
    }
    return result;
};


export default function ArticleSection({ onIframeOpen }: ArticleSectionProps) {
    const [articlesData, setArticlesData] = useState<Article[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    useEffect(() => {
        const fetchArticles = async () => {
            try {
                const response = await fetch(ARTICLES_URL);
                if (!response.ok) throw new Error('Network response was not ok');
                const csvData = await response.text();
                const parsedArticles = parseCSV(csvData);
                setArticlesData(parsedArticles);
                const uniqueCategories = [...new Set(parsedArticles.map(article => article.category))].filter(Boolean);
                setCategories(uniqueCategories);
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
                setError(`Failed to load articles. Using sample data. Error: ${errorMessage}`);
                const sampleData = getSampleData();
                setArticlesData(sampleData);
                const uniqueCategories = [...new Set(sampleData.map(article => article.category))].filter(Boolean);
                setCategories(uniqueCategories);
            } finally {
                setLoading(false);
            }
        };

        fetchArticles();
    }, []);

    const filteredArticles = useMemo(() => {
        return articlesData.filter(article => {
            const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
            return matchesSearch && matchesCategory;
        });
    }, [articlesData, searchTerm, selectedCategory]);
    
    const handleArticleClick = (article: Article) => {
        if(article.link && article.link !== '#') {
            onIframeOpen(article.link, article.title);
        }
    }

    return (
        <div className="py-8 px-4 animate-fadeIn">
            <h1 className="mb-8 text-center text-4xl font-bold font-headline text-foreground">Articles</h1>
            
            <Card className="mb-8 p-4 md:p-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-grow">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Search articles by title..."
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
            ) : filteredArticles.length === 0 ? (
                <div className="text-center py-20">
                    <Newspaper className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="mt-4 text-lg font-semibold">No Articles Found</p>
                    <p className="text-muted-foreground">No articles found matching your criteria.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredArticles.map((article, index) => (
                        <Card key={index} className="flex flex-col overflow-hidden transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg">
                            <CardHeader className="p-0">
                                <div className="relative aspect-video w-full">
                                    <Image
                                        src={article.thumbnail || 'https://placehold.co/600x400'}
                                        alt={article.title}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                        data-ai-hint="article concept"
                                    />
                                     <div className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white">
                                        <Newspaper />
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-4 flex-grow">
                                <CardTitle className="text-lg leading-snug mb-2">{article.title}</CardTitle>
                                <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-secondary text-secondary-foreground">{article.category}</span>
                            </CardContent>
                            <CardFooter className="p-0">
                                <Button onClick={() => handleArticleClick(article)} className="w-full rounded-t-none" variant="default">
                                    Read Article
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};
