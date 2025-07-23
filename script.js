// Language System - works on all pages
class LanguageManager {
    constructor() {
        this.currentLang = localStorage.getItem('selectedLanguage') || 'en';
        this.init();
    }

    init() {
        // Set initial language
        this.setLanguage(this.currentLang);
        
        // Add event listeners to language buttons
        this.setupLanguageButtons();
        
        // Add language switcher to lesson pages if not exists
        this.ensureLanguageSwitcher();
    }

    setupLanguageButtons() {
        const langButtons = document.querySelectorAll('.lang-btn');
        langButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const lang = btn.getAttribute('data-lang');
                this.setLanguage(lang);
            });
        });
    }

    ensureLanguageSwitcher() {
        // If no language switcher exists (on lesson pages), create one
        if (!document.querySelector('.language-switch')) {
            this.createLanguageSwitcher();
        }
    }

    createLanguageSwitcher() {
        const switcher = document.createElement('div');
        switcher.className = 'language-switch';
        switcher.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 1000;
            display: flex;
            gap: 0.5rem;
        `;
        
        switcher.innerHTML = `
            <button class="lang-btn ${this.currentLang === 'en' ? 'active' : ''}" data-lang="en">English</button>
            <button class="lang-btn ${this.currentLang === 'sw' ? 'active' : ''}" data-lang="sw">Kiswahili</button>
        `;
        
        document.body.appendChild(switcher);
        this.setupLanguageButtons(); // Re-setup event listeners
    }

    setLanguage(lang) {
        this.currentLang = lang;
        localStorage.setItem('selectedLanguage', lang);
        
        // Update all translatable elements
        this.updateContent(lang);
        
        // Update active button state
        this.updateActiveButton(lang);
    }

    updateContent(lang) {
        const elements = document.querySelectorAll('[data-en][data-sw]');
        elements.forEach(element => {
            const text = element.getAttribute(`data-${lang}`);
            if (text) {
                element.textContent = text;
            }
        });
    }

    updateActiveButton(lang) {
        const buttons = document.querySelectorAll('.lang-btn');
        buttons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-lang') === lang) {
                btn.classList.add('active');
            }
        });
    }
}

// Lesson Modal System
class LessonModal {
    constructor() {
        this.modal = document.getElementById('lessonModal');
        this.modalTitle = document.getElementById('modalTitle');
        this.modalBody = document.getElementById('modalBody');
        this.closeBtn = document.querySelector('.modal-close');
        
        this.init();
    }

    init() {
        if (!this.modal) return; // Not on main page
        
        // Add event listeners to lesson buttons
        const lessonButtons = document.querySelectorAll('.start-lesson-btn:not(.locked)');
        lessonButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const lessonId = btn.getAttribute('data-lesson');
                this.openLesson(lessonId);
            });
        });

        // Close modal events
        this.closeBtn.addEventListener('click', () => this.closeModal());
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) this.closeModal();
        });

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.style.display === 'block') {
                this.closeModal();
            }
        });
    }

    async openLesson(lessonId) {
        // Show loading
        this.modalTitle.textContent = 'Loading...';
        this.modalBody.innerHTML = '<div style="text-align: center; padding: 2rem;">Loading lesson...</div>';
        this.modal.style.display = 'block';

        try {
            // Load lesson content
            const response = await fetch(`lessons/lesson-${lessonId}.html`);
            if (!response.ok) throw new Error('Lesson not found');
            
            const content = await response.text();
            
            // Update modal content
            this.modalTitle.textContent = `Lesson ${lessonId}`;
            this.modalBody.innerHTML = content;
            
            // Re-apply current language to new content
            window.languageManager.updateContent(window.languageManager.currentLang);
            
        } catch (error) {
            this.modalBody.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: #e53e3e;">
                    <h3>Lesson Coming Soon</h3>
                    <p>This lesson is currently being developed.</p>
                </div>
            `;
        }
    }

    closeModal() {
        this.modal.style.display = 'none';
    }
}

// Progress Tracking System
class ProgressTracker {
    constructor() {
        this.completedLessons = JSON.parse(localStorage.getItem('completedLessons') || '[]');
        this.init();
    }

    init() {
        this.updateLessonStates();
    }

    updateLessonStates() {
        const lessonCards = document.querySelectorAll('.lesson-card');
        lessonCards.forEach((card, index) => {
            const lessonId = card.getAttribute('data-lesson');
            const startBtn = card.querySelector('.start-lesson-btn');
            
            if (this.completedLessons.includes(lessonId)) {
                card.classList.add('completed');
            }
            
            // Unlock next lesson if previous is completed
            if (index === 0 || this.completedLessons.includes(this.getPreviousLessonId(lessonId))) {
                startBtn.classList.remove('locked');
                startBtn.disabled = false;
                const span = startBtn.querySelector('span');
                if (span) {
                    span.setAttribute('data-en', 'Start Lesson');
                    span.setAttribute('data-sw', 'Anza Somo');
                }
            }
        });
    }

    getPreviousLessonId(currentId) {
        const lessons = ['1.1', '1.2', '1.3', '1.4'];
        const currentIndex = lessons.indexOf(currentId);
        return currentIndex > 0 ? lessons[currentIndex - 1] : null;
    }

    completeLesson(lessonId) {
        if (!this.completedLessons.includes(lessonId)) {
            this.completedLessons.push(lessonId);
            localStorage.setItem('completedLessons', JSON.stringify(this.completedLessons));
            this.updateLessonStates();
        }
    }
}

// Smooth scrolling for navigation
function smoothScroll(target) {
    document.querySelector(target).scrollIntoView({
        behavior: 'smooth'
    });
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize language manager (works on all pages)
    window.languageManager = new LanguageManager();
    
    // Initialize lesson modal (only on main page)
    if (document.getElementById('lessonModal')) {
        window.lessonModal = new LessonModal();
    }
    
    // Initialize progress tracker
    window.progressTracker = new ProgressTracker();
    
    console.log('🎯 SafePharma Kids Course initialized');
});

// Utility function for lesson pages navigation
function goBackToMain() {
    window.location.href = '../index.html';
}

function markLessonComplete(lessonId) {
    if (window.progressTracker) {
        window.progressTracker.completeLesson(lessonId);
        
        // Show completion message
        showNotification('Lesson completed! ✅', 'success');
    }
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: ${type === 'success' ? '#10b981' : '#667eea'};
        color: white;
        padding: 1rem 2rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 10000;
        font-weight: 500;
        animation: slideDown 0.3s ease;
    `;
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Add animation styles
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideDown {
            from { opacity: 0; transform: translateX(-50%) translateY(-20px); }
            to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
    `;
    document.head.appendChild(style);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideDown 0.3s ease reverse';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Export for global access
window.goBackToMain = goBackToMain;
window.markLessonComplete = markLessonComplete;
window.showNotification = showNotification;
