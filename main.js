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
    patternsIntro.textContent = config.patternsIntro;
    aboutImg.src = config.about.photoUrl;

    // Format About Bio (line breaks)
    aboutBio.innerHTML = config.about.bio.split('\n\n').map(p => `<p>${p}</p>`).join('');

    // Format Teaching (line breaks)
    teachingContent.innerHTML = config.teaching.split('\n\n').map(p => `<p style="margin-bottom:1.5rem">${p}</p>`).join('');

    footerEmail.innerHTML = `Email: <a href="mailto:${config.contactEmail}">${config.contactEmail}</a>`;
    footerPhone.textContent = `Phone: ${config.phone}`;
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
          <span class="price">${pattern.price}</span>
          <a href="${pattern.url}" target="_blank" class="buy-btn">View on Etsy</a>
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
});
