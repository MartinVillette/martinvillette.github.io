document.addEventListener('DOMContentLoaded', () => {
    const cursorCircle = document.getElementById('cursorCircle');
    const buttons = document.querySelectorAll('.project-button');
    const body = document.body;
    const projectImage = document.querySelector('.project-image');
    const header = document.querySelector('.header'); // Reference to header
    const name = document.querySelector('#name'); // Reference to name element

    let currentColor = { r: 168, g: 230, b: 207 }; // Default green
    let targetColor = { r: 168, g: 230, b: 207 };
    let lastHoveredColor = { r: 168, g: 230, b: 207 }; // Store last hovered color

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

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;

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
});

