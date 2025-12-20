// 3D Water Wave Animation
class WaterWave3D {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.waves = [];
        this.mouseX = 0;
        this.mouseY = 0;
        this.init();
    }

    init() {
        this.canvas.classList.add('water-wave-3d');
        const heroPhone = document.querySelector('.hero-phone');
        if (!heroPhone) return;
        
        heroPhone.style.position = 'relative';
        heroPhone.insertBefore(this.canvas, heroPhone.firstChild);
        
        this.resize();
        window.addEventListener('resize', () => this.resize());
        
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouseX = e.clientX - rect.left;
            this.mouseY = e.clientY - rect.top;
            this.createRipple(this.mouseX, this.mouseY);
        });
        
        this.createWaves();
        this.animate();
    }

    resize() {
        const container = this.canvas.parentElement;
        this.canvas.width = container.offsetWidth;
        this.canvas.height = container.offsetHeight;
    }

    createWaves() {
        for (let i = 0; i < 3; i++) {
            this.waves.push({
                y: this.canvas.height / 2 + i * 50,
                length: 0.01 + i * 0.002,
                amplitude: 30 + i * 15,
                frequency: 0.01 + i * 0.005,
                phase: i * Math.PI / 3,
                opacity: 0.3 - i * 0.08,
                speed: 0.02 + i * 0.01
            });
        }
    }

    createRipple(x, y) {
        this.waves.forEach(wave => {
            wave.ripples = wave.ripples || [];
            wave.ripples.push({
                x: x,
                y: y,
                radius: 0,
                maxRadius: 200,
                speed: 5
            });
        });
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw gradient background
        const gradient = this.ctx.createRadialGradient(
            this.canvas.width / 2, this.canvas.height / 2, 0,
            this.canvas.width / 2, this.canvas.height / 2, this.canvas.width / 2
        );
        gradient.addColorStop(0, 'rgba(102, 126, 234, 0.1)');
        gradient.addColorStop(1, 'rgba(118, 75, 162, 0.05)');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.waves.forEach((wave, index) => {
            this.ctx.beginPath();
            this.ctx.moveTo(0, wave.y);

            for (let x = 0; x < this.canvas.width; x++) {
                let y = wave.y + Math.sin(x * wave.length + wave.phase) * wave.amplitude;
                
                // Add ripple effect
                if (wave.ripples) {
                    wave.ripples.forEach(ripple => {
                        const distance = Math.sqrt(Math.pow(x - ripple.x, 2) + Math.pow(y - ripple.y, 2));
                        if (distance < ripple.radius) {
                            const effect = (ripple.radius - distance) / ripple.radius;
                            y += Math.sin(distance * 0.1) * effect * 20;
                        }
                    });
                }
                
                this.ctx.lineTo(x, y);
            }

            this.ctx.lineTo(this.canvas.width, this.canvas.height);
            this.ctx.lineTo(0, this.canvas.height);
            this.ctx.closePath();

            const waveGradient = this.ctx.createLinearGradient(0, wave.y - 50, 0, this.canvas.height);
            waveGradient.addColorStop(0, `rgba(255, 255, 255, ${wave.opacity})`);
            waveGradient.addColorStop(1, `rgba(255, 255, 255, 0)`);
            this.ctx.fillStyle = waveGradient;
            this.ctx.fill();

            wave.phase += wave.speed;
            
            // Update ripples
            if (wave.ripples) {
                wave.ripples = wave.ripples.filter(ripple => {
                    ripple.radius += ripple.speed;
                    return ripple.radius < ripple.maxRadius;
                });
            }
        });

        requestAnimationFrame(() => this.animate());
    }
}

// Floating Water Bubbles
class WaterBubbles {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.bubbles = [];
        this.init();
    }

    init() {
        this.canvas.classList.add('water-bubbles-canvas');
        document.querySelector('.hero').appendChild(this.canvas);
        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.createBubbles();
        this.animate();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = document.querySelector('.hero').offsetHeight;
    }

    createBubbles() {
        for (let i = 0; i < 20; i++) {
            this.bubbles.push({
                x: Math.random() * this.canvas.width,
                y: this.canvas.height + Math.random() * 200,
                radius: 5 + Math.random() * 20,
                speed: 0.5 + Math.random() * 1.5,
                wobble: Math.random() * Math.PI * 2,
                wobbleSpeed: 0.02 + Math.random() * 0.03,
                opacity: 0.2 + Math.random() * 0.3
            });
        }
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.bubbles.forEach(bubble => {
            // Draw bubble
            this.ctx.beginPath();
            this.ctx.arc(
                bubble.x + Math.sin(bubble.wobble) * 20,
                bubble.y,
                bubble.radius,
                0,
                Math.PI * 2
            );

            // Gradient for 3D effect
            const gradient = this.ctx.createRadialGradient(
                bubble.x + Math.sin(bubble.wobble) * 20 - bubble.radius / 3,
                bubble.y - bubble.radius / 3,
                bubble.radius / 4,
                bubble.x + Math.sin(bubble.wobble) * 20,
                bubble.y,
                bubble.radius
            );
            gradient.addColorStop(0, `rgba(255, 255, 255, ${bubble.opacity * 1.5})`);
            gradient.addColorStop(0.5, `rgba(200, 220, 255, ${bubble.opacity})`);
            gradient.addColorStop(1, `rgba(150, 180, 255, ${bubble.opacity * 0.5})`);

            this.ctx.fillStyle = gradient;
            this.ctx.fill();

            // Highlight
            this.ctx.beginPath();
            this.ctx.arc(
                bubble.x + Math.sin(bubble.wobble) * 20 - bubble.radius / 3,
                bubble.y - bubble.radius / 3,
                bubble.radius / 3,
                0,
                Math.PI * 2
            );
            this.ctx.fillStyle = `rgba(255, 255, 255, ${bubble.opacity * 0.8})`;
            this.ctx.fill();

            // Update position
            bubble.y -= bubble.speed;
            bubble.wobble += bubble.wobbleSpeed;

            // Reset if out of bounds
            if (bubble.y + bubble.radius < 0) {
                bubble.y = this.canvas.height + bubble.radius;
                bubble.x = Math.random() * this.canvas.width;
            }
        });

        requestAnimationFrame(() => this.animate());
    }
}

// Giant Animated Water Drop
class GiantWaterDrop {
    constructor() {
        const dropHTML = `
            <div class="giant-water-drop">
                <svg viewBox="0 0 200 260" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <linearGradient id="waterGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style="stop-color:#4facfe;stop-opacity:0.8" />
                            <stop offset="100%" style="stop-color:#00f2fe;stop-opacity:0.9" />
                        </linearGradient>
                        <filter id="glow">
                            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                            <feMerge>
                                <feMergeNode in="coloredBlur"/>
                                <feMergeNode in="SourceGraphic"/>
                            </feMerge>
                        </filter>
                    </defs>
                    <path class="water-drop-path" d="M100,10 Q150,80 150,140 Q150,200 100,240 Q50,200 50,140 Q50,80 100,10 Z" 
                          fill="url(#waterGradient)" filter="url(#glow)">
                        <animate attributeName="d" 
                                 dur="3s" 
                                 repeatCount="indefinite"
                                 values="
                                     M100,10 Q150,80 150,140 Q150,200 100,240 Q50,200 50,140 Q50,80 100,10 Z;
                                     M100,10 Q155,85 155,145 Q155,205 100,245 Q45,205 45,145 Q45,85 100,10 Z;
                                     M100,10 Q150,80 150,140 Q150,200 100,240 Q50,200 50,140 Q50,80 100,10 Z
                                 "/>
                    </path>
                    <ellipse cx="75" cy="100" rx="20" ry="30" fill="rgba(255,255,255,0.4)">
                        <animate attributeName="ry" dur="3s" repeatCount="indefinite" values="30;35;30"/>
                    </ellipse>
                    <circle cx="100" cy="180" r="8" fill="rgba(255,255,255,0.3)">
                        <animate attributeName="r" dur="2s" repeatCount="indefinite" values="8;12;8"/>
                    </circle>
                </svg>
                <div class="water-stats">
                    <div class="water-stat">
                        <span class="stat-value" data-counter="98.5">0</span>%
                        <span class="stat-label">Water Quality</span>
                    </div>
                </div>
            </div>
        `;
        
        document.querySelector('.hero-content').insertAdjacentHTML('beforeend', dropHTML);
    }
}

// Water Drop Animation
class WaterDrops {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.drops = [];
        this.init();
    }

    init() {
        this.canvas.classList.add('water-drops-canvas');
        document.querySelector('.hero').appendChild(this.canvas);
        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.createDrops();
        this.animate();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = document.querySelector('.hero').offsetHeight;
    }

    createDrops() {
        for (let i = 0; i < 30; i++) {
            this.drops.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height - this.canvas.height,
                speed: 2 + Math.random() * 3,
                length: 10 + Math.random() * 20,
                opacity: 0.3 + Math.random() * 0.3
            });
        }
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.drops.forEach(drop => {
            // Draw drop
            const gradient = this.ctx.createLinearGradient(drop.x, drop.y, drop.x, drop.y + drop.length);
            gradient.addColorStop(0, `rgba(255, 255, 255, 0)`);
            gradient.addColorStop(0.5, `rgba(255, 255, 255, ${drop.opacity})`);
            gradient.addColorStop(1, `rgba(255, 255, 255, 0)`);

            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(drop.x, drop.y, 2, drop.length);

            // Update position
            drop.y += drop.speed;

            // Reset if out of bounds
            if (drop.y > this.canvas.height) {
                drop.y = -drop.length;
                drop.x = Math.random() * this.canvas.width;
            }
        });

        requestAnimationFrame(() => this.animate());
    }
}

// Floating Particles
class WaterParticles {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.init();
    }

    init() {
        this.canvas.classList.add('water-particles-canvas');
        document.querySelector('.hero').appendChild(this.canvas);
        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.createParticles();
        this.animate();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = document.querySelector('.hero').offsetHeight;
    }

    createParticles() {
        for (let i = 0; i < 50; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                radius: 1 + Math.random() * 3,
                speedX: -0.5 + Math.random() * 1,
                speedY: -0.5 + Math.random() * 1,
                opacity: 0.2 + Math.random() * 0.3
            });
        }
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.particles.forEach(particle => {
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity})`;
            this.ctx.fill();

            particle.x += particle.speedX;
            particle.y += particle.speedY;

            if (particle.x < 0 || particle.x > this.canvas.width) particle.speedX *= -1;
            if (particle.y < 0 || particle.y > this.canvas.height) particle.speedY *= -1;
        });

        requestAnimationFrame(() => this.animate());
    }
}

// Number Counter Animation
function animateCounter(element, target, duration = 2000) {
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;

    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = Math.floor(target).toLocaleString();
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current).toLocaleString();
        }
    }, 16);
}

// Scroll Reveal Animation
function setupScrollReveal() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                
                // Animate counters if they exist
                const counters = entry.target.querySelectorAll('[data-counter]');
                counters.forEach(counter => {
                    const target = parseInt(counter.getAttribute('data-counter'));
                    animateCounter(counter, target);
                });
            }
        });
    }, observerOptions);

    document.querySelectorAll('.feature-card, .creator-card, .phone-mockup').forEach(el => {
        el.classList.add('reveal-element');
        observer.observe(el);
    });
}

// Typing Effect for Hero Title
function typingEffect() {
    const title = document.querySelector('.hero h1');
    if (!title) return;

    const text = title.textContent;
    title.textContent = '';
    title.style.opacity = '1';
    
    let index = 0;
    const speed = 100;

    function type() {
        if (index < text.length) {
            title.textContent += text.charAt(index);
            index++;
            setTimeout(type, speed);
        }
    }

    setTimeout(type, 500);
}

// Wave Animation
function createWaveEffect() {
    const wave = document.createElement('div');
    wave.classList.add('wave-animation');
    wave.innerHTML = `
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,0 Q300,80 600,0 T1200,0 L1200,120 L0,120 Z" fill="rgba(255,255,255,0.05)">
                <animate attributeName="d" 
                    dur="10s" 
                    repeatCount="indefinite"
                    values="
                        M0,0 Q300,80 600,0 T1200,0 L1200,120 L0,120 Z;
                        M0,0 Q300,0 600,80 T1200,0 L1200,120 L0,120 Z;
                        M0,0 Q300,80 600,0 T1200,0 L1200,120 L0,120 Z
                    "/>
            </path>
            <path d="M0,20 Q300,100 600,20 T1200,20 L1200,120 L0,120 Z" fill="rgba(255,255,255,0.03)">
                <animate attributeName="d" 
                    dur="15s" 
                    repeatCount="indefinite"
                    values="
                        M0,20 Q300,100 600,20 T1200,20 L1200,120 L0,120 Z;
                        M0,20 Q300,20 600,100 T1200,20 L1200,120 L0,120 Z;
                        M0,20 Q300,100 600,20 T1200,20 L1200,120 L0,120 Z
                    "/>
            </path>
        </svg>
    `;
    document.querySelector('.hero').appendChild(wave);
}

// Ripple Effect on Buttons
function setupRippleEffect() {
    document.querySelectorAll('.btn').forEach(button => {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            ripple.classList.add('ripple-effect');
            
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            
            this.appendChild(ripple);
            
            setTimeout(() => ripple.remove(), 600);
        });
    });
}

// Phone Screen Auto Scroll
function setupPhoneAutoScroll() {
    const phoneContent = document.querySelector('.phone-content');
    if (!phoneContent) return;

    let scrollPosition = 0;
    let direction = 1;
    let isPaused = false;

    function autoScroll() {
        if (!isPaused) {
            scrollPosition += direction * 0.5;
            
            if (scrollPosition >= phoneContent.scrollHeight - phoneContent.clientHeight) {
                direction = -1;
            } else if (scrollPosition <= 0) {
                direction = 1;
            }
            
            phoneContent.scrollTop = scrollPosition;
        }
        requestAnimationFrame(autoScroll);
    }

    phoneContent.addEventListener('mouseenter', () => isPaused = true);
    phoneContent.addEventListener('mouseleave', () => isPaused = false);

    autoScroll();
}

// Stats Counter Section
function addStatsSection() {
    const statsHTML = `
        <section class="stats-section">
            <div class="container">
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon">👥</div>
                        <div class="stat-number" data-counter="10000">0</div>
                        <div class="stat-label">Active Users</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">💧</div>
                        <div class="stat-number" data-counter="500000">0</div>
                        <div class="stat-label">Liters Saved</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">🌍</div>
                        <div class="stat-number" data-counter="50">0</div>
                        <div class="stat-label">Countries</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">📱</div>
                        <div class="stat-number" data-counter="25000">0</div>
                        <div class="stat-label">IoT Devices</div>
                    </div>
                </div>
            </div>
        </section>
    `;

    const featuresSection = document.querySelector('section[style*="Key Features"]').parentElement;
    featuresSection.insertAdjacentHTML('afterend', statsHTML);
}

// Initialize all animations
document.addEventListener('DOMContentLoaded', () => {
    // Add stats section
    addStatsSection();
    
    // Initialize NEW BIG animations
    new WaterWave3D();
    new WaterBubbles();
    new GiantWaterDrop();
    
    // Initialize other animations
    createWaveEffect();
    setupScrollReveal();
    setupRippleEffect();
    setupPhoneAutoScroll();
    
    // Animate the water quality counter
    setTimeout(() => {
        const waterQuality = document.querySelector('.giant-water-drop .stat-value');
        if (waterQuality) {
            animateCounter(waterQuality, 98.5, 3000);
        }
    }, 500);
});
