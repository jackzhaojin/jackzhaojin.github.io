#!/bin/bash

# Consolidated Build Script for Platform Blueprint Documentation
# Combines functionality from build-pdfs.sh, quick-build.sh, and build-platform-blueprint.sh
# Usage: ./build.sh [quick|professional|combined|all] [platform-blueprint|all]

set -e

# Configuration
BLUEPRINT_DIR="platform-blueprint"
OUTPUT_DIR="blueprint-output"
SECTIONS_DIR="$BLUEPRINT_DIR"
PANDOC_TEMPLATES_DIR=".pandoc/templates"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}[BUILD]${NC} $1"
}

# Default values
BUILD_TYPE=${1:-quick}
TARGET=${2:-all}

print_header "🚀 Consolidated Build Script - Type: $BUILD_TYPE, Target: $TARGET"

# Ensure output directory exists
mkdir -p "$OUTPUT_DIR"

# Function to check Docker availability
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
}

# Function to setup Eisvogel template for professional builds
setup_eisvogel_template() {
    print_status "Setting up Eisvogel template for professional build..."
    
    # Create templates directory if it doesn't exist
    mkdir -p "$PANDOC_TEMPLATES_DIR"
    
    # Download Eisvogel template if not present
    if [ ! -f "$PANDOC_TEMPLATES_DIR/eisvogel.latex" ]; then
        print_status "Downloading Eisvogel template..."
        
        # Create temporary directory
        temp_dir=$(mktemp -d)
        cd "$temp_dir"
        
        # Download and extract template
        wget -q https://github.com/Wandmalfarbe/pandoc-latex-template/releases/download/v3.2.0/Eisvogel.zip
        unzip -q Eisvogel.zip
        
        # Copy template back to main directory
        cd -
        cp "$temp_dir/Eisvogel-3.2.0/eisvogel.latex" "$PANDOC_TEMPLATES_DIR/"
        
        # Clean up
        rm -rf "$temp_dir"
        
        print_status "Template downloaded successfully!"
    else
        print_status "Eisvogel template already exists, skipping download."
    fi
}

# Function to build platform blueprint with Docker (quick method)
build_platform_blueprint_docker_quick() {
    print_status "📄 Building Platform Blueprint (Docker Quick)..."
    
    # Check if file exists first - try output dir first, then blueprint dir
    BLUEPRINT_FILE=""
    if [ -f "$OUTPUT_DIR/platform-blueprint.md" ]; then
        BLUEPRINT_FILE="$OUTPUT_DIR/platform-blueprint.md"
        print_status "Using generated platform blueprint file from output directory"
    elif [ -f "$BLUEPRINT_DIR/platform-blueprint-combined.md" ]; then
        BLUEPRINT_FILE="$BLUEPRINT_DIR/platform-blueprint-combined.md"
    elif [ -f "$BLUEPRINT_DIR/platform-blueprint.md" ]; then
        BLUEPRINT_FILE="$BLUEPRINT_DIR/platform-blueprint.md"
    else
        print_error "❌ Error: No platform blueprint markdown file found"
        print_status "Run './build.sh combined' first to generate platform-blueprint.md from sections"
        print_status "Current directory: $(pwd)"
        print_status "Files in $BLUEPRINT_DIR/:"
        ls -la "$BLUEPRINT_DIR/" || print_error "$BLUEPRINT_DIR directory not found"
        exit 1
    fi
    
    print_status "Using platform blueprint file: $BLUEPRINT_FILE"
    
    # Detect if running on Windows (Git Bash/MINGW) - optimized for user's setup
    if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" || "$(uname -s)" == "MINGW"* ]]; then
        print_status "🖥️  Detected Windows environment, adjusting Docker command..."
        # Convert Unix path to Windows path for Docker
        WIN_PATH=$(cygpath -w "$(pwd)" 2>/dev/null || echo "$(pwd)" | sed 's|^/c/|C:/|')
        docker run --rm \
            --volume "${WIN_PATH}:/data" \
            pandoc/latex:latest \
            "$BLUEPRINT_FILE" \
            -o "$OUTPUT_DIR/platform-blueprint.pdf" \
            --pdf-engine=xelatex \
            --toc
    else
        docker run --rm \
            --volume "$(pwd):/data" \
            --user "$(id -u):$(id -g)" \
            pandoc/latex:latest \
            "$BLUEPRINT_FILE" \
            -o "$OUTPUT_DIR/platform-blueprint.pdf" \
            --pdf-engine=xelatex \
            --toc
    fi
    print_status "✅ Platform Blueprint PDF (Quick): $OUTPUT_DIR/platform-blueprint.pdf"
}

# Function to build platform blueprint with Docker (professional method)
build_platform_blueprint_docker_professional() {
    print_status "📄 Building Platform Blueprint (Docker Professional)..."
    
    # Check if file exists first - try output dir first, then blueprint dir
    BLUEPRINT_FILE=""
    if [ -f "$OUTPUT_DIR/platform-blueprint.md" ]; then
        BLUEPRINT_FILE="$OUTPUT_DIR/platform-blueprint.md"
        print_status "Using generated platform blueprint file from output directory"
    elif [ -f "$BLUEPRINT_DIR/platform-blueprint-combined.md" ]; then
        BLUEPRINT_FILE="$BLUEPRINT_DIR/platform-blueprint-combined.md"
    elif [ -f "$BLUEPRINT_DIR/platform-blueprint.md" ]; then
        BLUEPRINT_FILE="$BLUEPRINT_DIR/platform-blueprint.md"
    else
        print_error "❌ Error: No platform blueprint markdown file found"
        print_status "Run './build.sh combined' first to generate platform-blueprint.md from sections"
        exit 1
    fi
    
    print_status "Using platform blueprint file: $BLUEPRINT_FILE"
    
    docker run --rm \
        --volume "$(pwd):/data" \
        --volume "$(pwd)/$PANDOC_TEMPLATES_DIR:/root/.pandoc/templates" \
        --user "$(id -u):$(id -g)" \
        pandoc/latex:latest \
        "$BLUEPRINT_FILE" \
        -o "$OUTPUT_DIR/platform-blueprint-professional.pdf" \
        --from markdown \
        --template eisvogel.latex \
        --pdf-engine=xelatex \
        --listings \
        --toc

    if [ $? -eq 0 ]; then
        print_status "✅ Platform Blueprint PDF (Professional): $OUTPUT_DIR/platform-blueprint-professional.pdf"
    else
        print_error "❌ Failed to create Platform Blueprint PDF (Professional)"
        exit 1
    fi
}



# Function to combine sections and build with local pandoc
build_combined_sections() {
    print_status "🔄 Building combined platform blueprint from sections..."
    
    # Create the combined markdown file
    COMBINED_FILE="$OUTPUT_DIR/platform-blueprint-combined.md"
    
    # Get current date in Eastern timezone
    CURRENT_DATE=$(TZ=America/New_York date +"%Y-%m-%d")
    # Get ISO 8601 timestamp in Eastern timezone (sanitized for filenames)
    ISO_TIMESTAMP=$(TZ=America/New_York date +"%Y-%m-%dT%H-%M-%S%z")
    
    # Start with the YAML frontmatter
    cat > "$COMBINED_FILE" << EOF
---
title: "Platform Blueprint"
subtitle: "Technical Architecture Documentation"
author: "Jack Jin"
date: "$CURRENT_DATE"
titlepage: true
toc: true
toc-depth: 3
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

EOF
    
    # Append all sections in numerical order
    for section_file in "$SECTIONS_DIR"/*.md; do
        if [ -f "$section_file" ]; then
            echo "" >> "$COMBINED_FILE"
            cat "$section_file" >> "$COMBINED_FILE"
            echo "" >> "$COMBINED_FILE"
            echo "---" >> "$COMBINED_FILE"
            echo "" >> "$COMBINED_FILE"
        fi
    done
    
    # Remove the last separator
    sed -i '$d' "$COMBINED_FILE" 2>/dev/null || sed -i '' '$d' "$COMBINED_FILE"
    sed -i '$d' "$COMBINED_FILE" 2>/dev/null || sed -i '' '$d' "$COMBINED_FILE"
    sed -i '$d' "$COMBINED_FILE" 2>/dev/null || sed -i '' '$d' "$COMBINED_FILE"
    
    print_status "Combined markdown file created: $COMBINED_FILE"
    
    # Also create a copy as platform-blueprint.md in output for Docker builds
    cp "$COMBINED_FILE" "$OUTPUT_DIR/platform-blueprint.md"
    
    # Generate PDF if pandoc is available
    if command -v pandoc >/dev/null 2>&1; then
        print_status "Generating PDF with local pandoc..."
        pandoc "$COMBINED_FILE" \
            --from markdown \
            --to pdf \
            --output "$OUTPUT_DIR/platform-blueprint-combined-$ISO_TIMESTAMP.pdf" \
            --pdf-engine=pdflatex \
            --toc \
            --toc-depth=2 \
            -V geometry:margin=1in \
            -V fontsize=11pt \
            --highlight-style=github
        print_status "✅ PDF generated: $OUTPUT_DIR/platform-blueprint-combined-$ISO_TIMESTAMP.pdf"
        
        print_status "Generating HTML..."
        pandoc "$COMBINED_FILE" \
            --from markdown \
            --to html5 \
            --output "$OUTPUT_DIR/platform-blueprint-combined-$ISO_TIMESTAMP.html" \
            --standalone \
            --toc \
            --toc-depth=2 \
            --highlight-style=github
        print_status "✅ HTML generated: $OUTPUT_DIR/platform-blueprint-combined-$ISO_TIMESTAMP.html"
    else
        print_warning "Pandoc not found locally. Only markdown file generated."
        print_warning "Install pandoc locally or use Docker builds for PDF generation."
    fi
}

# Main build logic
case $BUILD_TYPE in
    "quick")
        print_header "🏃‍♂️ Quick Build Mode (Optimized for local Windows setup)"
        check_docker
        
        case $TARGET in
            "platform-blueprint")
                build_platform_blueprint_docker_quick
                ;;
            "all")
                build_platform_blueprint_docker_quick
                ;;
            *)
                print_error "Invalid target: $TARGET. Use: platform-blueprint|all"
                exit 1
                ;;
        esac
        ;;
    
    "professional")
        print_header "🎩 Professional Build Mode (High-quality PDFs with Eisvogel template)"
        check_docker
        setup_eisvogel_template
        
        case $TARGET in
            "platform-blueprint")
                build_platform_blueprint_docker_professional
                ;;
            "all")
                build_platform_blueprint_docker_professional
                ;;
            *)
                print_error "Invalid target: $TARGET. Use: platform-blueprint|all"
                exit 1
                ;;
        esac
        ;;
    
    "combined")
        print_header "🔗 Combined Build Mode (Sections → Combined document with local pandoc)"
        build_combined_sections
        ;;
    
    "all")
        print_header "🌟 All Build Modes (Quick + Professional + Combined)"
        check_docker
        setup_eisvogel_template
        
        # Build combined first
        build_combined_sections
        
        # Then build quick versions
        case $TARGET in
            "platform-blueprint")
                build_platform_blueprint_docker_quick
                build_platform_blueprint_docker_professional
                ;;
            "all")
                build_platform_blueprint_docker_quick
                build_platform_blueprint_docker_professional
                ;;
        esac
        ;;
    
    *)
        print_error "Usage: $0 [quick|professional|combined|all] [platform-blueprint|all]"
        echo ""
        echo "Build Types:"
        echo "  quick        - Fast Docker build (optimized for Windows)"
        echo "  professional - High-quality PDFs with Eisvogel template"
        echo "  combined     - Combine sections with local pandoc"
        echo "  all          - Run all build types"
        echo ""
        echo "Targets:"
        echo "  platform-blueprint  - Build platform blueprint"
        echo "  all                 - Build platform blueprint (same as platform-blueprint)"
        echo ""
        echo "Examples:"
        echo "  $0                               # Quick build (default)"
        echo "  $0 quick platform-blueprint      # Quick platform blueprint"
        echo "  $0 professional                  # Professional PDF"
        echo "  $0 combined                      # Combine sections only"
        echo "  $0 all                           # All build types"
        exit 1
        ;;
esac

# Summary
print_header "🎉 Build complete!"
print_status "📁 Output directory: $OUTPUT_DIR"

# List generated files
if [ -d "$OUTPUT_DIR" ]; then
    print_status "Generated files:"
    for file in "$OUTPUT_DIR"/*; do
        if [ -f "$file" ]; then
            size=$(du -h "$file" | cut -f1)
            print_status "   • $(basename "$file") ($size)"
        fi
    done
fi

echo ""
print_status "🚀 Ready to share your professional documents!"