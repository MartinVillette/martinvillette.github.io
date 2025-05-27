document.addEventListener('DOMContentLoaded', () => {
    const cursorCircle = document.getElementById('cursorCircle');
    const buttons = document.querySelectorAll('.project-button');
    const body = document.body;
    const projectImage = document.querySelector('.project-image');
    const header = document.querySelector('.header'); 
    const name = document.querySelector('#name');
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
        cursorCircle.style.backgroundColor = `${colorData}80`;
    } else {
        targetColor = { r: 168, g: 230, b: 207 };
        currentColor = { ...targetColor };
        cursorCircle.style.backgroundColor = `rgba(${targetColor.r}, ${targetColor.g}, ${targetColor.b}, 0.5)`;
    }

    // Mouse position tracking
    let mouseX = 0;
    let mouseY = 0;
    let currentImage = null;

    // Bubble class definition
    class Bubble {
        constructor(baseColor) {
            // Generate a variation of the base color
            this.baseColor = baseColor;
            this.color = this.generateColorVariation(baseColor);
            
            // Target color for smooth transitions
            this.targetColor = { ...this.color };

            const documentHeight = Math.max(
                body.scrollHeight,
                body.offsetHeight,
                document.documentElement.clientHeight,
                document.documentElement.scrollHeight,
                document.documentElement.offsetHeight
            );
            
            
            // Randomize properties
            this.size = this.randomBetween(500, 1600);
            this.x = this.randomBetween(-this.size/4, window.innerWidth + this.size/4);
            this.y = this.randomBetween(-this.size/4, documentHeight + this.size/4);
            
            // Movement properties
            this.speedX = this.randomBetween(-0.3, 0.3);
            this.speedY = this.randomBetween(-0.3, 0.3);
            this.amplitude = this.randomBetween(20, 80);
            this.period = this.randomBetween(8000, 20000);
            this.phase = Math.random() * Math.PI * 2;
            this.startTime = Date.now();
            
            // Mouse interaction properties
            this.avoidRadius = this.size * 0.5;
            this.avoidStrength = this.randomBetween(0.5, 1.5);
            this.avoidEasing = this.randomBetween(0.02, 0.07);
            this.avoidX = 0;
            this.avoidY = 0;
            
            // Color transition properties
            this.colorTransitionSpeed = this.randomBetween(0.02, 0.05);
            
            // Create DOM element
            this.element = document.createElement('div');
            this.element.className = 'color-bubble';
            this.element.style.width = `${this.size}px`;
            this.element.style.height = `${this.size}px`;
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
            // Create variations of the base color
            const variation = 30;
            return {
                r: Math.min(255, Math.max(0, baseColor.r + this.randomBetween(-variation, variation))),
                g: Math.min(255, Math.max(0, baseColor.g + this.randomBetween(-variation, variation))),
                b: Math.min(255, Math.max(0, baseColor.b + this.randomBetween(-variation, variation)))
            };
        }
    
        updateBubbleColor(newBaseColor) {
            if (newBaseColor) {
                this.baseColor = newBaseColor;
                // Set target color for smooth transition
                this.targetColor = this.generateColorVariation(newBaseColor);
            }
            
            // Update the element's color (this now happens in the update loop for smooth transition)
            this.element.style.background = `radial-gradient(circle, 
                rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, 0.7) 0%, 
                rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, 0) 70%)`;
        }
        
        update() {
            const now = Date.now();
            const elapsed = now - this.startTime;
            
            // Calculate position with base movement and sinusoidal wave
            this.x += this.speedX;
            this.y += this.speedY;
            
            // Additional sinusoidal movement
            const sinOffset = Math.sin(elapsed / this.period * Math.PI * 2 + this.phase) * this.amplitude;
            const cosOffset = Math.cos(elapsed / this.period * Math.PI * 2 + this.phase) * this.amplitude;
            
            // Calculate distance to mouse
            const dx = this.x + this.size/2 - mouse.x;
            const dy = this.y + this.size/2 - mouse.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Apply mouse avoidance if mouse is moving and within range
            if (mouse.isMoving && distance < this.avoidRadius) {
                // Calculate repulsion force (stronger when closer)
                const repulsionForce = (this.avoidRadius - distance) / this.avoidRadius;
                
                // Calculate target position to move away from mouse
                const targetAvoidX = dx * repulsionForce * this.avoidStrength;
                const targetAvoidY = dy * repulsionForce * this.avoidStrength;
                
                // Ease toward target avoidance position
                this.avoidX += (targetAvoidX - this.avoidX) * this.avoidEasing;
                this.avoidY += (targetAvoidY - this.avoidY) * this.avoidEasing;
            } else {
                // Gradually return to normal position
                this.avoidX *= 0.95;
                this.avoidY *= 0.95;
            }
            
            // Check if mouse hasn't moved for a while, reduce avoidance effect
            const mouseIdleTime = now - mouse.lastMoved;
            if (mouseIdleTime > 300) {
                const idleFactor = Math.max(0, 1 - (mouseIdleTime - 300) / 1000);
                this.avoidX *= idleFactor;
                this.avoidY *= idleFactor;
            }
            
            // Smooth color transition
            this.color.r += (this.targetColor.r - this.color.r) * this.colorTransitionSpeed;
            this.color.g += (this.targetColor.g - this.color.g) * this.colorTransitionSpeed;
            this.color.b += (this.targetColor.b - this.color.b) * this.colorTransitionSpeed;
            
            // Update the element's color for smooth transition
            this.element.style.background = `radial-gradient(circle, 
                rgba(${Math.round(this.color.r)}, ${Math.round(this.color.g)}, ${Math.round(this.color.b)}, 0.7) 0%, 
                rgba(${Math.round(this.color.r)}, ${Math.round(this.color.g)}, ${Math.round(this.color.b)}, 0) 70%)`;
            
            // Reposition bubbles if they go too far off screen
            if (this.x < -this.size) this.x = window.innerWidth + this.size/2;
            if (this.x > window.innerWidth + this.size) this.x = -this.size/2;
            if (this.y < -this.size) this.y = window.innerHeight + this.size/2;
            if (this.y > window.innerHeight + this.size) this.y = -this.size/2;
            
            // Update element position with all effects combined
            this.element.style.transform = `translate(${this.x + cosOffset + this.avoidX}px, ${this.y + sinOffset + this.avoidY}px)`;
            
            // Continue animation loop
            requestAnimationFrame(() => this.update());
        }
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

    // Create multiple bubbles
    function initBubbles(count, color) {
        // Clear existing bubbles
        bubbles.forEach(bubble => {
            if (bubble.element && bubble.element.parentNode) {
                bubble.element.parentNode.removeChild(bubble.element);
            }
        });
        
        bubbles = [];
        for (let i = 0; i < count; i++) {
            bubbles.push(new Bubble(color));
        }
        return bubbles;
    }

    // Update bubble colors when target color changes
    function updateBubbleColors(newColor) {
        bubbles.forEach(bubble => {
            bubble.updateBubbleColor(newColor);
        });
    }

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;

        // Update mouse object for bubble interactions
        mouse.x = mouseX;
        mouse.y = mouseY;
        mouse.isMoving = true;
        mouse.lastMoved = Date.now();

        // Use the working cursor positioning approach
        cursorCircle.style.left = mouseX + 'px';
        cursorCircle.style.top = mouseY + 'px';

        const coefX = 0.02;
        const coefY = 0.05;
        
        // Update project image translation if visible
        if (currentImage && projectImage.classList.contains('visible')) {
            const moveX = (mouseX - window.innerWidth / 2) * coefX + 'px';
            const moveY = (mouseY - window.innerHeight / 2) * coefY + 'px';
            projectImage.style.setProperty('--tx', moveX);
            projectImage.style.setProperty('--ty', moveY);
            projectImage.classList.add('moving');
        }
        
        // Update header movement: smaller coefficients for subtle movement
        if (header) {
            const headerMoveX = (mouseX - window.innerWidth / 2) * 0.005 + 'px';
            const headerMoveY = (mouseY - window.innerHeight / 2) * 0.005 + 'px';
            header.style.setProperty('--hx', headerMoveX);
            header.style.setProperty('--hy', headerMoveY);
        }
    });

    // For mobile devices
    document.addEventListener('touchmove', (e) => {
        if (e.touches && e.touches[0]) {
            mouse.x = e.touches[0].clientX;
            mouse.y = e.touches[0].clientY;
            mouse.isMoving = true;
            mouse.lastMoved = Date.now();
        }
    });

    // Project button interactions
    buttons.forEach(button => {
        button.addEventListener('mouseenter', () => {
            const imagePath = button.getAttribute('data-image');
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
          
            if (imagePath) {
                currentImage = imagePath;
                projectImage.src = imagePath;
                
                // Adjust image size based on its aspect ratio
                adjustImageSize(projectImage);
                
                setTimeout(() => {
                    projectImage.classList.add('visible');
                    projectImage.classList.remove('moving');
                }, 50);
            }
        });
      
        button.addEventListener('mouseleave', () => {
            targetColor = lastHoveredColor;
            cursorCircle.style.backgroundColor = `rgba(${lastHoveredColor.r}, ${lastHoveredColor.g}, ${lastHoveredColor.b}, 0.5)`;
          
            projectImage.classList.remove('visible');
            projectImage.classList.remove('moving');
          
            setTimeout(() => {
                if (!projectImage.classList.contains('visible')) {
                    currentImage = null;
                    projectImage.src = '';
                }
            }, 600);
        });
    });

    // Handle window resize to readjust image sizes
    window.addEventListener('resize', () => {
        if (currentImage && projectImage.classList.contains('visible')) {
            adjustImageSize(projectImage);
        }
    });
    
    // Initialize bubbles with current color
    window.addEventListener('load', () => {
        // Create number of bubbles depending on the body height
        let  bubbleCount = 6 
        bubbleCount = bubbleCount + Math.floor(body.offsetHeight / 300); // 100px per bubble
        console.log(bubbleCount);
        bubbles = initBubbles(bubbleCount, currentColor); // Create 6 bubbles with the current color
    });
});
