document.addEventListener('DOMContentLoaded', function() {
    // Create the table of contents container
    const tocContainer = document.createElement('div');
    tocContainer.className = 'table-of-contents';
    
    // Create the list for TOC items
    const tocList = document.createElement('ul');
    tocList.className = 'toc-list';
    tocContainer.appendChild(tocList);
    
    // Find all section titles in the project
    const sectionTitles = document.querySelectorAll('.section-title');
    // Track sections for intersection observer
    const sections = [];
    
    // Add each section to the TOC
    sectionTitles.forEach((title, index) => {
        // Add an ID to the section title if it doesn't have one
        if (!title.id) {
            title.id = `section-${index}`;
        }
        
        // Use the closest project-section container so the header's not included
        const sectionElement = title.closest('.section');
        if (!sectionElement) return;
        
        // Create list item
        const listItem = document.createElement('li');
        listItem.className = 'toc-item';
        
        // Create link
        const link = document.createElement('a');
        link.className = 'toc-link';
        link.textContent = title.textContent;
        link.href = `#${title.id}`;
        link.setAttribute('data-section', title.id);
        
        // Add smooth scroll on click ensuring section appears 100px below the viewport's top
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.getElementById(title.id);
            // Calculate target position placing section 100px below the top
            const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - 100;
            
            window.scrollTo({
                top: Math.max(0, targetPosition),
                behavior: 'smooth'
            });
        });
        
        listItem.appendChild(link);
        tocList.appendChild(listItem);
        
        // Keep track of the section for intersection observer
        sections.push({
            id: title.id,
            element: sectionElement,
            link: link
        });
    });
    
    // Add TOC to the page
    document.body.appendChild(tocContainer);
    
    // Set up intersection observer to highlight current section
    const observerOptions = {
        rootMargin: "-50% 0px -50% 0px",
        threshold: 0
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const section = sections.find(s => s.element === entry.target);
            if (!section) return;
            
            if (entry.isIntersecting) {
                // Remove active class and section-hover class from all sections
                sections.forEach(s => {
                    s.link.classList.remove('active');
                    s.element.classList.remove('section-hover');
                });
                
                // Add active class to TOC link and section-hover class to section
                section.link.classList.add('active');
                section.element.classList.add('section-hover');
            }
        });
    }, observerOptions);
    
    // Observe all sections
    sections.forEach(section => {
        observer.observe(section.element);
    });

});