# Monitoring, Observability, and Alerting

## Observability Philosophy

In a static site architecture, traditional server-side monitoring is replaced by client-side observability, deployment monitoring, and infrastructure insights provided by GitHub Pages. This document outlines a comprehensive monitoring strategy that provides visibility into performance, user behavior, and system health without compromising privacy or introducing complexity.

## Current Monitoring Landscape

### GitHub-Provided Monitoring
```yaml
GitHub Repository Insights:
  Traffic Analytics:
    - Unique visitors (14-day rolling window)
    - Page views by URL path
    - Top referrers and traffic sources
    - Popular content identification
  
  Repository Activity:
    - Commit frequency and patterns
    - Contributor activity levels
    - Code change velocity
    - Issue and PR activity
  
  Performance Indicators:
    - Repository size and growth
    - Pages build status and times
    - Deployment success/failure rates
    - Service availability metrics

GitHub Pages Status:
  Infrastructure Health:
    - Global CDN status
    - Build service availability
    - SSL certificate status
    - DNS resolution health
```

### Built-In Browser Monitoring
```javascript
// Performance API utilization
class BrowserMetrics {
    static collect() {
        const navigation = performance.getEntriesByType('navigation')[0];
        const paint = performance.getEntriesByType('paint');
        
        return {
            // Navigation Timing
            domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
            loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
            totalPageLoad: navigation.loadEventEnd - navigation.fetchStart,
            
            // Paint Timing
            firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
            firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
            
            // Resource Timing
            resources: performance.getEntriesByType('resource').map(r => ({
                name: r.name,
                duration: r.duration,
                size: r.transferSize,
                type: r.initiatorType
            })),
            
            // Memory Usage (if available)
            memory: performance.memory ? {
                used: performance.memory.usedJSHeapSize,
                total: performance.memory.totalJSHeapSize,
                limit: performance.memory.jsHeapSizeLimit
            } : null
        };
    }
}
```

## Client-Side Performance Monitoring

### Core Web Vitals Tracking
```javascript
class CoreWebVitalsMonitor {
    constructor() {
        this.metrics = new Map();
        this.observers = [];
        this.init();
    }
    
    init() {
        this.trackLCP();
        this.trackFID();
        this.trackCLS();
        this.trackCustomMetrics();
    }
    
    trackLCP() {
        const observer = new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            const lastEntry = entries[entries.length - 1];
            
            this.recordMetric('LCP', {
                value: lastEntry.startTime,
                element: lastEntry.element?.tagName,
                url: lastEntry.url,
                timestamp: Date.now()
            });
        });
        
        observer.observe({ type: 'largest-contentful-paint', buffered: true });
        this.observers.push(observer);
    }
    
    trackFID() {
        const observer = new PerformanceObserver((entryList) => {
            const firstInput = entryList.getEntries()[0];
            
            this.recordMetric('FID', {
                value: firstInput.processingStart - firstInput.startTime,
                eventType: firstInput.name,
                target: firstInput.target?.tagName,
                timestamp: Date.now()
            });
        });
        
        observer.observe({ type: 'first-input', buffered: true });
        this.observers.push(observer);
    }
    
    trackCLS() {
        let clsValue = 0;
        let sessionValue = 0;
        let sessionEntries = [];
        
        const observer = new PerformanceObserver((entryList) => {
            for (const entry of entryList.getEntries()) {
                if (!entry.hadRecentInput) {
                    const firstSessionEntry = sessionEntries[0];
                    const lastSessionEntry = sessionEntries[sessionEntries.length - 1];
                    
                    // New session if gap > 1 second or > 5 second total
                    if (sessionValue && 
                        (entry.startTime - lastSessionEntry.startTime > 1000 ||
                         entry.startTime - firstSessionEntry.startTime > 5000)) {
                        
                        this.recordMetric('CLS', {
                            value: sessionValue,
                            entries: sessionEntries.length,
                            timestamp: Date.now()
                        });
                        
                        sessionValue = 0;
                        sessionEntries = [];
                    }
                    
                    sessionValue += entry.value;
                    sessionEntries.push(entry);
                }
            }
        });
        
        observer.observe({ type: 'layout-shift', buffered: true });
        this.observers.push(observer);
    }
    
    recordMetric(name, data) {
        this.metrics.set(`${name}_${Date.now()}`, {
            metric: name,
            ...data,
            page: window.location.pathname,
            userAgent: navigator.userAgent,
            viewport: `${window.innerWidth}x${window.innerHeight}`,
            connection: navigator.connection?.effectiveType || 'unknown'
        });
        
        // Optional: Send to analytics service
        this.reportMetric(name, data);
    }
    
    reportMetric(name, data) {
        // Privacy-respecting analytics reporting
        const payload = {
            metric: name,
            value: data.value,
            page: window.location.pathname,
            timestamp: data.timestamp
        };
        
        // Use sendBeacon for reliability
        if (navigator.sendBeacon && this.shouldReport()) {
            navigator.sendBeacon('/analytics', JSON.stringify(payload));
        }
    }
    
    shouldReport() {
        // Sample only a percentage of users for privacy
        return Math.random() < 0.1; // 10% sampling rate
    }
}
```

### User Experience Monitoring
```javascript
class UserExperienceMonitor {
    constructor() {
        this.interactions = [];
        this.errors = [];
        this.init();
    }
    
    init() {
        this.trackInteractions();
        this.trackErrors();
        this.trackUserJourney();
    }
    
    trackInteractions() {
        // Track filter usage
        document.addEventListener('click', (event) => {
            const filterButton = event.target.closest('[data-filter]');
            if (filterButton) {
                this.recordInteraction('filter_click', {
                    filterType: filterButton.dataset.filter,
                    filterValue: filterButton.dataset.value,
                    timestamp: Date.now()
                });
            }
            
            // Track blog post clicks
            const blogItem = event.target.closest('.blog-item');
            if (blogItem) {
                this.recordInteraction('blog_click', {
                    title: blogItem.dataset.title,
                    topic: blogItem.dataset.topic,
                    type: blogItem.dataset.type,
                    timestamp: Date.now()
                });
            }
        });
    }
    
    trackErrors() {
        window.addEventListener('error', (event) => {
            this.recordError('javascript_error', {
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                stack: event.error?.stack,
                timestamp: Date.now()
            });
        });
        
        window.addEventListener('unhandledrejection', (event) => {
            this.recordError('promise_rejection', {
                reason: event.reason?.toString(),
                stack: event.reason?.stack,
                timestamp: Date.now()
            });
        });
    }
    
    trackUserJourney() {
        // Track page visibility changes
        document.addEventListener('visibilitychange', () => {
            this.recordInteraction('visibility_change', {
                state: document.visibilityState,
                timestamp: Date.now()
            });
        });
        
        // Track time on page
        let startTime = Date.now();
        window.addEventListener('beforeunload', () => {
            const timeOnPage = Date.now() - startTime;
            this.recordInteraction('page_exit', {
                duration: timeOnPage,
                timestamp: Date.now()
            });
        });
    }
    
    recordInteraction(type, data) {
        this.interactions.push({ type, ...data });
        
        // Limit memory usage
        if (this.interactions.length > 100) {
            this.interactions.shift();
        }
    }
    
    recordError(type, data) {
        this.errors.push({ type, ...data });
        
        // Report critical errors immediately
        if (this.errors.length === 1) {
            this.reportError(type, data);
        }
    }
}
```

## Deployment and Build Monitoring

### GitHub Actions Monitoring
```yaml
# .github/workflows/monitoring.yml
name: Site Monitoring

on:
  schedule:
    - cron: '0 */6 * * *'  # Every 6 hours
  push:
    branches: [main]

jobs:
  lighthouse-audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Run Lighthouse CI
        run: |
          npm install -g @lhci/cli@0.11.x
          lhci autorun
        env:
          LHCI_GITHUB_APP_TOKEN: ${{ secrets.LHCI_GITHUB_APP_TOKEN }}
          LHCI_UPLOAD_TARGET: temporary-public-storage
  
  accessibility-audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install -g pa11y-ci
      
      - name: Run accessibility tests
        run: |
          npx http-server . -p 8080 &
          sleep 5
          pa11y-ci --sitemap http://localhost:8080/sitemap.xml
  
  broken-link-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Check links
        run: |
          npm install -g broken-link-checker
          blc https://jackzhaojin.github.io --recursive --ordered
```

### Deployment Health Checks
```javascript
// Health check script that runs post-deployment
class DeploymentHealthCheck {
    static async runChecks() {
        const checks = [
            this.checkPageLoad,
            this.checkCriticalPaths,
            this.checkAssetLoading,
            this.checkJavaScriptExecution,
            this.checkResponsiveDesign
        ];
        
        const results = await Promise.allSettled(
            checks.map(check => check())
        );
        
        const failed = results.filter(r => r.status === 'rejected');
        
        if (failed.length > 0) {
            this.reportDeploymentIssues(failed);
        } else {
            this.reportDeploymentSuccess();
        }
        
        return failed.length === 0;
    }
    
    static async checkPageLoad() {
        const start = performance.now();
        await fetch(window.location.href);
        const duration = performance.now() - start;
        
        if (duration > 3000) {
            throw new Error(`Page load too slow: ${duration}ms`);
        }
    }
    
    static async checkCriticalPaths() {
        const criticalPaths = ['/', '/blogs.html', '/certifications.html'];
        
        for (const path of criticalPaths) {
            const response = await fetch(path);
            if (!response.ok) {
                throw new Error(`Critical path ${path} failed: ${response.status}`);
            }
        }
    }
    
    static async checkAssetLoading() {
        const assets = [
            '/css/styles.css',
            '/css/blogs.css', 
            '/js/blog-filters.js',
            '/js/includes.js'
        ];
        
        for (const asset of assets) {
            const response = await fetch(asset);
            if (!response.ok) {
                throw new Error(`Asset ${asset} failed to load: ${response.status}`);
            }
        }
    }
    
    static async checkJavaScriptExecution() {
        // Verify critical JavaScript functionality
        if (typeof applyFilters !== 'function') {
            throw new Error('Blog filtering functionality not loaded');
        }
        
        if (typeof includeHTML !== 'function') {
            throw new Error('HTML includes functionality not loaded');
        }
    }
    
    static async checkResponsiveDesign() {
        // Test responsive breakpoints
        const breakpoints = [320, 768, 1024, 1200];
        
        for (const width of breakpoints) {
            // Simulate viewport change (in test environment)
            if (window.innerWidth !== width) {
                // Would need actual viewport simulation in real test
                continue;
            }
            
            const issues = this.detectLayoutIssues();
            if (issues.length > 0) {
                throw new Error(`Responsive issues at ${width}px: ${issues.join(', ')}`);
            }
        }
    }
}
```

## Error Monitoring and Alerting

### Client-Side Error Tracking
```javascript
class ErrorTracker {
    constructor() {
        this.errorQueue = [];
        this.maxErrors = 50;
        this.reportingThreshold = 5; // Report after 5 errors
        this.init();
    }
    
    init() {
        this.setupGlobalErrorHandler();
        this.setupUnhandledRejectionHandler();
        this.setupCustomErrorTracking();
    }
    
    setupGlobalErrorHandler() {
        window.addEventListener('error', (event) => {
            const error = {
                type: 'javascript_error',
                message: event.message,
                source: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                stack: event.error?.stack,
                timestamp: Date.now(),
                url: window.location.href,
                userAgent: navigator.userAgent
            };
            
            this.captureError(error);
        });
    }
    
    setupUnhandledRejectionHandler() {
        window.addEventListener('unhandledrejection', (event) => {
            const error = {
                type: 'promise_rejection',
                message: event.reason?.message || 'Unhandled Promise Rejection',
                reason: event.reason?.toString(),
                stack: event.reason?.stack,
                timestamp: Date.now(),
                url: window.location.href,
                userAgent: navigator.userAgent
            };
            
            this.captureError(error);
        });
    }
    
    setupCustomErrorTracking() {
        // Override console.error to catch manual error reports
        const originalError = console.error;
        console.error = (...args) => {
            originalError.apply(console, args);
            
            const error = {
                type: 'console_error',
                message: args.join(' '),
                timestamp: Date.now(),
                url: window.location.href,
                userAgent: navigator.userAgent
            };
            
            this.captureError(error);
        };
    }
    
    captureError(error) {
        this.errorQueue.push(error);
        
        // Limit queue size
        if (this.errorQueue.length > this.maxErrors) {
            this.errorQueue.shift();
        }
        
        // Report if threshold reached
        if (this.errorQueue.length >= this.reportingThreshold) {
            this.reportErrors();
        }
    }
    
    reportErrors() {
        const payload = {
            errors: this.errorQueue.slice(),
            sessionId: this.generateSessionId(),
            timestamp: Date.now()
        };
        
        // Send via beacon for reliability
        if (navigator.sendBeacon) {
            navigator.sendBeacon('/error-report', JSON.stringify(payload));
        }
        
        // Clear queue after reporting
        this.errorQueue = [];
    }
    
    generateSessionId() {
        // Simple session ID generation
        return btoa(Date.now() + Math.random()).slice(0, 16);
    }
}
```

### Automated Alerting System
```javascript
// Alerting configuration and logic
class AlertingSystem {
    constructor() {
        this.alertRules = new Map();
        this.alertCooldowns = new Map();
        this.setupDefaultRules();
    }
    
    setupDefaultRules() {
        // Performance alerts
        this.addRule('page_load_slow', {
            condition: (metric) => metric.name === 'LCP' && metric.value > 4000,
            cooldown: 5 * 60 * 1000, // 5 minutes
            severity: 'warning',
            message: 'Page load time exceeds 4 seconds'
        });
        
        // Error rate alerts
        this.addRule('error_spike', {
            condition: (errors) => errors.length > 10,
            cooldown: 10 * 60 * 1000, // 10 minutes
            severity: 'critical',
            message: 'Error rate spike detected'
        });
        
        // User experience alerts
        this.addRule('high_bounce_rate', {
            condition: (sessions) => this.calculateBounceRate(sessions) > 0.8,
            cooldown: 30 * 60 * 1000, // 30 minutes
            severity: 'warning',
            message: 'High bounce rate detected'
        });
    }
    
    addRule(name, config) {
        this.alertRules.set(name, config);
    }
    
    evaluateRules(data) {
        this.alertRules.forEach((rule, name) => {
            if (this.isInCooldown(name)) {
                return;
            }
            
            if (rule.condition(data)) {
                this.triggerAlert(name, rule);
            }
        });
    }
    
    triggerAlert(ruleName, rule) {
        const alert = {
            rule: ruleName,
            severity: rule.severity,
            message: rule.message,
            timestamp: Date.now(),
            data: this.getContextualData()
        };
        
        this.sendAlert(alert);
        this.setCooldown(ruleName, rule.cooldown);
    }
    
    sendAlert(alert) {
        // In a real implementation, this would send to:
        // - Email notifications
        // - Slack webhooks
        // - PagerDuty
        // - Custom alerting service
        
        console.warn('ALERT:', alert);
        
        // For now, store locally for review
        const alerts = JSON.parse(localStorage.getItem('alerts') || '[]');
        alerts.push(alert);
        localStorage.setItem('alerts', JSON.stringify(alerts.slice(-20))); // Keep last 20
    }
}
```

## Analytics and Insights

### Privacy-Respecting Analytics
```javascript
class PrivacyFriendlyAnalytics {
    constructor() {
        this.sessionData = {
            startTime: Date.now(),
            pageViews: 0,
            interactions: 0,
            errors: 0
        };
        
        this.init();
    }
    
    init() {
        this.trackPageView();
        this.trackInteractions();
        this.setupPeriodicReporting();
    }
    
    trackPageView() {
        this.sessionData.pageViews++;
        
        const pageData = {
            path: window.location.pathname,
            referrer: document.referrer ? new URL(document.referrer).hostname : 'direct',
            timestamp: Date.now(),
            viewport: `${window.innerWidth}x${window.innerHeight}`,
            language: navigator.language,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        };
        
        this.recordEvent('page_view', pageData);
    }
    
    trackInteractions() {
        let interactionCount = 0;
        
        ['click', 'scroll', 'keydown'].forEach(eventType => {
            document.addEventListener(eventType, () => {
                interactionCount++;
                this.sessionData.interactions = interactionCount;
            }, { passive: true });
        });
    }
    
    recordEvent(type, data) {
        // Store locally, aggregate before sending
        const events = JSON.parse(localStorage.getItem('analytics_events') || '[]');
        events.push({ type, ...data });
        
        // Keep only recent events
        localStorage.setItem('analytics_events', JSON.stringify(events.slice(-100)));
    }
    
    setupPeriodicReporting() {
        // Report aggregated data every 5 minutes
        setInterval(() => {
            this.reportAggregatedData();
        }, 5 * 60 * 1000);
        
        // Report on page unload
        window.addEventListener('beforeunload', () => {
            this.reportAggregatedData();
        });
    }
    
    reportAggregatedData() {
        const events = JSON.parse(localStorage.getItem('analytics_events') || '[]');
        if (events.length === 0) return;
        
        const aggregated = this.aggregateEvents(events);
        
        // Send aggregated, anonymized data
        if (navigator.sendBeacon) {
            navigator.sendBeacon('/analytics/batch', JSON.stringify(aggregated));
        }
        
        // Clear reported events
        localStorage.removeItem('analytics_events');
    }
    
    aggregateEvents(events) {
        const aggregated = {
            session: {
                duration: Date.now() - this.sessionData.startTime,
                pageViews: this.sessionData.pageViews,
                interactions: this.sessionData.interactions,
                errors: this.sessionData.errors
            },
            pages: {},
            referrers: {},
            userAgents: {},
            timestamp: Date.now()
        };
        
        events.forEach(event => {
            if (event.type === 'page_view') {
                aggregated.pages[event.path] = (aggregated.pages[event.path] || 0) + 1;
                aggregated.referrers[event.referrer] = (aggregated.referrers[event.referrer] || 0) + 1;
            }
        });
        
        return aggregated;
    }
}
```

## Dashboard and Reporting

### Simple Monitoring Dashboard
```javascript
class MonitoringDashboard {
    constructor() {
        this.metrics = new Map();
        this.refreshInterval = 30 * 1000; // 30 seconds
        this.init();
    }
    
    init() {
        this.createDashboardUI();
        this.startPeriodicUpdates();
    }
    
    createDashboardUI() {
        // Only create in development or admin mode
        if (window.location.hostname !== 'localhost' && !window.location.search.includes('admin=1')) {
            return;
        }
        
        const dashboard = document.createElement('div');
        dashboard.id = 'monitoring-dashboard';
        dashboard.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            width: 300px;
            background: rgba(0,0,0,0.9);
            color: white;
            padding: 10px;
            border-radius: 5px;
            font-family: monospace;
            font-size: 12px;
            z-index: 10000;
            max-height: 400px;
            overflow-y: auto;
        `;
        
        document.body.appendChild(dashboard);
    }
    
    updateDashboard() {
        const dashboard = document.getElementById('monitoring-dashboard');
        if (!dashboard) return;
        
        const metrics = this.collectCurrentMetrics();
        
        dashboard.innerHTML = `
            <h4>Site Monitoring</h4>
            <div><strong>Performance:</strong></div>
            <div>Page Load: ${metrics.pageLoad}ms</div>
            <div>DOM Ready: ${metrics.domReady}ms</div>
            <div>Memory: ${metrics.memory}MB</div>
            <div><strong>User Activity:</strong></div>
            <div>Page Views: ${metrics.pageViews}</div>
            <div>Interactions: ${metrics.interactions}</div>
            <div>Errors: ${metrics.errors}</div>
            <div><strong>Network:</strong></div>
            <div>Connection: ${metrics.connection}</div>
            <div><strong>Last Update:</strong></div>
            <div>${new Date().toLocaleTimeString()}</div>
        `;
    }
    
    collectCurrentMetrics() {
        const navigation = performance.getEntriesByType('navigation')[0];
        
        return {
            pageLoad: Math.round(navigation?.loadEventEnd - navigation?.fetchStart || 0),
            domReady: Math.round(navigation?.domContentLoadedEventEnd - navigation?.domContentLoadedEventStart || 0),
            memory: Math.round((performance.memory?.usedJSHeapSize || 0) / 1024 / 1024),
            pageViews: this.sessionData?.pageViews || 0,
            interactions: this.sessionData?.interactions || 0,
            errors: this.sessionData?.errors || 0,
            connection: navigator.connection?.effectiveType || 'unknown'
        };
    }
    
    startPeriodicUpdates() {
        setInterval(() => {
            this.updateDashboard();
        }, this.refreshInterval);
        
        this.updateDashboard(); // Initial update
    }
}
```

This comprehensive monitoring and observability strategy provides deep insights into site performance and user experience while maintaining privacy and simplicity. The approach scales from basic GitHub analytics to sophisticated client-side monitoring as needs evolve.