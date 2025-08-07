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

// Enhanced markdown to HTML converter with code block support
function markdownToHtml(markdown) {
    let html = markdown;
    
    // Remove YAML frontmatter
    html = html.replace(/^---[\s\S]*?---\n/, '');
    
    // Process code blocks first (before other processing)
    // Handle fenced code blocks with language specification
    html = html.replace(/```(\w+)?\s*\n([\s\S]*?)\n```/g, (match, language, code) => {
        const lang = language || 'text';
        const escapedCode = code
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
        return `<pre><code class="language-${lang}">${escapedCode}</code></pre>`;
    });
    
    // Handle inline code
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    // Headers (process after code blocks to avoid conflicts)
    html = html.replace(/^#### (.*$)/gm, '<h4>$1</h4>');
    html = html.replace(/^### (.*$)/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gm, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gm, '<h1>$1</h1>');
    
    // Links
    html = html.replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '<a href="$2">$1</a>');
    
    // Bold and italic (avoid code blocks)
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    
    // Tables (basic support)
    html = html.replace(/\|(.+)\|/g, (match, content) => {
        const cells = content.split('|').map(cell => cell.trim());
        const tableCells = cells.map(cell => `<td>${cell}</td>`).join('');
        return `<tr>${tableCells}</tr>`;
    });
    html = html.replace(/(<tr>.*<\/tr>)/s, '<table>$1</table>');
    
    // Lists (numbered and bulleted)
    html = html.replace(/^\d+\. (.*$)/gm, '<li>$1</li>');
    html = html.replace(/^\* (.*$)/gm, '<li>$1</li>');
    html = html.replace(/^- (.*$)/gm, '<li>$1</li>');
    
    // Wrap consecutive list items in ul/ol tags
    html = html.replace(/((<li>.*<\/li>\s*)+)/gs, (match) => {
        // Check if it's a numbered list by looking at the original content
        if (markdown.includes('1. ') || markdown.includes('2. ')) {
            return `<ol>${match}</ol>`;
        }
        return `<ul>${match}</ul>`;
    });
    
    // Blockquotes
    html = html.replace(/^> (.*$)/gm, '<blockquote>$1</blockquote>');
    
    // Horizontal rules
    html = html.replace(/^---$/gm, '<hr>');
    html = html.replace(/^\*\*\*$/gm, '<hr>');
    
    // Paragraphs (process last, avoiding code blocks and other block elements)
    const lines = html.split('\n');
    let result = [];
    let inCodeBlock = false;
    let inBlockElement = false;
    let currentParagraph = [];
    
    for (let line of lines) {
        const trimmedLine = line.trim();
        
        // Check if we're in a code block
        if (trimmedLine.startsWith('<pre>')) {
            inCodeBlock = true;
            if (currentParagraph.length > 0) {
                result.push(`<p>${currentParagraph.join(' ')}</p>`);
                currentParagraph = [];
            }
            result.push(line);
            continue;
        }
        if (trimmedLine.endsWith('</pre>')) {
            inCodeBlock = false;
            result.push(line);
            continue;
        }
        if (inCodeBlock) {
            result.push(line);
            continue;
        }
        
        // Check if we're in a block element
        const blockElements = ['<h1', '<h2', '<h3', '<h4', '<ul>', '<ol>', '<table>', '<blockquote>', '<hr>', '<pre>'];
        const blockEndElements = ['</ul>', '</ol>', '</table>', '</blockquote>'];
        
        if (blockElements.some(tag => trimmedLine.startsWith(tag))) {
            inBlockElement = true;
            if (currentParagraph.length > 0) {
                result.push(`<p>${currentParagraph.join(' ')}</p>`);
                currentParagraph = [];
            }
            result.push(line);
            continue;
        }
        
        if (blockEndElements.some(tag => trimmedLine.includes(tag))) {
            inBlockElement = false;
            result.push(line);
            continue;
        }
        
        if (inBlockElement) {
            result.push(line);
            continue;
        }
        
        // Regular content - build paragraphs
        if (trimmedLine === '') {
            if (currentParagraph.length > 0) {
                result.push(`<p>${currentParagraph.join(' ')}</p>`);
                currentParagraph = [];
            }
        } else {
            currentParagraph.push(trimmedLine);
        }
    }
    
    // Handle any remaining paragraph content
    if (currentParagraph.length > 0) {
        result.push(`<p>${currentParagraph.join(' ')}</p>`);
    }
    
    html = result.join('\n');
    
    // Clean up empty paragraphs and fix nesting
    html = html.replace(/<p><\/p>/g, '');
    html = html.replace(/<p>\s*<\/p>/g, '');
    
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
        
        // Create full HTML page with scientific publication styling
        const fullHtml = `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Platform Blueprint - ${title}</title>
    <style>
        body {
            font-family: 'Times New Roman', Times, serif;
            line-height: 1.4;
            color: #222;
            max-width: none;
            margin: 0;
            padding: 0;
            font-size: 11pt;
        }
        .container {
            max-width: 850px;
            margin: 0 auto;
            padding: 30px 40px;
        }
        h1, h2, h3, h4, h5, h6 {
            color: #000;
            margin-top: 1.2em;
            margin-bottom: 0.6em;
            page-break-after: avoid;
            font-weight: bold;
        }
        h1 { 
            border-bottom: 2px solid #000; 
            padding-bottom: 8px; 
            font-size: 18pt;
            margin-top: 0;
            text-align: center;
        }
        h2 { 
            border-bottom: 1px solid #666; 
            padding-bottom: 4px; 
            font-size: 14pt;
            color: #000;
            margin-top: 1.5em;
        }
        h3 { 
            font-size: 12pt; 
            color: #000;
            margin-top: 1.2em;
        }
        h4 { 
            font-size: 11pt; 
            color: #000;
            margin-top: 1em;
        }
        p { 
            margin-bottom: 0.8em; 
            text-align: justify; 
            line-height: 1.4;
            orphans: 2;
            widows: 2;
            text-indent: 0;
        }
        ul, ol { 
            margin-bottom: 0.8em; 
            padding-left: 1.5em; 
        }
        li { 
            margin-bottom: 0.3em; 
            line-height: 1.4;
            page-break-inside: avoid;
        }
        strong { 
            color: #000; 
            font-weight: bold;
        }
        em { 
            color: #222; 
            font-style: normal;
            font-weight: 500;
        }
        code {
            background-color: #f5f5f5;
            color: #000;
            padding: 1px 3px;
            border-radius: 2px;
            font-family: 'Courier New', Consolas, Monaco, monospace;
            font-size: 9pt;
            border: 1px solid #ddd;
        }
        pre {
            background-color: #f9f9f9;
            border: 1px solid #ccc;
            border-radius: 3px;
            padding: 12px;
            margin: 1em 0;
            overflow-x: auto;
            page-break-inside: avoid;
            line-height: 1.3;
            font-size: 9pt;
        }
        pre code {
            background: none;
            color: #000;
            padding: 0;
            border: none;
            font-size: 9pt;
            border-radius: 0;
        }
        /* Simplified syntax highlighting */
        .language-bash code, .language-shell code {
            color: #000;
        }
        .language-javascript code, .language-js code {
            color: #000;
        }
        .language-yaml code, .language-yml code {
            color: #000;
        }
        .language-json code {
            color: #000;
        }
        blockquote {
            border-left: 3px solid #666;
            margin: 1em 0;
            padding: 0.3em 1em;
            background-color: #f9f9f9;
            font-style: normal;
        }
        table {
            border-collapse: collapse;
            width: 100%;
            margin: 1em 0;
            font-size: 10pt;
        }
        td, th {
            border: 1px solid #666;
            padding: 4px 8px;
            text-align: left;
        }
        th {
            background-color: #f0f0f0;
            font-weight: bold;
        }
        hr {
            border: none;
            border-top: 1px solid #666;
            margin: 1.5em 0;
        }
        .header { 
            text-align: center; 
            margin-bottom: 2em; 
            padding-bottom: 1em; 
            border-bottom: 2px solid #000;
            page-break-after: avoid;
        }
        .footer { 
            text-align: center; 
            margin-top: 2em; 
            padding-top: 1em; 
            border-top: 1px solid #666; 
            color: #666;
            font-size: 9pt;
            page-break-before: avoid;
        }
        @page { 
            margin: 0.75in; 
            size: Letter;
        }
        @media print {
            .container { padding: 15px; }
            h1 { font-size: 16pt; }
            h2 { font-size: 13pt; }
            h3 { font-size: 11pt; }
            h4 { font-size: 10pt; }
            body { font-size: 10pt; }
            pre, code { font-size: 8pt; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="border: none; margin-bottom: 0;">Platform Blueprint</h1>
            <h2 style="border: none; color: #666; margin-top: 0; font-size: 12pt; font-weight: normal;">${title}</h2>
            <p style="margin: 0.5em 0; font-size: 10pt;"><strong>Author:</strong> Jack Jin | <strong>Date:</strong> ${getCurrentDate()}</p>
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
            font-family: 'Times New Roman', Times, serif;
            line-height: 1.4;
            color: #222;
            max-width: 900px;
            margin: 0 auto;
            padding: 20px;
            background-color: #fff;
            font-size: 11pt;
        }
        .container {
            background-color: white;
            padding: 30px;
            border-radius: 0;
            box-shadow: none;
            border: 1px solid #ddd;
        }
        h1, h2, h3, h4, h5, h6 {
            color: #000;
            margin-top: 1.2em;
            margin-bottom: 0.6em;
            font-weight: bold;
        }
        h1 { 
            border-bottom: 2px solid #000; 
            padding-bottom: 8px; 
            font-size: 20pt;
            margin-top: 0;
            text-align: center;
        }
        h2 { 
            border-bottom: 1px solid #666; 
            padding-bottom: 4px; 
            font-size: 16pt;
            color: #000;
            margin-top: 1.5em;
        }
        h3 { 
            font-size: 14pt; 
            color: #000;
            margin-top: 1.2em;
        }
        h4 { 
            font-size: 12pt; 
            color: #000;
            margin-top: 1em;
        }
        p { 
            margin-bottom: 0.8em; 
            text-align: justify; 
            line-height: 1.4;
            text-indent: 0;
        }
        ul, ol { 
            margin-bottom: 0.8em; 
            padding-left: 1.5em; 
        }
        li { 
            margin-bottom: 0.3em; 
            line-height: 1.4;
        }
        strong { 
            color: #000; 
            font-weight: bold;
        }
        em { 
            color: #222; 
            font-style: normal;
            font-weight: 500;
        }
        code {
            background-color: #f5f5f5;
            color: #000;
            padding: 1px 3px;
            border-radius: 2px;
            font-family: 'Courier New', Consolas, Monaco, monospace;
            font-size: 10pt;
            border: 1px solid #ddd;
        }
        pre {
            background-color: #f9f9f9;
            border: 1px solid #ccc;
            border-radius: 3px;
            padding: 12px;
            margin: 1em 0;
            overflow-x: auto;
            line-height: 1.3;
            font-size: 10pt;
        }
        pre code {
            background: none;
            color: #000;
            padding: 0;
            border: none;
            font-size: 10pt;
            border-radius: 0;
        }
        /* Simplified syntax highlighting */
        .language-bash code, .language-shell code {
            color: #000;
        }
        .language-javascript code, .language-js code {
            color: #000;
        }
        .language-yaml code, .language-yml code {
            color: #000;
        }
        .language-json code {
            color: #000;
        }
        blockquote {
            border-left: 3px solid #666;
            margin: 1em 0;
            padding: 0.3em 1em;
            background-color: #f9f9f9;
            font-style: normal;
        }
        table {
            border-collapse: collapse;
            width: 100%;
            margin: 1em 0;
            font-size: 10pt;
        }
        td, th {
            border: 1px solid #666;
            padding: 4px 8px;
            text-align: left;
        }
        th {
            background-color: #f0f0f0;
            font-weight: bold;
        }
        hr {
            border: none;
            border-top: 1px solid #666;
            margin: 1.5em 0;
        }
        .header { 
            text-align: center; 
            margin-bottom: 2em; 
            padding-bottom: 1em; 
            border-bottom: 2px solid #000;
        }
        .footer { 
            text-align: center; 
            margin-top: 2em; 
            padding-top: 1em; 
            border-top: 1px solid #666; 
            color: #666;
            font-size: 9pt;
        }
        .page-break {
            page-break-before: always;
        }
        @media print {
            body { 
                background-color: white; 
                font-size: 10pt;
            }
            .container {
                box-shadow: none;
                padding: 15px;
                border: none;
            }
            h1 { font-size: 16pt; }
            h2 { font-size: 13pt; }
            h3 { font-size: 11pt; }
            h4 { font-size: 10pt; }
            pre, code { font-size: 8pt; }
        }
        /* Make links print-friendly */
        @media print {
            a[href]:after {
                content: " (" attr(href) ")";
                font-size: 8pt;
                color: #666;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="border: none; margin-bottom: 0;">Platform Blueprint</h1>
            <h2 style="border: none; color: #666; margin-top: 0; font-size: 14pt; font-weight: normal;">${title}</h2>
            <p style="margin: 0.5em 0; font-size: 10pt;"><strong>Author:</strong> Jack Jin | <strong>Date:</strong> ${getCurrentDate()}</p>
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