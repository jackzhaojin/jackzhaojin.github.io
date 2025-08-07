# API Design and Service Interfaces

## API Architecture Philosophy

In a static site architecture, traditional REST APIs are replaced by file-based interfaces and client-side data access patterns. This document explores how API principles apply to static content delivery and outlines potential API integration strategies for future evolution.

## Current "API" Architecture

### File-Based Content API
The current architecture implements API-like patterns through structured file access:

```
Content Delivery Interface:
├── GET /index.html           → Homepage content
├── GET /blogs.html           → Blog listing interface
├── GET /certifications.html  → Certification data
├── GET /css/styles.css      → Styling configuration
├── GET /js/blog-filters.js  → Behavior configuration
└── GET /assets/*            → Media assets
```

### Data Access Patterns

#### DOM-Based Data API
```javascript
// Client-side "API" for accessing structured data
class ContentAPI {
    // Get all blog posts
    static getAllPosts() {
        return Array.from(document.querySelectorAll('.blog-item'))
            .map(element => ({
                title: element.dataset.title,
                date: element.dataset.date,
                topic: element.dataset.topic,
                type: element.dataset.type,
                media: element.dataset.media,
                url: element.href,
                excerpt: element.querySelector('.blog-excerpt')?.textContent
            }));
    }
    
    // Filter posts by criteria
    static filterPosts(criteria) {
        const allPosts = this.getAllPosts();
        return allPosts.filter(post => {
            return (!criteria.topic || criteria.topic === 'all' || post.topic === criteria.topic) &&
                   (!criteria.type || criteria.type === 'all' || post.type === criteria.type) &&
                   (!criteria.media || criteria.media === 'all' || post.media === criteria.media);
        });
    }
    
    // Get posts by date range
    static getPostsByDateRange(startDate, endDate) {
        return this.getAllPosts().filter(post => {
            const postDate = new Date(post.date);
            return postDate >= new Date(startDate) && postDate <= new Date(endDate);
        });
    }
}
```

#### CSS Custom Properties API
```css
/* CSS-based configuration API */
:root {
    /* Color palette API */
    --primary-color: #2c3e50;
    --microsoft-blue: #0078d4;
    --adobe-red: #fa0f00;
    
    /* Spacing API */
    --border-radius: 8px;
    --box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    
    /* Animation API */
    --transition: all 0.3s ease;
}
```

## RESTful Principles in Static Architecture

### Resource Identification
```
Resource Structure (URL as API endpoint):
├── /                        → Root resource (homepage)
├── /blogs.html             → Blog collection resource
├── /certifications.html    → Certification collection resource
├── /css/                   → Styling resources
├── /js/                    → Behavior resources
└── /assets/                → Media resources
```

### HTTP Methods and Caching
```http
# GET requests with appropriate caching headers
GET /blogs.html HTTP/1.1
Cache-Control: public, max-age=3600
ETag: "abc123def456"
Last-Modified: Wed, 21 Oct 2025 07:28:00 GMT

# Response includes structured data
HTTP/1.1 200 OK
Content-Type: text/html
```

### Content Negotiation
```javascript
// Client-side content negotiation through responsive design
@media (max-width: 768px) {
    /* Mobile-optimized content presentation */
}

@media (prefers-reduced-motion: reduce) {
    /* Accessibility-aware content delivery */
}
```

## Service Interface Specifications

### Blog Content Interface
```typescript
// TypeScript interface for blog data structure
interface BlogPost {
    id: string;              // Derived from data-title or URL
    title: string;           // Human-readable title
    slug: string;           // URL-friendly identifier
    publishDate: string;    // ISO date string
    lastModified: string;   // Git commit timestamp
    topic: BlogTopic;       // Primary categorization
    contentType: ContentType; // Content classification
    mediaType: MediaType;   // Format specification
    url: string;           // External link
    excerpt: string;       // Summary text
    tags: string[];        // Additional metadata
    readingTime: number;   // Estimated minutes
}

type BlogTopic = 'ai' | 'aem' | 'general';
type ContentType = 'technical' | 'leadership' | 'opinion';
type MediaType = 'article' | 'post' | 'video' | 'presentation';
```

### Filtering API Interface
```typescript
interface FilterCriteria {
    topic?: BlogTopic | 'all';
    contentType?: ContentType | 'all';
    mediaType?: MediaType | 'all';
    dateRange?: {
        start: string;
        end: string;
    };
    tags?: string[];
}

interface FilterResponse {
    posts: BlogPost[];
    totalCount: number;
    filteredCount: number;
    appliedFilters: FilterCriteria;
    availableFilters: {
        topics: Array<{value: string, count: number}>;
        contentTypes: Array<{value: string, count: number}>;
        mediaTypes: Array<{value: string, count: number}>;
    };
}
```

### Configuration API Interface
```typescript
interface SiteConfiguration {
    theme: {
        colors: {
            primary: string;
            secondary: string;
            accent: string;
        };
        typography: {
            fontFamily: string;
            baseSize: string;
            lineHeight: number;
        };
        spacing: {
            borderRadius: string;
            boxShadow: string;
        };
    };
    features: {
        blogFiltering: boolean;
        darkMode: boolean;
        analytics: boolean;
    };
    content: {
        blogPostsPerPage: number;
        excerptLength: number;
        sortDefaultOrder: 'latest' | 'oldest';
    };
}
```

## API Design Patterns

### Command Query Responsibility Segregation (CQRS)
```javascript
// Query operations (read-only)
class ContentQueries {
    static getRecentPosts(limit = 5) {
        return ContentAPI.getAllPosts()
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, limit);
    }
    
    static getPopularTopics() {
        const posts = ContentAPI.getAllPosts();
        const topicCounts = {};
        posts.forEach(post => {
            topicCounts[post.topic] = (topicCounts[post.topic] || 0) + 1;
        });
        return Object.entries(topicCounts)
            .sort(([,a], [,b]) => b - a)
            .map(([topic, count]) => ({ topic, count }));
    }
}

// Command operations (state changes)
class ContentCommands {
    static updateFilter(filterType, value) {
        currentFilters[filterType] = value;
        applyFilters();
        updateURL(); // Optional: URL state management
    }
    
    static clearAllFilters() {
        currentFilters = { topic: 'all', type: 'all', media: 'all' };
        applyFilters();
        updateURL();
    }
}
```

### Repository Pattern
```javascript
class BlogRepository {
    constructor(dataSource = 'dom') {
        this.dataSource = dataSource;
    }
    
    async findAll() {
        switch (this.dataSource) {
            case 'dom':
                return ContentAPI.getAllPosts();
            case 'json':
                return fetch('/data/posts.json').then(r => r.json());
            case 'api':
                return fetch('/api/posts').then(r => r.json());
            default:
                throw new Error('Unknown data source');
        }
    }
    
    async findByTopic(topic) {
        const posts = await this.findAll();
        return posts.filter(post => post.topic === topic);
    }
    
    async findById(id) {
        const posts = await this.findAll();
        return posts.find(post => post.id === id);
    }
}
```

## Integration Strategies

### Future API Integration Points

#### Headless CMS Integration
```javascript
// Hybrid approach: Static + CMS
class HybridContentAPI {
    constructor() {
        this.staticContent = new BlogRepository('dom');
        this.dynamicContent = new BlogRepository('api');
    }
    
    async getAllContent() {
        // Combine static and dynamic content
        const [staticPosts, dynamicPosts] = await Promise.all([
            this.staticContent.findAll(),
            this.dynamicContent.findAll().catch(() => []) // Graceful degradation
        ]);
        
        return [...staticPosts, ...dynamicPosts]
            .sort((a, b) => new Date(b.date) - new Date(a.date));
    }
}
```

#### Analytics API Integration
```javascript
// Privacy-respecting analytics
class AnalyticsAPI {
    static trackPageView(page) {
        // Client-side only, no external tracking
        const data = {
            page,
            timestamp: Date.now(),
            userAgent: navigator.userAgent,
            referrer: document.referrer
        };
        
        // Store locally or send to privacy-respecting service
        localStorage.setItem('analytics', JSON.stringify(data));
    }
    
    static getInsights() {
        // Return aggregated, anonymous insights
        const data = localStorage.getItem('analytics');
        return data ? JSON.parse(data) : null;
    }
}
```

#### Search API Design
```javascript
// Client-side search implementation
class SearchAPI {
    constructor(documents) {
        this.index = this.buildIndex(documents);
    }
    
    buildIndex(documents) {
        // Simple inverted index for full-text search
        const index = new Map();
        
        documents.forEach(doc => {
            const words = this.tokenize(doc.title + ' ' + doc.excerpt);
            words.forEach(word => {
                if (!index.has(word)) {
                    index.set(word, new Set());
                }
                index.get(word).add(doc.id);
            });
        });
        
        return index;
    }
    
    search(query) {
        const words = this.tokenize(query);
        const results = new Set();
        
        words.forEach(word => {
            const docs = this.index.get(word);
            if (docs) {
                docs.forEach(docId => results.add(docId));
            }
        });
        
        return Array.from(results);
    }
    
    tokenize(text) {
        return text.toLowerCase()
            .replace(/[^\w\s]/g, '')
            .split(/\s+/)
            .filter(word => word.length > 2);
    }
}
```

## API Documentation Strategy

### Self-Documenting Code
```javascript
/**
 * Blog Content Management API
 * 
 * Provides programmatic access to blog posts and filtering capabilities
 * for the static site architecture.
 * 
 * @example
 * // Get all AI-related technical posts
 * const aiTechPosts = ContentAPI.filterPosts({
 *     topic: 'ai',
 *     type: 'technical'
 * });
 */
class ContentAPI {
    /**
     * Retrieves all blog posts from the DOM
     * @returns {BlogPost[]} Array of blog post objects
     */
    static getAllPosts() {
        // Implementation here
    }
}
```

### API Versioning Strategy
```javascript
// Future-proofing API changes
const API_VERSION = '1.0';

class ContentAPIv1 {
    static getVersion() {
        return API_VERSION;
    }
    
    // v1 methods here
}

// Future version handling
class ContentAPIv2 extends ContentAPIv1 {
    // v2 enhancements
    // Maintain backward compatibility
}
```

## Performance Considerations

### API Response Optimization
```javascript
// Lazy loading for large datasets
class OptimizedContentAPI {
    constructor() {
        this._cache = new Map();
    }
    
    async getPosts(page = 1, limit = 10) {
        const cacheKey = `posts_${page}_${limit}`;
        
        if (this._cache.has(cacheKey)) {
            return this._cache.get(cacheKey);
        }
        
        const allPosts = ContentAPI.getAllPosts();
        const start = (page - 1) * limit;
        const end = start + limit;
        const paginatedPosts = allPosts.slice(start, end);
        
        this._cache.set(cacheKey, paginatedPosts);
        return paginatedPosts;
    }
}
```

### Caching Strategy
```javascript
// Service Worker API caching
self.addEventListener('fetch', event => {
    if (event.request.url.includes('/api/')) {
        event.respondWith(
            caches.match(event.request).then(response => {
                if (response) {
                    return response;
                }
                return fetch(event.request).then(response => {
                    const responseClone = response.clone();
                    caches.open('api-cache').then(cache => {
                        cache.put(event.request, responseClone);
                    });
                    return response;
                });
            })
        );
    }
});
```

## Error Handling and Resilience

### Graceful Degradation
```javascript
class ResilientContentAPI {
    static async getPosts() {
        try {
            // Try primary data source
            return await this.getPostsFromDOM();
        } catch (domError) {
            try {
                // Fallback to cached data
                return await this.getPostsFromCache();
            } catch (cacheError) {
                // Final fallback to empty state
                console.warn('All data sources failed, returning empty state');
                return [];
            }
        }
    }
    
    static handleAPIError(error, context) {
        // Structured error handling
        const errorInfo = {
            context,
            message: error.message,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent
        };
        
        // Log for debugging (in development)
        if (process.env.NODE_ENV === 'development') {
            console.error('API Error:', errorInfo);
        }
        
        // User-friendly error display
        this.showUserError('Unable to load content. Please refresh the page.');
    }
}
```

## Testing Strategy

### API Contract Testing
```javascript
// Test API interfaces and contracts
describe('ContentAPI', () => {
    test('getAllPosts returns valid blog post structure', () => {
        const posts = ContentAPI.getAllPosts();
        
        expect(posts).toBeInstanceOf(Array);
        posts.forEach(post => {
            expect(post).toHaveProperty('title');
            expect(post).toHaveProperty('date');
            expect(post).toHaveProperty('topic');
            expect(post).toHaveProperty('type');
            expect(post.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        });
    });
    
    test('filterPosts respects filter criteria', () => {
        const filteredPosts = ContentAPI.filterPosts({
            topic: 'ai',
            type: 'technical'
        });
        
        filteredPosts.forEach(post => {
            expect(post.topic).toBe('ai');
            expect(post.type).toBe('technical');
        });
    });
});
```

## Future API Evolution

### Microservices Architecture Readiness
```javascript
// Modular API design for future microservices
const services = {
    content: new ContentService(),
    search: new SearchService(),
    analytics: new AnalyticsService(),
    user: new UserService() // Future user management
};

// Service mesh pattern
class APIGateway {
    static async route(service, method, params) {
        if (!services[service]) {
            throw new Error(`Service ${service} not found`);
        }
        
        return services[service][method](params);
    }
}
```

### GraphQL Considerations
```graphql
# Future GraphQL schema design
type BlogPost {
    id: ID!
    title: String!
    publishDate: String!
    topic: BlogTopic!
    contentType: ContentType!
    excerpt: String
    tags: [String!]!
}

type Query {
    posts(filter: FilterInput, sort: SortInput): [BlogPost!]!
    post(id: ID!): BlogPost
    searchPosts(query: String!): [BlogPost!]!
}
```