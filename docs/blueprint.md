# **App Name**: Netly

## Core Features:

- Link Display: Displays links from the navigation bar. The links can open in the same window or in an iframe.
- Stories: Presents the interactive stories pulled from Google Sheets URL: https://docs.google.com/spreadsheets/d/1p63AK6_2JPI1prbQpglHi5spB2f1y2PbcdnsvtS74g8/export?format=csv
- Instagram Posts: Shows Instagram posts. The data for the Instagram posts come from Google Sheets URL: https://docs.google.com/spreadsheets/d/1aDM5fGKjmLmYNkkQCW4NuSZsVorj_5ETk9KygVsD0OA/export?format=csv
- Project Filtering: Enables searching and filtering of projects; project data comes from a Google Sheets URL: https://docs.google.com/spreadsheets/d/13ZV6BXtXKp9aQCKc0OHQoLFCRrif32zvx4khFc4bR9w/export?format=csv
- Contact Form: A contact form will be displayed allowing users to send messages. The messages are sent using mailto to: 'mpcrack65@gmail.com'
- Theme Toggle: Dark/light mode theme toggle
- Project re-naming: Suggest alternate names for displayed projects; an LLM tool determines when the currently displayed title is low quality.

## Style Guidelines:

- Primary color: Deep sky blue (#3498db), a vibrant and modern hue, conveys trustworthiness.
- Background color: Light gray (#ecf0f1) offers a clean and unobtrusive backdrop, ensuring readability and visual comfort.
- Accent color: Soft purple (#9b59b6) provides contrast and highlights key interactive elements, such as buttons and links.
- Body and headline font: 'PT Sans', a humanist sans-serif which has a modern look with warmth, for both headings and body text.
- Outlined icons from Remixicon to ensure clarity and a contemporary feel. Selected icons align to sections: home, projects, blogs, contact and settings.
- The layout has a navigation bar at the bottom with links to different sections of the web application. When navigation links in the extended navigation menu have a url present in the data, clicking them loads a separate website using an iframe modal.
- Subtle transition animations to give smooth user experience when navigating between pages and loading content in the navigation bar. All of these animations provide clear visual feedback to user interactions.