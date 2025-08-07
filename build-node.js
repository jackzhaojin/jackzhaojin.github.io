#!/usr/bin/env node

/**
 * Simple Node.js Build Script for Platform Blueprint
 * Zero dependencies - uses only built-in Node.js modules
 * Perfect for OneDrive/shared environments
 * Usage: node build-node.js [platform-blueprint|combined|all]
 */

const fs = require('fs');
const path = require('path');

// Configuration
const BLUEPRINT_DIR = 'platform-blueprint';
const OUTPUT_DIR = 'blueprint-output';
const SECTIONS_DIR = BLUEPRINT_DIR;

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    bold: '\x1b[1m'
};

function printStatus(message) {
    console.log(`${colors.green}[INFO]${colors.reset} ${message}`);
}

function printWarning(message) {
    console.log(`${colors.yellow}[WARN]${colors.reset} ${message}`);
}

function printError(message) {
    console.log(`${colors.red}[ERROR]${colors.reset} ${message}`);
}

function printHeader(message) {
    console.log(`${colors.blue}${colors.bold}[BUILD]${colors.reset} ${message}`);
}

// Ensure output directory exists
function ensureOutputDir() {
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }
}

// Get current date
function getCurrentDate() {
    const now = new Date();
    return now.toISOString().split('T')[0];
}

// Get ISO timestamp for filenames
function getISOTimestamp() {
    const now = new Date();
    return now.toISOString().replace(/[:.]/g, '-').split('.')[0];
}

// Simple markdown to HTML converter (basic implementation)
function markdownToHtml(markdown) {
    let html = markdown;
    
    // Remove YAML frontmatter
    html = html.replace(/^---[\s\S]*?---\n/, '');
    
    // Headers
    html = html.replace(/^### (.*$)/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gm, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gm, '<h1>$1</h1>');
    
    // Bold and italic
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Lists
    html = html.replace(/^\* (.*$)/gm, '<li>$1</li>');
    html = html.replace(/^- (.*$)/gm, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
    
    // Paragraphs
    html = html.replace(/\n\n/g, '</p>\n<p>');
    html = '<p>' + html + '</p>';
    
    // Clean up empty paragraphs
    html = html.replace(/<p><\/p>/g, '');
    html = html.replace(/<p>(<h[1-6]>)/g, '$1');
    html = html.replace(/(<\/h[1-6]>)<\/p>/g, '$1');
    html = html.replace(/<p>(<ul>)/g, '$1');
    html = html.replace(/(<\/ul>)<\/p>/g, '$1');
    
    return html;
}

// Convert content to PDF using puppeteer
async function generatePDFWithPuppeteer(content, outputFile, title = "Platform Blueprint") {
    try {
        let puppeteer;
        try {
            puppeteer = require('puppeteer');
        } catch (e) {
            // Try global modules location
            const { execSync } = require('child_process');
            const globalPrefix = execSync('npm config get prefix', { encoding: 'utf8' }).trim();
            const globalModulePath = path.join(globalPrefix, 'node_modules', 'puppeteer');
            puppeteer = require(globalModulePath);
        }
        
        // Convert markdown to HTML using our built-in converter
        const htmlContent = markdownToHtml(content);
        
        // Create full HTML page with professional styling
        const fullHtml = `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Platform Blueprint - ${title}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: none;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            padding: 40px;
        }
        h1, h2, h3, h4, h5, h6 {
            color: #2c3e50;
            margin-top: 2em;
            margin-bottom: 1em;
            page-break-after: avoid;
        }
        h1 { 
            border-bottom: 3px solid #3498db; 
            padding-bottom: 15px; 
            font-size: 2.2em;
            margin-top: 0;
        }
        h2 { 
            border-bottom: 1px solid #bdc3c7; 
            padding-bottom: 10px; 
            font-size: 1.8em;
            color: #34495e;
        }
        h3 { 
            font-size: 1.4em; 
            color: #34495e;
        }
        p { 
            margin-bottom: 1.2em; 
            text-align: justify; 
            line-height: 1.7;
            orphans: 2;
            widows: 2;
        }
        ul, ol { 
            margin-bottom: 1.5em; 
            padding-left: 2em; 
        }
        li { 
            margin-bottom: 0.7em; 
            line-height: 1.6;
            page-break-inside: avoid;
        }
        strong { 
            color: #2c3e50; 
            font-weight: 600;
        }
        em { 
            color: #7f8c8d; 
        }
        .header { 
            text-align: center; 
            margin-bottom: 3em; 
            padding-bottom: 2em; 
            border-bottom: 2px solid #3498db;
            page-break-after: avoid;
        }
        .footer { 
            text-align: center; 
            margin-top: 3em; 
            padding-top: 2em; 
            border-top: 1px solid #bdc3c7; 
            color: #7f8c8d;
            font-size: 0.9em;
            page-break-before: avoid;
        }
        @page { 
            margin: 0.75in; 
            size: Letter;
        }
        @media print {
            .container { padding: 20px; }
            h1 { font-size: 18pt; }
            h2 { font-size: 16pt; }
            h3 { font-size: 14pt; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="border: none; margin-bottom: 0;">Jack Jin - Personal Site</h1>
            <h2 style="border: none; color: #7f8c8d; margin-top: 0; font-size: 1.3em;">${title}</h2>
            <p><strong>Author:</strong> Jack Jin | <strong>Date:</strong> ${getCurrentDate()}</p>
        </div>
        ${htmlContent}
        <div class="footer">
            <p>Generated on ${new Date().toLocaleString()}</p>
        </div>
    </div>
</body>
</html>`;
        
        const browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        const page = await browser.newPage();
        await page.setContent(fullHtml, { waitUntil: 'networkidle0' });
        
        await page.pdf({
            path: outputFile,
            format: 'Letter',
            margin: {
                top: '0.75in',
                right: '0.75in',
                bottom: '0.75in',
                left: '0.75in'
            },
            printBackground: true,
            preferCSSPageSize: true
        });
        
        await browser.close();
        return true;
        
    } catch (error) {
        throw new Error(`Puppeteer conversion failed: ${error.message}. Install with: npm install -g puppeteer`);
    }
}

// Read and combine all sections
function combineSections() {
    printStatus("🔄 Building combined platform blueprint from sections...");
    
    const currentDate = getCurrentDate();
    const isoTimestamp = getISOTimestamp();
    
    // YAML frontmatter
    let combinedContent = `---
title: "Jack Jin - Personal Site"
subtitle: "Technical Architecture Documentation"
author: "Jack Jin"
date: "${currentDate}"
titlepage: true
toc: true
toc-depth: 2
geometry: margin=1in
fontsize: 11pt
header-includes:
  - \\usepackage{helvet}
  - \\renewcommand{\\familydefault}{\\sfdefault}
  - \\let\\sourcesanspro\\relax
colorlinks: true
linkcolor: blue
urlcolor: blue
toccolor: black
---

`;

    // Read all section files in order
    try {
        const sectionFiles = fs.readdirSync(SECTIONS_DIR)
            .filter(file => file.endsWith('.md'))
            .sort(); // Natural alphabetical sort should work for numbered files
        
        if (sectionFiles.length === 0) {
            printError("No section files found in " + SECTIONS_DIR);
            process.exit(1);
        }
        
        printStatus(`Found ${sectionFiles.length} section files`);
        
        for (const sectionFile of sectionFiles) {
            const sectionPath = path.join(SECTIONS_DIR, sectionFile);
            const sectionContent = fs.readFileSync(sectionPath, 'utf8');
            
            combinedContent += '\n';
            combinedContent += sectionContent;
            combinedContent += '\n';
            combinedContent += '---\n';
            combinedContent += '\n';
        }
        
        // Remove the last separator
        combinedContent = combinedContent.replace(/---\n\n$/, '');
        
        // Write combined files to output
        const outputCombinedFile = path.join(OUTPUT_DIR, 'platform-blueprint-combined.md');
        const outputMainFile = path.join(OUTPUT_DIR, 'platform-blueprint.md');
        
        fs.writeFileSync(outputCombinedFile, combinedContent);
        fs.writeFileSync(outputMainFile, combinedContent);
        
        printStatus(`Combined markdown file created: ${outputCombinedFile}`);
        printStatus(`Platform blueprint file created: ${outputMainFile}`);
        
        return {
            combinedFile: outputCombinedFile,
            mainFile: outputMainFile,
            timestamp: isoTimestamp,
            content: combinedContent
        };
        
    } catch (error) {
        printError(`Failed to combine sections: ${error.message}`);
        process.exit(1);
    }
}

// Generate HTML version with built-in converter
function generateHTML(content, outputFile, title = "Platform Blueprint") {
    try {
        const htmlContent = markdownToHtml(content);
        
        // Create full HTML page
        const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Platform Blueprint - ${title}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 900px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
        }
        .container {
            background-color: white;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1, h2, h3, h4, h5, h6 {
            color: #2c3e50;
            margin-top: 2em;
            margin-bottom: 1em;
        }
        h1 { 
            border-bottom: 3px solid #3498db; 
            padding-bottom: 15px; 
            font-size: 2.5em;
            margin-top: 0;
        }
        h2 { 
            border-bottom: 1px solid #bdc3c7; 
            padding-bottom: 10px; 
            font-size: 2em;
            color: #34495e;
        }
        h3 { 
            font-size: 1.5em; 
            color: #34495e;
        }
        p { 
            margin-bottom: 1.2em; 
            text-align: justify; 
            line-height: 1.7;
        }
        ul, ol { 
            margin-bottom: 1.5em; 
            padding-left: 2em; 
        }
        li { 
            margin-bottom: 0.7em; 
            line-height: 1.6;
        }
        strong { 
            color: #2c3e50; 
            font-weight: 600;
        }
        em { 
            color: #7f8c8d; 
        }
        .header { 
            text-align: center; 
            margin-bottom: 3em; 
            padding-bottom: 2em; 
            border-bottom: 2px solid #3498db;
        }
        .footer { 
            text-align: center; 
            margin-top: 3em; 
            padding-top: 2em; 
            border-top: 1px solid #bdc3c7; 
            color: #7f8c8d;
            font-size: 0.9em;
        }
        .page-break {
            page-break-before: always;
        }
        @media print {
            body { 
                background-color: white; 
                font-size: 12pt;
            }
            .container {
                box-shadow: none;
                padding: 20px;
            }
            h1 { font-size: 18pt; }
            h2 { font-size: 16pt; }
            h3 { font-size: 14pt; }
        }
        /* Make links print-friendly */
        @media print {
            a[href]:after {
                content: " (" attr(href) ")";
                font-size: 0.8em;
                color: #666;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="border: none; margin-bottom: 0;">Jack Jin - Personal Site</h1>
            <h2 style="border: none; color: #7f8c8d; margin-top: 0; font-size: 1.5em;">${title}</h2>
            <p><strong>Author:</strong> Jack Jin | <strong>Date:</strong> ${getCurrentDate()}</p>
        </div>
        ${htmlContent}
        <div class="footer">
            <p>Generated on ${new Date().toLocaleString()}</p>
            <p><em>To create PDF: Open this file in your browser and use Print → Save as PDF</em></p>
        </div>
    </div>
</body>
</html>`;
        
        fs.writeFileSync(outputFile, fullHtml);
        return true;
        
    } catch (error) {
        throw new Error(`HTML generation failed: ${error.message}`);
    }
}

// Main build function
async function buildPlatformBlueprint() {
    printHeader("🚀 Node.js Platform Blueprint Builder with PDF Generation");
    
    ensureOutputDir();
    
    // Combine sections
    const { combinedFile, timestamp, content } = combineSections();
    
    // Try PDF generation first
    const pdfOutputFile = path.join(OUTPUT_DIR, `platform-blueprint-${timestamp}.pdf`);
    const htmlOutputFile = path.join(OUTPUT_DIR, `platform-blueprint-${timestamp}.html`);
    
    let pdfGenerated = false;
    
    try {
        await generatePDFWithPuppeteer(content, pdfOutputFile, "Platform Blueprint");
        printStatus(`✅ PDF generated: ${pdfOutputFile}`);
        pdfGenerated = true;
    } catch (error) {
        printWarning(`PDF generation failed: ${error.message}`);
        printStatus("Install global puppeteer: npm install -g puppeteer");
    }
    
    // Always generate HTML as fallback/bonus
    try {
        generateHTML(content, htmlOutputFile, "Platform Blueprint");
        printStatus(`✅ HTML generated: ${htmlOutputFile}`);
        if (!pdfGenerated) {
            printStatus("💡 To create PDF: Open the HTML file in your browser and use Print → Save as PDF");
        }
    } catch (error) {
        printError(`HTML generation failed: ${error.message}`);
    }
}


// Main execution
async function main() {
    const target = process.argv[2] || 'platform-blueprint';
    
    printHeader(`Target: ${target}`);
    
    try {
        switch (target) {
            case 'platform-blueprint':
            case 'combined':
            case 'all':
                await buildPlatformBlueprint();
                break;
            default:
                printError(`Unknown target: ${target}`);
                printStatus("Usage: node build-node.js [platform-blueprint|combined|all]");
                process.exit(1);
        }
        
        printHeader("🎉 Build complete!");
        
        // List output files
        const outputFiles = fs.readdirSync(OUTPUT_DIR);
        if (outputFiles.length > 0) {
            printStatus("📁 Generated files:");
            outputFiles.forEach(file => {
                const filePath = path.join(OUTPUT_DIR, file);
                const stats = fs.statSync(filePath);
                const sizeKB = Math.round(stats.size / 1024);
                printStatus(`   • ${file} (${sizeKB}K)`);
            });
        }
        
        printStatus("🚀 Ready to share your professional documents!");
        printStatus("📄 Open HTML files in your browser to view or print to PDF");
        
    } catch (error) {
        printError(`Build failed: ${error.message}`);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    main().catch(error => {
        printError(`Unexpected error: ${error.message}`);
        process.exit(1);
    });
}