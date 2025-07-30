export interface Story {
  id: string;
  thumbUrl: string;
  imageUrl: string;
  link: string;
  title: string;
}

export interface InstagramPost {
  imageUrl: string;
  title: string;
  link: string;
}

export interface Project {
  name: string;
  icon: string;
  link: string;
  search: string;
}

export interface NewsItem {
  title: string;
  pubDate: string;
  link: string;
  author: string;
  thumbnail: string;
  description: string;
}
