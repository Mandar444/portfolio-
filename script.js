document.addEventListener('DOMContentLoaded', () => {
    // Force Scroll to Top on Refresh
    if (history.scrollRestoration) {
        history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
    // Clear hash without reload
    history.replaceState(null, null, ' ');

    // A4: Nav Scroll Shrink
    const nav = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 40) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }

        // A3: Active Link Update
        updateActiveLink();
    });

    function updateActiveLink() {
        const navLinks = document.querySelectorAll('.nav-links a');
        const scrollPosition = window.scrollY + 100; // Offset for navbar

        let currentSectionId = '';

        // 1. Identify valid targets from Navbar only
        // This ensures unlinked sections (like Paddock) don't break the active state
        navLinks.forEach(link => {
            const id = link.getAttribute('href').substring(1); // remove '#'
            let target = document.getElementById(id);

            if (target) {
                // 2. Handle sticky wrapper containers for pinned sections
                // Use the wrapper's position because the inner section is sticky (top:0)
                if (id === 'projects') {
                    const wrapper = document.querySelector('.gp-pin-wrapper');
                    if (wrapper) target = wrapper;
                }
                if (id === 'skills') {
                    const wrapper = document.querySelector('.skills-pin-wrapper');
                    if (wrapper) target = wrapper;
                }

                // 3. Check if we've scrolled past this target
                // Using getBoundingClientRect + scrollY gives absolute document position
                const rect = target.getBoundingClientRect();
                const absoluteTop = rect.top + window.scrollY;

                if (scrollPosition >= absoluteTop) {
                    currentSectionId = id;
                }
            }
        });

        // 4. Update Classes
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSectionId}`) {
                link.classList.add('active');
            }
        });
    }

    // A8: Project Accordion
    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach(card => {
        const header = card.querySelector('.project-header');
        if (header) {
            header.addEventListener('click', () => {
                // Close others
                projectCards.forEach(c => {
                    if (c !== card) c.classList.remove('active');
                });
                // Toggle current
                card.classList.toggle('active');
            });
        }
    });

    // A5: Typing Effect (Robust)
    const typingText = document.querySelector('.typing-text');
    const roles = ["AI & ML DEVELOPER", "MOBILE APP DEVELOPER", "FULL-STACK ENGINEER", "DATA SCIENCE ENTHUSIAST", "HACKATHON CHAMPION"];
    let roleIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typeSpeed = 58; // 58ms as per PRD

    function typeEffect() {
        const currentRole = roles[roleIndex];

        if (isDeleting) {
            typingText.textContent = currentRole.substring(0, charIndex - 1);
            charIndex--;
            typeSpeed = 38; // Deleting speed
        } else {
            typingText.textContent = currentRole.substring(0, charIndex + 1);
            charIndex++;
            typeSpeed = 58; // Typing speed
        }

        if (!isDeleting && charIndex === currentRole.length) {
            isDeleting = true;
            typeSpeed = 1600; // Hold for 1.6s
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            roleIndex = (roleIndex + 1) % roles.length;
            typeSpeed = 200; // Pause before new word
        }

        setTimeout(typeEffect, typeSpeed);
    }

    if (typingText) {
        setTimeout(typeEffect, 1000); // Start after initial load
    }

    // A2 & A9 & A10: Scroll Reveals
    const observerOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');

                // A10: Trigger Stat Count-up if it's stats section
                if (entry.target.id === 'achievements') {
                    animateStats();
                }
            }
        });
    }, observerOptions);

    document.querySelectorAll('.reveal').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(32px)';
        el.style.transition = 'opacity 0.7s cubic-bezier(0.4, 0, 0.2, 1), transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)';
        observer.observe(el);
    });

    // A9: Timeline Dot Glow Observer (Individual dots)
    const timelineObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, { threshold: 0.3 }); // 30% visibility as per PRD

    document.querySelectorAll('.timeline-item').forEach(item => {
        timelineObserver.observe(item);
    });

    // Mobile Menu Toggle
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const navLinksContainer = document.querySelector('.nav-links');
    const navLinksItems = document.querySelectorAll('.nav-links a');

    if (menuBtn) {
        menuBtn.addEventListener('click', () => {
            menuBtn.classList.toggle('active');
            navLinksContainer.classList.toggle('active');
        });

        // Close menu when link clicked
        navLinksItems.forEach(link => {
            link.addEventListener('click', () => {
                menuBtn.classList.remove('active');
                navLinksContainer.classList.remove('active');
            });
        });
    }

    // Add visible class styling dynamically
    const style = document.createElement('style');
    style.innerHTML = `
        .reveal.visible {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
    `;
    document.head.appendChild(style);

    let statsAnimated = false;
    function animateStats() {
        if (statsAnimated) return;
        statsAnimated = true;

        const stats = document.querySelectorAll('.stat-number');
        stats.forEach(stat => {
            const target = +stat.getAttribute('data-target');
            const duration = 1200; // 1.2s
            const steps = duration / 20; // 60 steps
            const increment = target / steps;

            let current = 0;
            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    current = target;
                    clearInterval(timer);
                }
                stat.textContent = Math.ceil(current);
            }, 20);
        });
    }

    // Skills Horizontal Scroll (Pinning Effect)
    const skillsPinWrapper = document.querySelector('.skills-pin-wrapper');
    const skillsTrack = document.querySelector('.skills-track');

    if (skillsPinWrapper && skillsTrack) {
        window.addEventListener('scroll', () => {
            const rect = skillsPinWrapper.getBoundingClientRect();
            // Position tracking: how much of the pin wrapper has passed the top of the viewport
            const scrollDistance = -rect.top;
            const maxScrollDistance = rect.height - window.innerHeight;

            if (scrollDistance >= 0 && scrollDistance <= maxScrollDistance) {
                const progress = scrollDistance / maxScrollDistance;
                const trackWidth = skillsTrack.scrollWidth;
                const viewportWidth = window.innerWidth;
                const maxTranslate = trackWidth - viewportWidth;

                // Move the track based on scroll progress
                skillsTrack.style.transform = `translateX(${-progress * maxTranslate}px)`;
            } else if (scrollDistance < 0) {
                skillsTrack.style.transform = `translateX(0px)`;
            } else if (scrollDistance > maxScrollDistance) {
                const trackWidth = skillsTrack.scrollWidth;
                const viewportWidth = window.innerWidth;
                skillsTrack.style.transform = `translateX(${- (trackWidth - viewportWidth)}px)`;
            }
        });
    }

    // --- Project Grand Prix Logic (Pinning) ---
    const gpWrapper = document.querySelector('.gp-pin-wrapper');
    const gpTyre = document.getElementById('gp-tyre');
    const gpTrack = document.querySelector('.gp-track-wrapper');
    const checkpoints = document.querySelectorAll('.gp-checkpoint');

    if (gpWrapper && gpTyre) {
        window.addEventListener('scroll', () => {
            const rect = gpWrapper.getBoundingClientRect();
            const scrollDistance = -rect.top;
            const maxScrollDistance = rect.height - window.innerHeight;

            if (scrollDistance >= 0 && scrollDistance <= maxScrollDistance) {
                const progress = scrollDistance / maxScrollDistance;

                // 1. Move the Tyre
                const trackHeight = gpTrack.offsetHeight;
                const tyreHeight = 120; // Match CSS
                const translateY = progress * (trackHeight - tyreHeight);
                gpTyre.style.transform = `translateX(-50%) translateY(${translateY}px)`;

                // 2. Activate Checkpoints
                checkpoints.forEach(checkpoint => {
                    const checkpointTop = checkpoint.offsetTop;
                    const threshold = 120;
                    if (translateY > checkpointTop - threshold && translateY < checkpointTop + threshold) {
                        checkpoint.classList.add('active');
                    } else {
                        checkpoint.classList.remove('active');
                    }
                });
            } else if (scrollDistance < 0) {
                gpTyre.style.transform = `translateX(-50%) translateY(0px)`;
            } else if (scrollDistance > maxScrollDistance) {
                const trackHeight = gpTrack.offsetHeight;
                gpTyre.style.transform = `translateX(-50%) translateY(${trackHeight - 120}px)`;
            }
        });
    }
});
