document.addEventListener('DOMContentLoaded', () => {
  const state = {
    activeSection: 'home',
    projectCategory: null,
    stories: [],
    posts: [],
    projects: [],
    news: [],
    viewedStories: new Set(JSON.parse(localStorage.getItem('viewedStories') || '[]')),
    storyViewer: {
      isOpen: false,
      currentIndex: 0,
    },
    iframeModal: {
      isOpen: false,
      url: '',
      title: '',
    },
    theme: localStorage.getItem('theme') || 'light',
  };

  const contentContainer = document.getElementById('content');
  const bottomNavContainer = document.getElementById('bottom-nav');
  const storyViewerContainer = document.getElementById('story-viewer');
  const iframeModalContainer = document.getElementById('iframe-modal');

  // --- DATA FETCHING ---
  const STORIES_URL = 'https://docs.google.com/spreadsheets/d/1p63AK6_2JPI1prbQpglHi5spB2f1y2PbcdnsvtS74g8/export?format=csv';
  const POSTS_URL = 'https://docs.google.com/spreadsheets/d/1aDM5fGKjmLmYNkkQCW4NuSZsVorj_5ETk9KygVsD0OA/export?format=csv';
  const PROJECTS_URL = 'https://docs.google.com/spreadsheets/d/13ZV6BXtXKp9aQCKc0OHQoLFCRrif32zvx4khFc4bR9w/export?format=csv';
  const RSS_URL = 'https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Fnews.google.com%2Frss';

  const fetchData = async (url) => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Network response was not ok for ${url}`);
      return response;
    } catch (error) {
      console.error(`Failed to fetch data from ${url}:`, error);
      return null;
    }
  };

  const parseCsv = (text) => {
    const rows = text.trim().split('\n').slice(1);
    return rows.map(line => line.split(',').map(c => c.trim()));
  };

  // --- RENDER FUNCTIONS ---

  const renderLoading = () => {
    contentContainer.innerHTML = `<div class="text-center p-8">Loading...</div>`;
  };
  
  const renderError = (message) => {
      contentContainer.innerHTML = `<div class="text-center p-8 text-red-500">${message}</div>`;
  }

  const renderBottomNav = () => {
    const { activeSection } = state;
    let isExpanded = false;

    const navItems = [
      { id: 'home', icon: 'home', label: 'Home' },
      { id: 'projects', icon: 'briefcase', label: 'Projects' },
    ];
    const settingItems = [
      { id: 'contact', icon: 'send', label: 'Contact' },
      { id: 'settings', icon: 'settings', label: 'Settings' },
    ];
    const expandItems = [
      { category: 'Alpha', icon: 'beaker', title: 'Alpha' },
      { category: 'Beta', icon: 'users', title: 'Beta' },
      { category: 'Gamma', icon: 'rocket', title: 'Gamma' },
    ];

    bottomNavContainer.innerHTML = `
      <div class="expand-menu">
        <div class="expand-menu-content">
          ${expandItems.map(item => `
            <a href="#" data-category="${item.category}">
              <i data-lucide="${item.icon}"></i>
              <span>${item.title}</span>
            </a>`).join('')}
        </div>
      </div>
      <div class="nav-content">
        ${navItems.map(item => `<a href="#" data-section="${item.id}" class="${activeSection === item.id ? 'active' : ''}" aria-label="${item.label}"><i data-lucide="${item.icon}"></i></a>`).join('')}
        <button class="expand-button" aria-label="Expand menu"><i data-lucide="plus"></i></button>
        ${settingItems.map(item => `<a href="#" data-section="${item.id}" class="${activeSection === item.id ? 'active' : ''}" aria-label="${item.label}"><i data-lucide="${item.icon}"></i></a>`).join('')}
      </div>
    `;

    const expandMenu = bottomNavContainer.querySelector('.expand-menu');
    const expandButton = bottomNavContainer.querySelector('.expand-button');

    const toggleExpand = (e) => {
        if(e) e.stopPropagation();
        isExpanded = !isExpanded;
        expandMenu.classList.toggle('expanded', isExpanded);
        expandButton.classList.toggle('expanded', isExpanded);
    };

    expandButton.addEventListener('click', toggleExpand);
    
    document.body.addEventListener('click', (e) => {
        if(isExpanded && !bottomNavContainer.contains(e.target)) {
            toggleExpand();
        }
    });

    bottomNavContainer.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        const sectionId = a.dataset.section;
        const category = a.dataset.category;
        
        if (isExpanded) toggleExpand();

        if (category) {
          state.projectCategory = category;
          state.activeSection = 'projects';
        } else if(sectionId) {
          state.activeSection = sectionId;
          if (sectionId === 'projects') {
             state.projectCategory = null; // Reset category
          }
        }
        renderContent();
        renderBottomNav();
      });
    });

    lucide.createIcons();
  };

  const renderContent = () => {
    const { activeSection } = state;
    contentContainer.innerHTML = '';
    contentContainer.className = 'container animate-fadeIn';

    switch (activeSection) {
      case 'home':
        renderHomeSection();
        break;
      case 'projects':
        renderProjectsSection();
        break;
      case 'news':
        renderNewsSection();
        break;
      case 'contact':
        renderContactSection();
        break;
      case 'settings':
        renderSettingsSection();
        break;
      default:
        renderHomeSection();
    }
    window.scrollTo(0, 0);
  };
  
  const createAnimatedButton = (text, url, title, thumbnail) => {
      const button = document.createElement('button');
      button.className = 'animated-link-button';
      button.innerHTML = `
        <div class="icon-container">
            ${thumbnail ? `<img src="${thumbnail}" alt="icon" class="thumb"/>` : `<i data-lucide="link"></i>`}
        </div>
        <span class="text">${text}</span>
      `;

      button.addEventListener('click', () => {
          if (button.classList.contains('toggled')) return;

          button.classList.add('toggled');
          button.querySelector('.text').textContent = 'Opening...';

          setTimeout(() => {
              openIframe(url, title);
              button.classList.remove('toggled');
              button.querySelector('.text').textContent = text;
          }, 500);
      });
      return button;
  }

  const renderHomeSection = async () => {
    renderLoading();
    const [storiesRes, postsRes] = await Promise.all([fetchData(STORIES_URL), fetchData(POSTS_URL)]);
    
    if(!storiesRes || !postsRes) {
        renderError("Could not load home page content.");
        return;
    }

    const storiesText = await storiesRes.text();
    state.stories = parseCsv(storiesText).map(([thumbUrl, imageUrl, link, title], index) => ({ id: `story-${index}`, thumbUrl, imageUrl, link, title: title || 'Untitled' })).filter(s => s.thumbUrl && s.imageUrl);
    state.stories.sort((a,b) => (state.viewedStories.has(a.id) ? 1 : -1) - (state.viewedStories.has(b.id) ? 1 : -1));


    const postsText = await postsRes.text();
    state.posts = parseCsv(postsText).map(([imageUrl, title, link]) => ({ imageUrl, title: title || 'Untitled', link: link || '#' })).filter(p => p.imageUrl);

    contentContainer.innerHTML = `
        <h1 class="text-4xl font-bold text-center mb-8">Home</h1>
        <div class="card mb-8">
            <div class="card-content p-4">
                <div id="stories-container">
                    ${state.stories.map((story, index) => `
                        <div class="story-card" data-story-index="${index}">
                            <img src="${story.imageUrl}" alt="${story.title}" loading="lazy"/>
                            <div class="overlay"></div>
                            <div class="story-card-thumb ${state.viewedStories.has(story.id) ? 'viewed' : ''}">
                                <img src="${story.thumbUrl}" alt=""/>
                            </div>
                            <p class="story-card-title">${story.title}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
        <div id="posts-grid"></div>
    `;

    const postsGrid = document.getElementById('posts-grid');
    state.posts.forEach(post => {
        const postCard = document.createElement('div');
        postCard.className = 'post-card';
        postCard.innerHTML = `
            <div class="post-card-image"><img src="${post.imageUrl}" alt="${post.title}" loading="lazy"/></div>
            <div class="post-card-content">
                <h3>${post.title}</h3>
            </div>
        `;
        if (post.link && post.link !== '#') {
            const button = createAnimatedButton('View Post', post.link, post.title, post.imageUrl);
            postCard.querySelector('.post-card-content').appendChild(button);
        }
        postsGrid.appendChild(postCard);
    });

    contentContainer.querySelectorAll('[data-story-index]').forEach(el => el.addEventListener('click', e => openStory(parseInt(e.currentTarget.dataset.storyIndex))));
    lucide.createIcons();
  };

  const renderProjectsSection = async () => {
    renderLoading();
    const res = await fetchData(PROJECTS_URL);
    if(!res) {
        renderError("Could not load projects.");
        return;
    }

    const text = await res.text();
    state.projects = parseCsv(text).map(([name, icon, link, category]) => ({ name, icon, link, category: (category || '').trim(), search: (name || '').toLowerCase() })).filter(p => p.name && p.link);
    
    const categoryDescriptions = {
        Alpha: 'Alpha is the upcoming and under development projects.',
        Beta: 'Beta is the working projects, but they may have some bugs or issues.',
        Gamma: 'Gamma is for projects that are ready to use.',
    };

    const renderFilteredProjects = () => {
        const searchTerm = document.getElementById('project-search-bar').value.toLowerCase();
        const filtered = state.projects.filter(p => {
            const categoryMatch = !state.projectCategory || p.category.toLowerCase() === state.projectCategory.toLowerCase();
            const searchMatch = !searchTerm || p.search.includes(searchTerm);
            return categoryMatch && searchMatch;
        });
        
        const grid = document.getElementById('project-grid');
        grid.innerHTML = ''; // Clear previous projects

        if (filtered.length > 0) {
            filtered.forEach(project => {
                const projectCard = document.createElement('div');
                projectCard.className = 'project-card';
                projectCard.innerHTML = `
                    <div class="project-icon-container">
                      <img src="${project.icon || 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f4bb.svg'}" alt="${project.name} icon" loading="lazy"/>
                    </div>
                    <h3>${project.name}</h3>
                `;
                const button = createAnimatedButton('View Project', project.link, project.name, project.icon);
                projectCard.appendChild(button);
                grid.appendChild(projectCard);
            });
        } else {
            grid.innerHTML = `<p class="no-projects-found">No projects found.</p>`;
        }

        lucide.createIcons();
    }
    
    const description = state.projectCategory ? categoryDescriptions[state.projectCategory] : '';

    contentContainer.innerHTML = `
        <h1 class="text-4xl font-bold text-center mb-4">${state.projectCategory ? `${state.projectCategory} Projects` : 'All Projects'}</h1>
        ${description ? `<p class="text-lg text-center mb-8 max-w-2xl mx-auto">${description}</p>` : ''}
        <div class="card p-6">
            <div id="project-search-container">
                <i data-lucide="search" class="icon"></i>
                <input type="search" id="project-search-bar" placeholder="Search projects by name..." />
            </div>
            <div id="project-grid"></div>
        </div>
    `;

    lucide.createIcons();
    document.getElementById('project-search-bar').addEventListener('input', renderFilteredProjects);
    renderFilteredProjects();
  };

  const renderNewsSection = async () => {
    renderLoading();
    const res = await fetchData(RSS_URL);
    if(!res) {
        renderError("Could not load news feed.");
        return;
    }
    
    const data = await res.json();
    if(data.status !== 'ok') {
        renderError("Failed to parse news feed.");
        return;
    }

    state.news = data.items.map(item => ({ title: item.title, pubDate: item.pubDate, link: item.link, thumbnail: item.thumbnail, description: item.description }));

    contentContainer.innerHTML = `
        <h1 class="text-4xl font-bold text-center mb-8">Latest News</h1>
        <div class="card max-w-4xl mx-auto">
            <div class="card-header"><h2 class="card-title">Google News Feed</h2></div>
            <div id="news-list" class="card-content">
            </div>
        </div>
    `;

    const newsList = document.getElementById('news-list');
    state.news.forEach(item => {
        const newsItem = document.createElement('div');
        newsItem.className = 'news-item';
        newsItem.innerHTML = `
            ${item.thumbnail ? `<div class="news-item-thumb"><img src="${item.thumbnail}" alt="" loading="lazy"/></div>` : ''}
            <div class="news-item-content">
                <p>${new Date(item.pubDate).toLocaleString()}</p>
                <h3>${item.title}</h3>
            </div>
        `;
        const button = createAnimatedButton('Read More', item.link, item.title, item.thumbnail);
        newsItem.querySelector('.news-item-content').appendChild(button);
        newsList.appendChild(newsItem);
    });

    lucide.createIcons();
  };

  const renderContactSection = () => {
    contentContainer.innerHTML = `
        <h1 class="text-4xl font-bold text-center mb-8">Contact</h1>
        <div class="card max-w-2xl mx-auto">
            <div class="card-header"><h2 class="card-title text-center">Get In Touch</h2></div>
            <div class="card-content">
                <form id="contact-form">
                    <div>
                        <label for="name">Your Name</label>
                        <input type="text" id="name" name="name" required />
                    </div>
                    <div>
                        <label for="email">Your Email</label>
                        <input type="email" id="email" name="email" required />
                    </div>
                    <div>
                        <label for="subject">Subject</label>
                        <input type="text" id="subject" name="subject" required />
                    </div>
                    <div>
                        <label for="message">Message</label>
                        <textarea id="message" name="message" rows="4" required></textarea>
                    </div>
                    <button type="submit">Send Message</button>
                </form>
            </div>
        </div>
    `;

    document.getElementById('contact-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const form = e.target;
      const mailto = `mailto:mpcrack65@gmail.com?subject=${encodeURIComponent(form.subject.value)}&body=${encodeURIComponent(`Name: ${form.name.value}\nEmail: ${form.email.value}\n\nMessage:\n${form.message.value}`)}`;
      window.location.href = mailto;
    });
  };

  const renderSettingsSection = () => {
    contentContainer.innerHTML = `
        <h1 class="text-4xl font-bold text-center mb-8">Settings</h1>
        <div class="card max-w-md mx-auto">
            <div class="card-header"><h2 class="card-title">Appearance</h2></div>
            <div class="card-content">
                <div class="setting-item">
                    <div>
                        <h3>Theme</h3>
                        <p>Select the theme for the application.</p>
                    </div>
                    <label class="theme-switch">
                      <input type="checkbox" id="theme-toggle" ${state.theme === 'dark' ? 'checked' : ''}>
                      <span class="slider"></span>
                    </label>
                </div>
            </div>
        </div>
    `;

    document.getElementById('theme-toggle').addEventListener('change', (e) => {
        setTheme(e.target.checked ? 'dark' : 'light');
    });
  };

  // --- MODALS & VIEWERS ---
  const openStory = (index) => {
    const storyId = state.stories[index].id;
    if (!state.viewedStories.has(storyId)) {
        state.viewedStories.add(storyId);
        localStorage.setItem('viewedStories', JSON.stringify(Array.from(state.viewedStories)));
    }
    state.storyViewer = { isOpen: true, currentIndex: index };
    renderStoryViewer();
  };

  const closeStory = () => {
    state.storyViewer.isOpen = false;
    renderStoryViewer();
  };
  
  const changeStory = (direction) => {
      const newIndex = state.storyViewer.currentIndex + direction;
      if(newIndex >= 0 && newIndex < state.stories.length) {
          openStory(newIndex);
      } else {
          closeStory();
      }
  }

  const renderStoryViewer = () => {
    if (!state.storyViewer.isOpen) {
      storyViewerContainer.innerHTML = '';
      storyViewerContainer.classList.add('hidden');
      return;
    }
    const story = state.stories[state.storyViewer.currentIndex];
    storyViewerContainer.innerHTML = `
      <div class="story-viewer-content">
        <button class="close-btn"><i data-lucide="x"></i></button>
        ${state.storyViewer.currentIndex > 0 ? `<button class="story-nav-btn prev-btn"><i data-lucide="chevron-left"></i></button>` : ''}
        <div class="story-image-container">
            <img src="${story.imageUrl}" alt="${story.title}" class="story-image">
        </div>
        ${state.storyViewer.currentIndex < state.stories.length - 1 ? `<button class="story-nav-btn next-btn"><i data-lucide="chevron-right"></i></button>` : ''}
        <div class="story-info">
        </div>
      </div>
    `;
    const storyInfo = storyViewerContainer.querySelector('.story-info');
    const titleEl = document.createElement('h3');
    titleEl.textContent = story.title;
    storyInfo.appendChild(titleEl);

    if (story.link) {
      const button = createAnimatedButton('Learn More', story.link, story.title, story.thumbUrl);
      button.addEventListener('click', closeStory);
      storyInfo.appendChild(button);
    }
    
    storyViewerContainer.classList.remove('hidden');
    lucide.createIcons();

    storyViewerContainer.querySelector('.close-btn').addEventListener('click', closeStory);
    storyViewerContainer.querySelector('.prev-btn')?.addEventListener('click', () => changeStory(-1));
    storyViewerContainer.querySelector('.next-btn')?.addEventListener('click', () => changeStory(1));
  };

  const openIframe = (url, title) => {
    state.iframeModal = { isOpen: true, url, title };
    renderIframeModal();
  };

  const closeIframe = () => {
    state.iframeModal.isOpen = false;
    renderIframeModal();
  };

  const renderIframeModal = () => {
    if (!state.iframeModal.isOpen) {
      iframeModalContainer.innerHTML = '';
      iframeModalContainer.classList.add('hidden');
      document.body.style.overflow = '';
      return;
    }
    document.body.style.overflow = 'hidden';
    iframeModalContainer.innerHTML = `
      <div class="iframe-modal-content">
        <header class="modal-header">
          <h2>${state.iframeModal.title}</h2>
          <button class="close-btn"><i data-lucide="x"></i></button>
        </header>
        <div class="modal-body">
          <iframe src="${state.iframeModal.url}" title="${state.iframeModal.title}"></iframe>
        </div>
      </div>
    `;
    iframeModalContainer.classList.remove('hidden');
    lucide.createIcons();
    iframeModalContainer.querySelector('.close-btn').addEventListener('click', closeIframe);
  };
  
  // --- THEME ---
  const setTheme = (theme) => {
      state.theme = theme;
      document.documentElement.className = theme;
      localStorage.setItem('theme', theme);
  }

  // --- INITIALIZATION ---
  const init = () => {
    setTheme(state.theme);
    renderContent();
    renderBottomNav();
    
    // Keyboard navigation for story viewer
    window.addEventListener('keydown', (e) => {
        if(state.storyViewer.isOpen) {
            if(e.key === 'Escape') closeStory();
            if(e.key === 'ArrowRight') changeStory(1);
            if(e.key === 'ArrowLeft') changeStory(-1);
        }
        if(state.iframeModal.isOpen) {
            if(e.key === 'Escape') closeIframe();
        }
    });
  };

  init();
});
