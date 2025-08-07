# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a static personal website for Jack Jin (jackzhaojin.github.io) showcasing professional credentials, certifications, and technical blog content. The site is hosted on GitHub Pages and focuses on AI technology and Adobe Experience Manager (AEM) expertise.

**Important**: This project includes a comprehensive **Platform Blueprint** - a detailed technical architecture documentation that demonstrates enterprise-grade documentation practices through intentionally simple implementation. The blueprint serves as both a technical showcase and a practical reference for static site architecture.

## Technology Stack

- **Frontend**: Pure HTML5, CSS3, and vanilla JavaScript
- **No build system**: Static files served directly
- **No dependencies**: Only external CDN for Font Awesome icons
- **Hosting**: GitHub Pages with static file serving

## Architecture & File Structure

### Core Pages
- `index.html` - Homepage with professional overview and navigation
- `blogs.html` - Blog listing page with filtering and sorting functionality  
- `certifications.html` - Professional certifications and achievements display

### Assets Organization
- `css/` - Stylesheets with modular design
  - `styles.css` - Main site styles with CSS custom properties
  - `blogs.css` - Blog-specific styles for filtering UI and layout
- `js/` - Client-side functionality
  - `blog-filters.js` - Blog filtering and sorting logic
  - `includes.js` - HTML include utility for footer reuse
- `includes/` - Reusable HTML components
  - `footer.html` - Common footer markup
- `assets/` - Images and media files

### Documentation Architecture
- `req-and-design/` - Project requirements and design documents
  - Contains comprehensive PRD and technical requirements for blog system
- `platform-blueprint/` - **Comprehensive Technical Architecture Documentation**
  - `platform-blueprint.md` - Executive summary and complete blueprint overview
  - `01-overview.md` - Platform vision and architectural decisions
  - `02-infrastructure.md` - GitHub Pages infrastructure deep dive
  - `03-security.md` - Security framework and threat analysis
  - `04-data-architecture.md` - Data flow and storage strategies
  - `05-api-design.md` - API patterns in static architecture
  - `06-frontend.md` - Modern frontend without frameworks
  - `07-scalability.md` - Performance engineering and scaling
  - `08-monitoring.md` - Observability and error tracking
  - `09-development.md` - Development workflow and CI/CD
  - `10-integrations.md` - External services and API integrations

## Development Approach

### No Build Process (Intentional Design Decision)
- This is a pure static site with no compilation, bundling, or preprocessing
- Files are served directly to browsers
- Changes are immediately visible after file modification
- **Key Insight**: This demonstrates that sophisticated user experiences can be built without complex build processes
- **Jekyll Capability**: GitHub Pages supports Jekyll, but we deliberately chose NOT to use it for maximum simplicity and portability

### JavaScript Architecture
- Vanilla JavaScript with modern ES6+ features
- Event-driven architecture for user interactions
- Client-side filtering and sorting for blog content
- DOM manipulation for dynamic content updates

### CSS Organization
- CSS custom properties (variables) for consistent theming
- Modular stylesheets for different page sections
- Mobile-first responsive design approach
- Component-based styling patterns

## Key Features

### Blog System
- **Dual-dimension filtering**: Topic (AI/AEM) + Content Type (Leadership/Technical)
- **Dynamic sorting**: Latest/oldest with visual indicators
- **Responsive design**: Mobile-optimized filtering UI
- **Static content**: Blog posts embedded directly in HTML

### Professional Showcase
- Certification displays with external links to Credly
- Professional social media integration
- Clean, professional aesthetic matching corporate standards

## Content Management

### Blog Content Structure
Blog posts are embedded directly in `blogs.html` with data attributes:
```html
<a href="..." class="blog-item" 
   data-topic="ai|aem" 
   data-type="technical|leadership" 
   data-media="article|post|video"
   data-date="YYYY-MM-DD">
```

### Adding New Blog Posts
1. Add new blog item to `blogs.html` following existing pattern
2. Ensure proper data attributes for filtering
3. Update result count in blog-filters.js if needed
4. Follow existing CSS classes and styling patterns

## Code Patterns & Conventions

### HTML Structure
- Semantic HTML5 elements
- Consistent header/footer structure across pages
- Data attributes for JavaScript functionality
- External links with `target="_blank"`

### CSS Patterns
- CSS custom properties in `:root` for theming
- BEM-like class naming for components
- Consistent spacing using CSS variables
- Mobile-first media queries

### JavaScript Patterns
- Event delegation for dynamic content
- Pure functions for filtering/sorting logic
- DOM queries cached for performance
- Consistent error handling

## Performance Considerations

- **Minimal JavaScript**: Only essential client-side functionality
- **CSS optimization**: Efficient selectors and minimal unused styles
- **Image optimization**: Compressed images in `assets/` directory
- **CDN usage**: Font Awesome loaded from CDN for icons

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge latest versions)
- Mobile-responsive design tested across devices
- Progressive enhancement approach
- No polyfills required for core functionality

## Deployment

- **Hosting**: GitHub Pages automatic deployment (leveraging GitHub's global CDN infrastructure)
- **Domain**: Using github.io subdomain (intentionally NO custom CNAME)
- **SSL**: Automatic HTTPS via GitHub Pages with Let's Encrypt certificates
- **No CI/CD**: Direct file commits trigger deployment (simplicity over complexity)

### GitHub Pages Design Decisions

#### Why NO Custom Domain (CNAME)?
- **Decoupling**: Avoid tying professional presence to specific side projects or domains
- **Reliability**: Leverage GitHub's enterprise-grade DNS and CDN management
- **Simplicity**: No domain registration, renewal, or DNS configuration overhead
- **Migration Freedom**: Easy to migrate without domain dependencies
- **Cost**: Zero additional cost vs $10-15/year for domain + potential DNS hosting fees

#### Why NO Jekyll Processing?
- **Portability**: Works anywhere without Ruby, Jekyll, or build dependencies
- **Development Speed**: No build step means instant feedback (edit → save → refresh)
- **Debugging**: Direct relationship between source files and what gets served
- **Onboarding**: Any developer can contribute immediately without Jekyll knowledge
- **Local Development**: Files work with simple `npx http-server . -p 8080` for production-like testing

## Maintenance Guidelines

### Code Quality
- Maintain consistent indentation and formatting
- Use semantic HTML elements appropriately
- Keep JavaScript functions focused and reusable
- Follow established CSS naming conventions

### Content Updates
- Blog posts: Add to `blogs.html` following existing patterns
- Certifications: Update `certifications.html` with new achievements
- Styling: Modify CSS custom properties for theme changes

### Testing Approach
- Manual testing across browsers and devices
- Validate HTML/CSS using browser dev tools
- Test JavaScript functionality in different scenarios
- Verify responsive design at various breakpoints

## Platform Blueprint Reference

For comprehensive technical architecture details, see the `platform-blueprint/` directory:

### Key Architectural Insights
1. **Infrastructure Complexity**: While the site appears simple, it leverages GitHub's sophisticated global CDN, automated SSL management, and enterprise-grade hosting infrastructure
2. **Security by Design**: Static architecture eliminates entire classes of vulnerabilities (SQL injection, RCE, session management, etc.)
3. **Performance Engineering**: Achieves 95+ Lighthouse scores through architectural choices rather than optimization tooling
4. **Scalability Strategy**: Clear scaling decision matrix from current state to enterprise-level complexity
5. **Development Workflow**: Demonstrates how professional development practices can be maintained without build complexity

### Strategic Value
- **Technical Showcase**: Demonstrates enterprise-level architectural thinking and documentation skills
- **Cost Efficiency**: $0 hosting costs while delivering enterprise-grade performance and reliability
- **Knowledge Transfer**: Comprehensive documentation enables easy onboarding and knowledge sharing
- **Future-Proofing**: Clear evolution paths from static to dynamic architecture as requirements grow

The platform blueprint serves multiple audiences: technical evaluators assessing architectural competency, development teams seeking reference implementations, and business stakeholders evaluating technical approaches.