// Blog filtering and sorting functionality
let currentFilters = {
    topic: 'all',
    type: 'all',
    media: 'all'
};

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    // Sort by latest first on page load
    sortBlogsByLatest();
    updateResultCount();
    
    // Add click handlers to filter buttons
    document.querySelectorAll('[data-filter]').forEach(button => {
        button.addEventListener('click', function() {
            const filterType = this.dataset.filter;
            const filterValue = this.dataset.value;
            
            // Update active states
            document.querySelectorAll(`[data-filter="${filterType}"]`).forEach(btn => {
                btn.classList.remove('active');
            });
            this.classList.add('active');
            
            // Update current filters
            currentFilters[filterType] = filterValue;
            
            // Apply filters
            applyFilters();
        });
    });
});

function applyFilters() {
    const blogItems = document.querySelectorAll('.blog-item');
    let visibleCount = 0;

    blogItems.forEach(item => {
        const itemTopic = item.dataset.topic;
        const itemType = item.dataset.type;
        const itemMedia = item.dataset.media;
        
        const topicMatch = currentFilters.topic === 'all' || itemTopic === currentFilters.topic;
        const typeMatch = currentFilters.type === 'all' || itemType === currentFilters.type;
        const mediaMatch = currentFilters.media === 'all' || itemMedia === currentFilters.media;
        
        if (topicMatch && typeMatch && mediaMatch) {
            item.style.display = 'block';
            visibleCount++;
        } else {
            item.style.display = 'none';
        }
    });

    updateResultCount(visibleCount);
    
    // Show/hide no results message
    const noResults = document.getElementById('noResults');
    if (visibleCount === 0) {
        noResults.style.display = 'block';
    } else {
        noResults.style.display = 'none';
    }
}

function updateResultCount(visibleCount = null) {
    const total = document.querySelectorAll('.blog-item').length;
    const showing = visibleCount !== null ? visibleCount : total;
    const resultCount = document.getElementById('resultCount');
    
    if (showing === total) {
        resultCount.textContent = `Showing all ${total} posts, sorted by latest`;
    } else {
        resultCount.textContent = `Showing ${showing} of ${total} posts, sorted by latest`;
    }
}

function clearAllFilters() {
    // Reset filters
    currentFilters = {
        topic: 'all',
        type: 'all',
        media: 'all'
    };
    
    // Reset button states
    document.querySelectorAll('[data-filter]').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.value === 'all') {
            btn.classList.add('active');
        }
    });
    
    // Apply changes
    applyFilters();
}

function sortBlogsByLatest() {
    const blogGrid = document.getElementById('blogGrid');
    const blogItems = Array.from(blogGrid.querySelectorAll('.blog-item'));
    
    // Sort by date descending (latest first)
    blogItems.sort((a, b) => {
        return new Date(b.dataset.date) - new Date(a.dataset.date);
    });
    
    // Reorder the items in the DOM
    blogItems.forEach(item => {
        blogGrid.appendChild(item);
    });
}
