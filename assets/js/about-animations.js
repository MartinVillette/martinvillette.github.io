document.addEventListener('DOMContentLoaded', function() {
    // Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    // Observe all elements with animate-on-scroll class
    document.querySelectorAll('.animate-on-scroll').forEach(el => {
        observer.observe(el);
    });

    // Add staggered animation delays
    document.querySelectorAll('.skills-grid .skill-category').forEach((item, index) => {
        item.style.animationDelay = `${index * 0.1}s`;
    });

    document.querySelectorAll('.achievements-grid .achievement-item').forEach((item, index) => {
        item.style.animationDelay = `${index * 0.1}s`;
    });

    document.querySelectorAll('.contact-links .contact-link').forEach((item, index) => {
        item.style.animationDelay = `${index * 0.1}s`;
    });
});