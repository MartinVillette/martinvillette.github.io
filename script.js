document.addEventListener('DOMContentLoaded', () => {
    const cursorCircle = document.getElementById('cursorCircle');
    const buttons = document.querySelectorAll('.project-button');
    const body = document.body;
    const projectImage = document.querySelector('.project-image');
    const projectVideo = document.querySelector('.project-video'); // Add video element
    const header = document.querySelector('.header'); // Reference to header
    const name = document.querySelector('#name'); // Reference to name element
    const primaryButton = document.querySelector('.primary');
    const background = document.getElementById('background');

    // Track mouse position
    const mouse = {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
        isMoving: false,
        lastMoved: Date.now()
    };

    let currentColor = { r: 168, g: 230, b: 207 }; // Default green
    let targetColor = { r: 168, g: 230, b: 207 };
    let lastHoveredColor = { r: 168, g: 230, b: 207 }; // Store last hovered color
    let bubbles = []; // Array to store bubble instances
    let scrollY = 0; // Track scroll position
    let isHoveringProjectButton = false; // Track if hovering over any project button

    // Default fallback colors
    const fallbackColors = [
        { r: 254, g: 66, b: 66 },   // #fe4242
        { r: 0, g: 139, b: 231 }    // #008be7
    ];

    // Initialize colors
    const colorData = body.getAttribute('data-color');
          
    if (colorData) {
        const hex = colorData.replace('#', '');
        const newColor = {
            r: parseInt(hex.substr(0, 2), 16),
            g: parseInt(hex.substr(2, 2), 16),
            b: parseInt(hex.substr(4, 2), 16)
        };
        targetColor = newColor;
        currentColor = newColor;
        if (name) name.style.color = `rgba(${newColor.r}, ${newColor.g}, ${newColor.b}, 0.8)`;
        if (primaryButton) primaryButton.setAttribute('style', `background-color: rgba(${newColor.r}, ${newColor.g}, ${newColor.b}, 0.1)`);
        cursorCircle.style.backgroundColor = `${colorData}80`;
    } else {
        // Use fallback colors when no color data is provided
        const randomFallback = fallbackColors[Math.floor(Math.random() * fallbackColors.length)];
        targetColor = randomFallback;
        currentColor = { ...randomFallback };
        cursorCircle.style.backgroundColor = `rgba(${randomFallback.r}, ${randomFallback.g}, ${randomFallback.b}, 0.5)`;
    }

    // Mouse position tracking
    let mouseX = 0;
    let mouseY = 0;
    let currentImage = null;

    // Bubble class definition
    class Bubble {
        constructor(baseColor, useFallbackColors = false, isEdgeBubble = false) {
            if (useFallbackColors) {
                // When using fallback colors, randomly choose between red and blue
                this.baseColor = fallbackColors[Math.floor(Math.random() * fallbackColors.length)];
            } else {
                this.baseColor = baseColor;
            }
            
            this.color = this.generateColorVariation(this.baseColor);
            this.targetColor = { ...this.color };

            const documentHeight = Math.max(
                body.scrollHeight,
                body.offsetHeight,
                document.documentElement.clientHeight,
                document.documentElement.scrollHeight,
                document.documentElement.offsetHeight
            );
            
            if (isEdgeBubble) {
                // Very huge bubbles positioned at screen edges
                this.size = this.randomBetween(3000, 5000);
                
                // Position at screen edges
                const edge = Math.floor(Math.random() * 4); // 0: left, 1: right, 2: top, 3: bottom
                switch(edge) {
                    case 0: // Left edge
                        this.x = this.randomBetween(-this.size * 0.8, -this.size * 0.4);
                        this.y = this.randomBetween(-this.size/4, documentHeight + this.size/4);
                        break;
                    case 1: // Right edge
                        this.x = this.randomBetween(window.innerWidth + this.size * 0.4, window.innerWidth + this.size * 0.8);
                        this.y = this.randomBetween(-this.size/4, documentHeight + this.size/4);
                        break;
                    case 2: // Top edge
                        this.x = this.randomBetween(-this.size/4, window.innerWidth + this.size/4);
                        this.y = this.randomBetween(-this.size * 0.8, -this.size * 0.4);
                        break;
                    case 3: // Bottom edge
                        this.x = this.randomBetween(-this.size/4, window.innerWidth + this.size/4);
                        this.y = this.randomBetween(documentHeight + this.size * 0.4, documentHeight + this.size * 0.8);
                        break;
                }
                
                // Weaker parallax for edge bubbles
                this.mouseParallaxStrength = this.randomBetween(0.005, 0.015);
                this.scrollParallaxStrength = this.randomBetween(0.05, 0.15);
            } else {
                // Smaller bubbles inside the page
                this.size = this.randomBetween(800, 1800);
                this.x = this.randomBetween(-this.size/4, window.innerWidth + this.size/4);
                this.y = this.randomBetween(-this.size/4, documentHeight + this.size/4);
                
                // Regular parallax for inside bubbles
                this.mouseParallaxStrength = this.randomBetween(0.01, 0.03);
                this.scrollParallaxStrength = this.randomBetween(0.1, 0.4);
            }
            
            this.baseX = this.x;
            this.baseY = this.y;
            
            // Color transition properties
            this.colorTransitionSpeed = this.randomBetween(0.02, 0.05);
            
            // Create DOM element
            this.element = document.createElement('div');
            this.element.className = 'color-bubble';
            this.element.style.width = `${this.size}px`;
            this.element.style.height = `${this.size}px`;
            this.element.style.position = 'absolute';
            this.element.style.borderRadius = '50%';
            this.element.style.pointerEvents = 'none';
            this.element.style.zIndex = '-1';
            this.updateBubbleColor();
            
            // Add to DOM
            background.appendChild(this.element);
            
            // Start animation
            this.update();
        }
        
        randomBetween(min, max) {
            return min + Math.random() * (max - min);
        }
    
        generateColorVariation(baseColor) {
            const variation = 60;
            return {
                r: Math.min(255, Math.max(0, baseColor.r + this.randomBetween(-variation, variation))),
                g: Math.min(255, Math.max(0, baseColor.g + this.randomBetween(-variation, variation))),
                b: Math.min(255, Math.max(0, baseColor.b + this.randomBetween(-variation, variation)))
            };
        }
    
        updateBubbleColor(newBaseColor) {
            if (newBaseColor) {
                this.baseColor = newBaseColor;
                this.targetColor = this.generateColorVariation(newBaseColor);
            }
            
            this.element.style.background = `radial-gradient(circle, 
                rgba(${Math.round(this.color.r)}, ${Math.round(this.color.g)}, ${Math.round(this.color.b)}, 0.6) 0%, 
                rgba(${Math.round(this.color.r)}, ${Math.round(this.color.g)}, ${Math.round(this.color.b)}, 0) 70%)`;
        }
        
        update() {
            // Smooth color transition
            this.color.r += (this.targetColor.r - this.color.r) * this.colorTransitionSpeed;
            this.color.g += (this.targetColor.g - this.color.g) * this.colorTransitionSpeed;
            this.color.b += (this.targetColor.b - this.color.b) * this.colorTransitionSpeed;
            
            // Apply mouse parallax effect
            const mouseParallaxX = (mouse.x - window.innerWidth / 2) * this.mouseParallaxStrength;
            const mouseParallaxY = (mouse.y - window.innerHeight / 2) * this.mouseParallaxStrength;
            
            // Apply scroll parallax effect
            const scrollParallaxY = scrollY * this.scrollParallaxStrength;
            
            // Combine all transformations
            const finalX = this.baseX + mouseParallaxX;
            const finalY = this.baseY + mouseParallaxY - scrollParallaxY;
            
            // Update element position with both parallax effects
            this.element.style.transform = `translate(${finalX}px, ${finalY}px)`;
            
            // Update color
            this.element.style.background = `radial-gradient(circle, 
                rgba(${Math.round(this.color.r)}, ${Math.round(this.color.g)}, ${Math.round(this.color.b)}, 0.6) 0%, 
                rgba(${Math.round(this.color.r)}, ${Math.round(this.color.g)}, ${Math.round(this.color.b)}, 0) 70%)`;
            
            requestAnimationFrame(() => this.update());
        }
    }

    // Function to hide all project media
    function hideAllProjectMedia() {
        if (projectImage) {
            projectImage.classList.remove('visible');
            projectImage.classList.remove('moving');
        }
        
        if (projectVideo) {
            projectVideo.classList.remove('visible');
            projectVideo.classList.remove('moving');
        }
        
        setTimeout(() => {
            if (projectImage && !projectImage.classList.contains('visible')) {
                projectImage.src = '';
            }
            if (projectVideo && !projectVideo.classList.contains('visible')) {
                projectVideo.pause();
                projectVideo.currentTime = 0;
                projectVideo.src = '';
            }
        }, 600);
    }

    // Function to adjust image size based on aspect ratio
    function adjustImageSize(img) {
        // Reset any manual sizing
        img.style.width = 'auto';
        img.style.height = 'auto';
        
        // Wait for image to load to get actual dimensions
        if (img.complete && img.naturalHeight > 0) {
            setImageDimensions(img);
        } else {
            img.onload = () => setImageDimensions(img);
        }
    }

    function setImageDimensions(img) {
        const aspectRatio = img.naturalWidth / img.naturalHeight;
        const maxWidth = window.innerWidth * 0.4; // 40vw
        const maxHeight = window.innerHeight * 0.6; // 60vh
        
        // Calculate dimensions based on aspect ratio and screen constraints
        let width, height;
        
        if (aspectRatio > maxWidth / maxHeight) {
            // Image is wider relative to container - constrain by width
            width = Math.min(maxWidth, img.naturalWidth);
            height = width / aspectRatio;
        } else {
            // Image is taller relative to container - constrain by height
            height = Math.min(maxHeight, img.naturalHeight);
            width = height * aspectRatio;
        }
        
        // Apply the calculated dimensions
        img.style.width = width + 'px';
        img.style.height = height + 'px';
    }

    // Function to hide project media when not hovering any button
    function hideProjectMedia() {
        if (!isHoveringProjectButton) {
            hideAllProjectMedia();
            currentImage = null;
        }
    }

    // Function to show video and hide image
    function showVideo(videoPath) {
        // First hide any existing image
        if (projectImage) {
            projectImage.classList.remove('visible');
            projectImage.classList.remove('moving');
            projectImage.src = '';
        }
        
        // Then show video
        if (projectVideo) {
            currentImage = videoPath;
            projectVideo.src = videoPath;
            adjustVideoSize(projectVideo);
            projectVideo.play();
            
            setTimeout(() => {
                if (projectVideo) {
                    projectVideo.classList.add('visible');
                    projectVideo.classList.remove('moving');
                }
            }, 50);
        }
    }

    // Function to show image and hide video
    function showImage(imagePath) {
        // First hide any existing video
        if (projectVideo) {
            projectVideo.classList.remove('visible');
            projectVideo.classList.remove('moving');
            projectVideo.pause();
            projectVideo.currentTime = 0;
            projectVideo.src = '';
        }
        
        // Then show image
        if (projectImage) {
            currentImage = imagePath;
            projectImage.src = imagePath;
            adjustImageSize(projectImage);
            
            setTimeout(() => {
                if (projectImage) {
                    projectImage.classList.add('visible');
                    projectImage.classList.remove('moving');
                }
            }, 50);
        }
    }

    // Function to adjust video size based on aspect ratio
    function adjustVideoSize(video) {
        if (!video) return;
        
        video.style.width = 'auto';
        video.style.height = 'auto';
        
        if (video.readyState >= 1) {
            setVideoDimensions(video);
        } else {
            video.onloadedmetadata = () => setVideoDimensions(video);
        }
    }
    
    function setVideoDimensions(video) {
        if (!video) return;
        
        const aspectRatio = video.videoWidth / video.videoHeight;
        const maxWidth = window.innerWidth * 0.4;
        const maxHeight = window.innerHeight * 0.6;
        
        let width, height;
        
        if (aspectRatio > maxWidth / maxHeight) {
            width = Math.min(maxWidth, video.videoWidth);
            height = width / aspectRatio;
        } else {
            height = Math.min(maxHeight, video.videoHeight);
            width = height * aspectRatio;
        }
        
        video.style.width = width + 'px';
        video.style.height = height + 'px';
    }

    // Create bubbles based on page type
    function initBubbles(color) {
        // Clear existing bubbles
        bubbles.forEach(bubble => {
            if (bubble.element && bubble.element.parentNode) {
                bubble.element.parentNode.removeChild(bubble.element);
            }
        });
        
        bubbles = [];
        
        // Check if we should use fallback colors (no specific color or default green)
        const shouldUseFallbackColors = !colorData || 
            (color.r === 168 && color.g === 230 && color.b === 207);
        
        // Create edge bubbles (very huge)
        const edgeBubbleCount = 2 + Math.floor(Math.random() * 3); // 2-4 edge bubbles
        for (let i = 0; i < edgeBubbleCount; i++) {
            bubbles.push(new Bubble(color, shouldUseFallbackColors, true));
        }
        
        // Create inside bubbles (smaller)
        const insideBubbleCount = 3 + Math.floor(body.offsetHeight / 400); // 3+ inside bubbles
        for (let i = 0; i < insideBubbleCount; i++) {
            bubbles.push(new Bubble(color, shouldUseFallbackColors, false));
        }
        
        return bubbles;
    }

    // Update bubble colors when target color changes
    function updateBubbleColors(newColor) {
        bubbles.forEach(bubble => {
            bubble.updateBubbleColor(newColor);
        });
    }

    function updateBackgroundColor() {
        currentColor.r += (targetColor.r - currentColor.r) * 0.02;
        currentColor.g += (targetColor.g - currentColor.g) * 0.02;
        currentColor.b += (targetColor.b - currentColor.b) * 0.02;
    
        // Create subtle but visible color variations
        const baseColor = `rgba(${Math.round(currentColor.r)}, ${Math.round(currentColor.g)}, ${Math.round(currentColor.b)}`;
        
        // Lighter variation
        const lighterColor = `rgba(${Math.min(255, Math.round(currentColor.r + 40))}, ${Math.min(255, Math.round(currentColor.g + 40))}, ${Math.min(255, Math.round(currentColor.b + 40))}`;
        
        // Darker variation
        const darkerColor = `rgba(${Math.max(0, Math.round(currentColor.r - 30))}, ${Math.max(0, Math.round(currentColor.g - 30))}, ${Math.max(0, Math.round(currentColor.b - 30))}`;
        
        // Slightly shifted hue variation
        const shiftedColor = `rgba(${Math.min(255, Math.max(0, Math.round(currentColor.r + 20)))}, ${Math.min(255, Math.max(0, Math.round(currentColor.g - 10)))}, ${Math.min(255, Math.max(0, Math.round(currentColor.b + 15)))}`;
    
        // Simple but effective gradient
        body.style.background = `linear-gradient(45deg, 
            ${baseColor}, 0.20), 
            ${lighterColor}, 0.12), 
            ${shiftedColor}, 0.15), 
            ${darkerColor}, 0.18))`;
        
        body.style.backgroundSize = '400% 400%';
        body.style.animation = 'gradientShift 40s ease-in-out infinite';
    
        requestAnimationFrame(updateBackgroundColor);
    }
    
    updateBackgroundColor();

    // Track scroll position for parallax
    window.addEventListener('scroll', () => {
        scrollY = window.pageYOffset || document.documentElement.scrollTop;
    });

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;

        // Update mouse object for bubble interactions
        mouse.x = mouseX;
        mouse.y = mouseY;
        mouse.lastMoved = Date.now();

        cursorCircle.style.left = mouseX + 'px';
        cursorCircle.style.top = mouseY + 'px';

        // Check if mouse is over any project button
        const hoveredElement = document.elementFromPoint(mouseX, mouseY);
        const isOverProjectButton = hoveredElement && (
            hoveredElement.classList.contains('project-button') || 
            hoveredElement.closest('.project-button')
        );
        
        if (!isOverProjectButton && isHoveringProjectButton) {
            isHoveringProjectButton = false;
            hideProjectMedia();
        }

        const coefX = 0.02;
        const coefY = 0.05;
        
        // Update project media translation if visible
        if (currentImage && (projectImage.classList.contains('visible') || projectVideo.classList.contains('visible'))) {
            const moveX = (mouseX - window.innerWidth / 2) * coefX + 'px';
            const moveY = (mouseY - window.innerHeight / 2) * coefY + 'px';
            
            if (projectImage.classList.contains('visible')) {
                projectImage.style.setProperty('--tx', moveX);
                projectImage.style.setProperty('--ty', moveY);
                projectImage.classList.add('moving');
            }
            
            if (projectVideo.classList.contains('visible')) {
                projectVideo.style.setProperty('--tx', moveX);
                projectVideo.style.setProperty('--ty', moveY);
                projectVideo.classList.add('moving');
            }
        }
        
        // Update header movement: smaller coefficients for subtle movement
        if (header) {
            const headerMoveX = (mouseX - window.innerWidth / 2) * 0.005 + 'px';
            const headerMoveY = (mouseY - window.innerHeight / 2) * 0.005 + 'px';
            header.style.setProperty('--hx', headerMoveX);
            header.style.setProperty('--hy', headerMoveY);
        }
    });

    // Project button interactions
    buttons.forEach(button => {
        button.addEventListener('mouseenter', () => {
            isHoveringProjectButton = true;
            
            const imagePath = button.getAttribute('data-image');
            const videoPath = button.getAttribute('data-video');
            const colorData = button.getAttribute('data-color');
          
            if (colorData) {
                const hex = colorData.replace('#', '');
                const newColor = {
                    r: parseInt(hex.substr(0, 2), 16),
                    g: parseInt(hex.substr(2, 2), 16),
                    b: parseInt(hex.substr(4, 2), 16)
                };
                targetColor = newColor;
                lastHoveredColor = newColor;
                if (name) name.style.color = `rgba(${newColor.r}, ${newColor.g}, ${newColor.b}, 0.8)`;
                cursorCircle.style.backgroundColor = `${colorData}80`;
                
                // Update bubble colors
                updateBubbleColors(newColor);
            }
          
            if (videoPath) {
                showVideo(videoPath);
            } else if (imagePath) {
                showImage(imagePath);
            }
        });
      
        button.addEventListener('mouseleave', () => {
            isHoveringProjectButton = false;
            
            targetColor = lastHoveredColor;
            cursorCircle.style.backgroundColor = `rgba(${lastHoveredColor.r}, ${lastHoveredColor.g}, ${lastHoveredColor.b}, 0.5)`;
          
            // Add a small delay before hiding to prevent flickering when moving between buttons
            setTimeout(() => {
                hideProjectMedia(); // Updated function name
            }, 50);
        });
    });

    // Handle window resize to readjust image sizes
    window.addEventListener('resize', () => {
        if (currentImage) {
            if (projectImage.classList.contains('visible')) {
                adjustImageSize(projectImage);
            }
            if (projectVideo.classList.contains('visible')) {
                adjustVideoSize(projectVideo);
            }
        }
    });

    // Initialize bubbles with current color
    window.addEventListener('load', () => {
        bubbles = initBubbles(currentColor);
    });
});