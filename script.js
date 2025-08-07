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

  // --- THEME MANAGEMENT ---
  const setTheme = (theme) => {
    state.theme = theme;
    document.documentElement.className = theme;
    if (theme === 'dark') {
      document.documentElement.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark-mode');
    }
    localStorage.setItem('theme', theme);
  }

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
      { url: 'https://mpgamescr.netlify.app', icon: 'gamepad', title: 'Games' },
      { url: 'https://procr.netlify.app/edufloow', icon: 'book', title: 'EduFloow' },
      { url: 'https://procrblog.blogspot.com', icon: 'article', title: 'Blogs' },
    ];

    bottomNavContainer.innerHTML = `
      <div class="expand-menu">
        <div class="expand-menu-content">
          ${expandItems.map(item => `
            <a href="#" data-url="${item.url}" data-title="${item.title}">
              <i class="ri-${item.icon}-line"></i>
              <span>${item.title}</span>
            </a>`).join('')}
        </div>
      </div>
      <div class="nav-content">
        ${navItems.map(item => `<a href="#" data-section="${item.id}" class="${activeSection === item.id ? 'active' : ''}" aria-label="${item.label}"><i class="ri-${item.icon}-line"></i></a>`).join('')}
        <button class="expand-button" aria-label="Expand menu"><i class="ri-add-line"></i></button>
        ${settingItems.map(item => `<a href="#" data-section="${item.id}" class="${activeSection === item.id ? 'active' : ''}" aria-label="${item.label}"><i class="ri-${item.icon}-line"></i></a>`).join('')}
      </div>
    `;

    const expandMenu = bottomNavContainer.querySelector('.expand-menu');
    const expandButton = bottomNavContainer.querySelector('.expand-button');

    const toggleExpand = () => {
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

    bottomNavContainer.querySelectorAll('a[data-section]').forEach(a => {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        const sectionId = a.dataset.section;
        
        if (isExpanded) toggleExpand();

        if (sectionId === 'projects') {
          state.projectCategory = null;
        }
        state.activeSection = sectionId;
        renderContent();
        renderBottomNav();
      });
    });

    bottomNavContainer.querySelectorAll('a[data-url]').forEach(a => {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        if (isExpanded) toggleExpand();
        openIframe(a.dataset.url, a.dataset.title);
      });
    });
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
            ${thumbnail ? `<img src="${thumbnail}" alt="icon" class="thumb"/>` : `<i class="ri-link"></i>`}
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
    state.stories = parseCsv(storiesText).map(([thumbUrl, imageUrl, link, title], index) => ({ 
      id: `story-${index}`, 
      thumbUrl, 
      imageUrl, 
      link, 
      title: title || 'Untitled' 
    })).filter(s => s.thumbUrl && s.imageUrl);
    
    state.stories.sort((a,b) => (state.viewedStories.has(a.id) ? 1 : -1) - (state.viewedStories.has(b.id) ? 1 : -1));

    const postsText = await postsRes.text();
    state.posts = parseCsv(postsText).map(([imageUrl, title, link]) => ({ 
      imageUrl, 
      title: title || 'Untitled', 
      link: link || '#' 
    })).filter(p => p.imageUrl);

    contentContainer.innerHTML = `
        <h1 class="text-4xl font-bold text-center mb-8">Home</h1>
        <div class="card mb-8">
            <div class="card-content p-4">
                <div id="stories-container" class="flex overflow-x-auto gap-3 pb-3">
                    ${state.stories.map((story, index) => `
                        <div class="story-card relative h-48 w-28 cursor-pointer overflow-hidden rounded-lg shadow-md transition-transform duration-300 hover:scale-105" data-story-index="${index}">
                            <img src="${story.imageUrl}" alt="${story.title}" class="w-full h-full object-cover" loading="lazy"/>
                            <div class="overlay absolute inset-0 bg-gradient-to-b from-transparent to-black/50"></div>
                            <div class="story-card-thumb absolute top-2 left-2 rounded-full p-0.5 ${state.viewedStories.has(story.id) ? 'viewed border-gray-300' : 'border-blue-500'}" style="border: 2px solid;">
                                <img src="${story.thumbUrl}" alt="Thumbnail" class="w-8 h-8 rounded-full"/>
                            </div>
                            <p class="story-card-title absolute bottom-2 left-2 right-2 text-xs font-semibold text-white truncate">${story.title}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
        <div id="posts-grid" class="grid grid-cols-1 md:grid-cols-2 gap-6"></div>
    `;

    const postsGrid = document.getElementById('posts-grid');
    state.posts.forEach(post => {
        const postCard = document.createElement('div');
        postCard.className = 'post-card border border-gray-200 rounded-lg overflow-hidden bg-white flex flex-col';
        postCard.innerHTML = `
            <div class="post-card-image relative w-full pt-[100%]">
                <img src="${post.imageUrl}" alt="${post.title}" class="absolute top-0 left-0 w-full h-full object-cover" loading="lazy"/>
            </div>
            <div class="post-card-content p-4 border-t border-gray-200 flex flex-col items-center justify-center flex-grow">
                <h3 class="font-semibold mb-4 text-center flex-grow">${post.title}</h3>
            </div>
        `;
        
        if (post.link && post.link !== '#') {
            const button = createAnimatedButton('View Post', post.link, post.title, post.imageUrl);
            postCard.querySelector('.post-card-content').appendChild(button);
        }
        postsGrid.appendChild(postCard);
    });

    contentContainer.querySelectorAll('[data-story-index]').forEach(el => {
      el.addEventListener('click', e => openStory(parseInt(e.currentTarget.dataset.storyIndex)));
    });
  };

  const renderProjectsSection = async () => {
    renderLoading();
    const res = await fetchData(PROJECTS_URL);
    if(!res) {
        renderError("Could not load projects.");
        return;
    }

    const text = await res.text();
    state.projects = parseCsv(text).map(([name, icon, link, category]) => ({ 
      name, 
      icon: icon || 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f4bb.svg', 
      link, 
      category: (category || '').trim(), 
      search: (name || '').toLowerCase() 
    })).filter(p => p.name && p.link);
    
    const categoryDescriptions = {
        Alpha: 'Alpha is the upcoming and under development projects.',
        Beta: 'Beta is the working projects, but they may have some bugs or issues.',
        Gamma: 'Gamma is for projects that are ready to use.',
    };

    const renderFilteredProjects = () => {
        const searchTerm = document.getElementById('project-search-bar')?.value.toLowerCase() || '';
        const filtered = state.projects.filter(p => {
            const categoryMatch = !state.projectCategory || p.category.toLowerCase() === state.projectCategory.toLowerCase();
            const searchMatch = !searchTerm || p.search.includes(searchTerm);
            return categoryMatch && searchMatch;
        });
        
        const grid = document.getElementById('project-grid');
        grid.innerHTML = '';

        if (filtered.length > 0) {
            filtered.forEach(project => {
                const projectCard = document.createElement('div');
                projectCard.className = 'project-card border border-gray-200 rounded-xl p-5 text-center cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg flex flex-col items-center h-full';
                projectCard.innerHTML = `
                    <div class="project-icon-container w-20 h-20 rounded-lg mb-4 bg-gray-100 transition-colors duration-300 flex items-center justify-center">
                        <img src="${project.icon}" alt="${project.name} icon" class="project-icon w-full h-full object-contain p-2 transition-transform duration-300" loading="lazy" onerror="this.src='https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f4bb.svg'"/>
                    </div>
                    <h3 class="font-semibold mb-4 flex-grow">${project.name}</h3>
                `;
                const button = createAnimatedButton('View Project', project.link, project.name, project.icon);
                projectCard.appendChild(button);
                projectCard.addEventListener('click', () => openIframe(project.link, project.name));
                grid.appendChild(projectCard);
            });
        } else {
            grid.innerHTML = `<p class="no-projects-found text-center py-8 text-gray-500">No projects found.</p>`;
        }
    }
    
    const description = state.projectCategory ? categoryDescriptions[state.projectCategory] : '';

    contentContainer.innerHTML = `
        <h1 class="text-4xl font-bold text-center mb-4">${state.projectCategory ? `${state.projectCategory} Projects` : 'All Projects'}</h1>
        ${description ? `<p class="text-lg text-center mb-8 max-w-2xl mx-auto">${description}</p>` : ''}
        <div class="card p-6">
            <div id="project-search-container" class="relative max-w-xl mx-auto mb-8">
                <i class="fas fa-search absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                <input type="search" id="project-search-bar" class="w-full pl-12 pr-4 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Search projects by name..." />
            </div>
            <div id="project-grid" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"></div>
        </div>
    `;

    const searchBar = document.getElementById('project-search-bar');
    if (searchBar) {
      searchBar.addEventListener('input', renderFilteredProjects);
    }
    renderFilteredProjects();
  };

  const renderContactSection = () => {
    contentContainer.innerHTML = `
        <h1 class="text-4xl font-bold text-center mb-8">Contact</h1>
        <div class="card max-w-2xl mx-auto">
            <div class="card-header p-6 border-b border-gray-200"><h2 class="card-title text-center text-2xl font-semibold">Get In Touch</h2></div>
            <div class="card-content p-6">
                <form id="contact-form" class="space-y-6">
                    <div>
                        <label for="name" class="block font-medium mb-2">Your Name</label>
                        <input type="text" id="name" name="name" class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                    </div>
                    <div>
                        <label for="email" class="block font-medium mb-2">Your Email</label>
                        <input type="email" id="email" name="email" class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                    </div>
                    <div>
                        <label for="subject" class="block font-medium mb-2">Subject</label>
                        <input type="text" id="subject" name="subject" class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                    </div>
                    <div>
                        <label for="message" class="block font-medium mb-2">Message</label>
                        <textarea id="message" name="message" rows="4" class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500" required></textarea>
                    </div>
                    <button type="submit" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-300">Send Message</button>
                    <div id="form-status" class="hidden p-4 rounded-lg text-center"></div>
                </form>
            </div>
        </div>
    `;

    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
      contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const form = e.target;
        const mailto = `mailto:mpcrack65@gmail.com?subject=${encodeURIComponent(form.subject.value)}&body=${encodeURIComponent(`Name: ${form.name.value}\nEmail: ${form.email.value}\n\nMessage:\n${form.message.value}`)}`;
        window.location.href = mailto;
      });
    }
  };

  const renderSettingsSection = () => {
    contentContainer.innerHTML = `
        <h1 class="text-4xl font-bold text-center mb-8">Settings</h1>
        <div class="card max-w-md mx-auto">
            <div class="card-header p-6 border-b border-gray-200"><h2 class="card-title text-xl font-semibold">Appearance</h2></div>
            <div class="card-content p-6">
                <div class="setting-item flex justify-between items-center p-4 rounded-lg border border-gray-200">
                    <div>
                        <h3 class="font-semibold">Dark Mode</h3>
                        <p class="text-sm text-gray-600">Select the theme for the application.</p>
                    </div>
                    <label class="theme-switch relative inline-block w-14 h-8">
                      <input type="checkbox" id="theme-toggle" class="opacity-0 w-0 h-0" ${state.theme === 'dark' ? 'checked' : ''}>
                      <span class="slider absolute inset-0 bg-gray-300 rounded-full transition-colors duration-300"></span>
                    </label>
                </div>
            </div>
        </div>
    `;

    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
      themeToggle.addEventListener('change', (e) => {
        setTheme(e.target.checked ? 'dark' : 'light');
      });
    }
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
      <div class="story-viewer-content w-full h-full flex items-center justify-center relative">
        <button class="close-btn absolute top-4 right-4 bg-black/20 text-white rounded-full w-10 h-10 flex items-center justify-center z-10">
          <i class="ri-close-line text-xl"></i>
        </button>
        ${state.storyViewer.currentIndex > 0 ? `
          <button class="story-nav-btn prev-btn absolute left-4 top-1/2 -translate-y-1/2 bg-black/20 text-white rounded-full w-14 h-14 flex items-center justify-center z-10">
            <i class="ri-arrow-left-s-line text-xl"></i>
          </button>` : ''}
        <div class="story-image-container w-4/5 h-4/5 max-w-4xl">
            <img src="${story.imageUrl}" alt="${story.title}" class="story-image w-full h-full object-contain">
        </div>
        ${state.storyViewer.currentIndex < state.stories.length - 1 ? `
          <button class="story-nav-btn next-btn absolute right-4 top-1/2 -translate-y-1/2 bg-black/20 text-white rounded-full w-14 h-14 flex items-center justify-center z-10">
            <i class="ri-arrow-right-s-line text-xl"></i>
          </button>` : ''}
        <div class="story-info absolute bottom-16 left-1/2 transform -translate-x-1/2 text-center z-10">
          <h3 class="inline-block bg-black/50 text-white px-4 py-2 rounded-full">${story.title}</h3>
        </div>
      </div>
    `;
    
    if (story.link) {
      const button = createAnimatedButton('Learn More', story.link, story.title, story.thumbUrl);
      button.classList.add('absolute', 'bottom-8', 'left-1/2', 'transform', '-translate-x-1/2', 'z-10');
      button.addEventListener('click', closeStory);
      storyViewerContainer.querySelector('.story-info').appendChild(button);
    }
    
    storyViewerContainer.classList.remove('hidden');
    storyViewerContainer.classList.add('bg-black/90', 'backdrop-blur-sm');

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
      <div class="iframe-modal-content flex flex-col h-full">
        <header class="modal-header bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center">
          <h2 class="iframe-title font-semibold">${state.iframeModal.title}</h2>
          <button class="close-btn text-gray-500 dark:text-gray-300">
            <i class="ri-close-line text-xl"></i>
          </button>
        </header>
        <div class="modal-body flex-grow">
          <iframe src="${state.iframeModal.url}" title="${state.iframeModal.title}" class="w-full h-full border-0"></iframe>
        </div>
      </div>
    `;
    iframeModalContainer.classList.remove('hidden');
    iframeModalContainer.classList.add('bg-white', 'dark:bg-gray-900');

    iframeModalContainer.querySelector('.close-btn').addEventListener('click', closeIframe);
  };
  
  // --- KEYBOARD NAVIGATION ---
  const handleKeyboardNavigation = (e) => {
    if (state.storyViewer.isOpen) {
      if (e.key === 'Escape') closeStory();
      if (e.key === 'ArrowRight') changeStory(1);
      if (e.key === 'ArrowLeft') changeStory(-1);
    }
    if (state.iframeModal.isOpen && e.key === 'Escape') {
      closeIframe();
    }
  };

  // --- INITIALIZATION ---
  const init = () => {
    setTheme(state.theme);
    renderContent();
    renderBottomNav();
    
    // Keyboard navigation
    window.addEventListener('keydown', handleKeyboardNavigation);
  };

  init();
});
