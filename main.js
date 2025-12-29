import config from './config.json';
import patternsData from './src/data/patterns.json';

// DOM Elements
const heroBg = document.getElementById('hero-bg');
const siteTitle = document.getElementById('site-title');
const tagline = document.getElementById('tagline');
const patternsIntro = document.getElementById('patterns-intro');
const patternGrid = document.getElementById('pattern-grid');
const aboutImg = document.getElementById('about-img');
const aboutBio = document.getElementById('about-bio');
const teachingContent = document.getElementById('teaching-content');
const footerEmail = document.getElementById('footer-email');
const footerPhone = document.getElementById('footer-phone');
const yearSpan = document.getElementById('year');

function init() {
    // Populate from Config
    siteTitle.textContent = config.siteTitle;
    tagline.textContent = config.tagline;
    patternsIntro.innerHTML = config.patternsIntro;
    aboutImg.src = config.about.photoUrl;

    // Format About Bio (line breaks)
    aboutBio.innerHTML = config.about.bio.split('\n\n').map(p => `<p>${p}</p>`).join('');

    // Format Teaching (line breaks)
    teachingContent.innerHTML = config.teaching.split('\n\n').map(p => `<p style="margin-bottom:1.5rem">${p}</p>`).join('');

    // Obfuscated contact info (prevents scraping)
    const emailParts = ['cjstorie', 'gmail', 'com'];
    const emailLink = document.createElement('a');
    emailLink.href = 'mailto:' + emailParts[0] + '@' + emailParts[1] + '.' + emailParts[2];
    emailLink.textContent = emailParts[0] + '@' + emailParts[1] + '.' + emailParts[2];
    emailLink.style.color = 'white';
    emailLink.style.textDecoration = 'none';
    const emailIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    emailIcon.setAttribute('width', '20');
    emailIcon.setAttribute('height', '20');
    emailIcon.setAttribute('viewBox', '0 0 24 24');
    emailIcon.setAttribute('fill', 'none');
    emailIcon.setAttribute('stroke', 'currentColor');
    emailIcon.setAttribute('stroke-width', '2');
    emailIcon.innerHTML = '<path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>';

    footerEmail.innerHTML = '';
    footerEmail.appendChild(emailIcon);
    footerEmail.appendChild(document.createTextNode(' '));
    footerEmail.appendChild(emailLink);

    const phoneIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    phoneIcon.setAttribute('width', '20');
    phoneIcon.setAttribute('height', '20');
    phoneIcon.setAttribute('viewBox', '0 0 24 24');
    phoneIcon.setAttribute('fill', 'none');
    phoneIcon.setAttribute('stroke', 'currentColor');
    phoneIcon.setAttribute('stroke-width', '2');
    phoneIcon.innerHTML = '<path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/>';

    footerPhone.innerHTML = '';
    footerPhone.appendChild(phoneIcon);
    footerPhone.appendChild(document.createTextNode(' ' + config.phone));
    yearSpan.textContent = new Date().getFullYear();

    // Random Hero Background
    if (config.heroImages && config.heroImages.length > 0) {
        const randomIdx = Math.floor(Math.random() * config.heroImages.length);
        heroBg.style.backgroundImage = `url(${config.heroImages[randomIdx]})`;
    }

    // Render Patterns
    renderPatterns(patternsData);

    // Process Logo
    processLogo();
}

function processLogo() {
    const rawLogo = document.getElementById('raw-logo');
    const container = document.getElementById('logo-container');

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = rawLogo.src;

    img.onload = () => {
        // Upscale canvas for sharper rendering on high-DPI screens
        const scale = window.devicePixelRatio || 2;
        const targetHeight = 80;
        const aspect = img.width / img.height;

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Color-to-Alpha Algorithm (Mathematical background removal for smooth edges)
        // Formula: Alpha = 1.0 - min(r, g, b) / 255
        // NewColor = (Color - (1 - alpha) * 255) / alpha
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            // Calculate how "white" the pixel is
            const richness = Math.min(r, g, b);
            const alpha = 255 - richness;

            if (alpha === 0) {
                data[i + 3] = 0;
            } else {
                const a = alpha / 255;
                data[i] = Math.max(0, Math.min(255, (r - (255 * (1 - a))) / a));
                data[i + 1] = Math.max(0, Math.min(255, (g - (255 * (1 - a))) / a));
                data[i + 2] = Math.max(0, Math.min(255, (b - (255 * (1 - a))) / a));
                data[i + 3] = alpha;
            }
        }

        ctx.putImageData(imageData, 0, 0);

        // Set display size
        canvas.style.height = `${targetHeight}px`;
        canvas.style.width = 'auto';

        // Clear container and add new canvas
        container.innerHTML = '';
        container.appendChild(canvas);
    };
}

function renderPatterns(patterns) {
    patternGrid.innerHTML = '';

    patterns.forEach(pattern => {
        const card = document.createElement('div');
        card.className = 'pattern-card';

        card.innerHTML = `
      <img src="${pattern.imgUrl}" alt="${pattern.title}" class="pattern-img" loading="lazy">
      <div class="pattern-info">
        <h3>${pattern.title}</h3>
        <div class="pattern-footer">
          <a href="${pattern.url}" class="buy-btn">View on Etsy</a>
        </div>
      </div>
    `;

        patternGrid.appendChild(card);
    });
}

// Fade in on scroll effect
const observerOptions = {
    threshold: 0.01,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

document.addEventListener('DOMContentLoaded', () => {
    init();

    // Add animation classes to sections
    document.querySelectorAll('section').forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        section.style.transition = 'all 0.8s ease-out';
        observer.observe(section);
    });

    // Handle contact form submission
    const contactForm = document.getElementById('contact-form');
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(contactForm);
        const submitButton = contactForm.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.textContent;

        // Disable button and show loading state
        submitButton.disabled = true;
        submitButton.textContent = 'Sending...';

        try {
            const response = await fetch(contactForm.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                // Show success message
                contactForm.innerHTML = `
                    <div style="text-align: center; padding: 3rem 2rem; background: rgba(106, 95, 122, 0.1); border-radius: 8px;">
                        <h3 style="color: var(--primary-purple); margin-bottom: 1rem; font-size: 1.5rem;">Thank You!</h3>
                        <p style="color: var(--text-dark); font-size: 1.1rem; margin-bottom: 1rem;">Your message has been sent successfully.</p>
                        <p style="color: var(--text-light);">I'll get back to you as soon as possible.</p>
                    </div>
                `;
            } else {
                throw new Error('Form submission failed');
            }
        } catch (error) {
            // Show error message
            alert('Oops! There was a problem sending your message. Please try again or email directly at the address below.');
            submitButton.disabled = false;
            submitButton.textContent = originalButtonText;
        }
    });
});
