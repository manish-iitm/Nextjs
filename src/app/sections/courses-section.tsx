'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Course } from '@/lib/types';
import { AlertCircle, Search, GraduationCap, Video, FileText } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface CoursesSectionProps {
  onIframeOpen: (url: string, title: string) => void;
}

const COURSES_URL = 'https://docs.google.com/spreadsheets/d/1akTqv4wrGylGGRg_Ok6vz8Kkk5qFZEXySjF9iMjnHjU/export?format=csv';

const getSampleData = (): Course[] => [
    { title: "Web Development Fundamentals", thumbnail: "https://placehold.co/600x400", lectureLink: "#", testLink: "#", category: "Programming" },
    { title: "Data Science Essentials", thumbnail: "https://placehold.co/600x400", lectureLink: "#", testLink: "#", category: "Data Science" },
    { title: "Machine Learning Basics", thumbnail: "https://placehold.co/600x400", lectureLink: "#", testLink: "#", category: "AI" },
    { title: "Graphic Design Masterclass", thumbnail: "https://placehold.co/600x400", lectureLink: "#", testLink: "#", category: "Design" },
    { title: "Digital Marketing Strategies", thumbnail: "https://placehold.co/600x400", lectureLink: "#", testLink: "#", category: "Marketing" },
    { title: "Mobile App Development", thumbnail: "https://placehold.co/600x400", lectureLink: "#", testLink: "#", category: "Programming" }
];

const parseCSV = (csv: string): Course[] => {
    const lines = csv.split('\n');
    const result: Course[] = [];
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line) {
            const values = line.split(',').map(s => s.trim());
            if (values.length >= 5) {
                result.push({
                    title: values[0] || 'Untitled Course',
                    thumbnail: values[1] || '',
                    lectureLink: values[2] || '#',
                    testLink: values[3] || '#',
                    category: values[4] || 'Uncategorized'
                });
            }
        }
    }
    return result;
};


export default function CoursesSection({ onIframeOpen }: CoursesSectionProps) {
    const [coursesData, setCoursesData] = useState<Course[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const response = await fetch(COURSES_URL);
                if (!response.ok) throw new Error('Network response was not ok');
                const csvData = await response.text();
                const parsedCourses = parseCSV(csvData);
                setCoursesData(parsedCourses);
                const uniqueCategories = [...new Set(parsedCourses.map(course => course.category))].filter(Boolean);
                setCategories(uniqueCategories);
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
                setError(`Failed to load courses. Using sample data. Error: ${errorMessage}`);
                const sampleData = getSampleData();
                setCoursesData(sampleData);
                const uniqueCategories = [...new Set(sampleData.map(course => course.category))].filter(Boolean);
                setCategories(uniqueCategories);
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, []);

    const filteredCourses = useMemo(() => {
        return coursesData.filter(course => {
            const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
            return matchesSearch && matchesCategory;
        });
    }, [coursesData, searchTerm, selectedCategory]);
    
    const handleLinkClick = (url: string, title: string) => {
        if(url && url !== '#') {
            onIframeOpen(url, title);
        }
    }

    return (
        <div className="py-8 px-4 animate-fadeIn">
            <h1 className="mb-8 text-center text-4xl font-bold font-headline text-foreground">Courses</h1>
            
            <Card className="mb-8 p-4 md:p-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-grow">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Search courses by title..."
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
                        <Card key={index} className="flex flex-col">
                           <CardHeader className="p-0">
                                <Skeleton className="h-40 w-full" />
                           </CardHeader>
                           <CardContent className="p-4 flex-grow">
                                <Skeleton className="h-6 w-3/4 mb-2" />
                                <Skeleton className="h-4 w-1/2" />
                           </CardContent>
                           <CardFooter className="p-2 grid grid-cols-2 gap-2">
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                           </CardFooter>
                        </Card>
                    ))}
                </div>
            ) : filteredCourses.length === 0 ? (
                <div className="text-center py-20">
                    <GraduationCap className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="mt-4 text-lg font-semibold">No Courses Found</p>
                    <p className="text-muted-foreground">No courses found matching your criteria.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredCourses.map((course, index) => (
                        <Card key={index} className="flex flex-col overflow-hidden transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg">
                            <CardHeader className="p-0">
                                <div className="relative aspect-video w-full">
                                    <Image
                                        src={course.thumbnail || 'https://placehold.co/600x400'}
                                        alt={course.title}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                        data-ai-hint="course material"
                                    />
                                </div>
                            </CardHeader>
                            <CardContent className="p-4 flex-grow">
                                <CardTitle className="text-lg leading-snug mb-2">{course.title}</CardTitle>
                                <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-secondary text-secondary-foreground">{course.category}</span>
                            </CardContent>
                            <CardFooter className="p-2 grid grid-cols-2 gap-2 border-t mt-auto">
                                <Button onClick={() => handleLinkClick(course.lectureLink, `Lecture: ${course.title}`)} variant="default">
                                    <Video className="mr-2 h-4 w-4" /> Lecture
                                </Button>
                                <Button onClick={() => handleLinkClick(course.testLink, `Test: ${course.title}`)} variant="secondary">
                                   <FileText className="mr-2 h-4 w-4" /> Test
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};
