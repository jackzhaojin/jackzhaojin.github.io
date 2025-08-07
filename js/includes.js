// Simple HTML include utility for static sites
// Note: fetch() doesn't work with file:// protocol due to CORS restrictions
// This is a fallback approach that embeds the content directly

function includeHTML() {
    // Footer HTML
    const footerHTML = `
<!-- Common Footer -->
<footer>
    <div class="social-links">
        <a href="https://www.accenture.com/" target="_blank" class="employer-link">
            <i class="fas fa-building"></i> Accenture
        </a>
        <a href="https://www.linkedin.com/in/jackjin" target="_blank">
            <i class="fab fa-linkedin"></i> Connect on LinkedIn
        </a>
        <a href="https://github.com/jackzhaojin" target="_blank">
            <i class="fab fa-github"></i> GitHub
        </a>
    </div>
</footer>`;

    // Replace footer includes
    const footerElements = document.querySelectorAll('[data-include*="footer.html"]');
    footerElements.forEach(element => {
        element.innerHTML = footerHTML;
    });
}

// Initialize includes when DOM is ready
document.addEventListener('DOMContentLoaded', includeHTML);
