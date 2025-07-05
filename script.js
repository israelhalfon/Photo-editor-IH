class PhotoEditor {
    constructor() {
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.originalImageData = null;
        this.currentImageData = null;
        this.originalImage = null;
        this.currentFilter = 'original';
        this.adjustments = {
            brightness: 0,
            contrast: 0,
            saturation: 0
        };
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.setupDragAndDrop();
    }
    
    setupEventListeners() {
        // File input
        document.getElementById('fileInput').addEventListener('change', (e) => {
            this.handleFileSelect(e.target.files[0]);
        });
        
        // Upload area click
        document.getElementById('uploadArea').addEventListener('click', () => {
            document.getElementById('fileInput').click();
        });
        
        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.selectFilter(e.currentTarget.dataset.filter);
            });
        });
        
        // Adjustment controls
        document.getElementById('brightness').addEventListener('input', (e) => {
            this.adjustments.brightness = parseInt(e.target.value);
            this.applyCurrentFilter();
        });
        
        document.getElementById('contrast').addEventListener('input', (e) => {
            this.adjustments.contrast = parseInt(e.target.value);
            this.applyCurrentFilter();
        });
        
        document.getElementById('saturation').addEventListener('input', (e) => {
            this.adjustments.saturation = parseInt(e.target.value);
            this.applyCurrentFilter();
        });
        
        // Action buttons
        document.getElementById('resetBtn').addEventListener('click', () => {
            this.resetAdjustments();
        });
        
        document.getElementById('newPhotoBtn').addEventListener('click', () => {
            this.startNewPhoto();
        });
        
        document.getElementById('downloadBtn').addEventListener('click', () => {
            this.downloadImage();
        });
    }
    
    setupDragAndDrop() {
        const uploadArea = document.getElementById('uploadArea');
        
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('drag-over');
        });
        
        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('drag-over');
        });
        
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('drag-over');
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleFileSelect(files[0]);
            }
        });
    }
    
    handleFileSelect(file) {
        if (!file || !file.type.startsWith('image/')) {
            this.showNotification('Please select a valid image file', 'error');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            this.loadImage(e.target.result);
        };
        reader.readAsDataURL(file);
    }
    
    loadImage(src) {
        const img = new Image();
        img.onload = () => {
            this.originalImage = img;
            this.setupCanvas(img);
            this.showEditor();
            this.showNotification('Image loaded successfully!');
        };
        img.src = src;
    }
    
    setupCanvas(img) {
        const maxWidth = 800;
        const maxHeight = 600;
        
        let { width, height } = img;
        
        // Calculate aspect ratio and resize if needed
        if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width *= ratio;
            height *= ratio;
        }
        
        this.canvas.width = width;
        this.canvas.height = height;
        
        // Draw original image
        this.ctx.drawImage(img, 0, 0, width, height);
        
        // Store original image data
        this.originalImageData = this.ctx.getImageData(0, 0, width, height);
        this.currentImageData = this.ctx.getImageData(0, 0, width, height);
    }
    
    showEditor() {
        document.getElementById('uploadSection').style.display = 'none';
        document.getElementById('editorSection').style.display = 'block';
    }
    
    selectFilter(filter) {
        // Update active button
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
        
        this.currentFilter = filter;
        this.applyCurrentFilter();
    }
    
    applyCurrentFilter() {
        // Start with original image data
        this.currentImageData = new ImageData(
            new Uint8ClampedArray(this.originalImageData.data),
            this.originalImageData.width,
            this.originalImageData.height
        );
        
        // Apply selected filter
        switch (this.currentFilter) {
            case 'blackwhite':
                this.applyBlackWhiteFilter();
                break;
            case 'chromatic':
                this.applyChromaticFilter();
                break;
            case 'paint':
                this.applyPaintFilter();
                break;
            case 'enhanced':
                this.applyEnhancedFilter();
                break;
            default:
                // Original - no filter
                break;
        }
        
        // Apply adjustments
        this.applyAdjustments();
        
        // Update canvas
        this.ctx.putImageData(this.currentImageData, 0, 0);
    }
    
    applyBlackWhiteFilter() {
        const data = this.currentImageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            
            // Convert to grayscale using luminance formula
            const gray = 0.299 * r + 0.587 * g + 0.114 * b;
            
            data[i] = gray;     // R
            data[i + 1] = gray; // G
            data[i + 2] = gray; // B
        }
    }
    
    applyChromaticFilter() {
        const data = this.currentImageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
            // Enhance saturation and add color shift
            data[i] = Math.min(255, data[i] * 1.2);     // Enhance red
            data[i + 1] = Math.min(255, data[i + 1] * 1.1); // Slightly enhance green
            data[i + 2] = Math.min(255, data[i + 2] * 1.3); // Enhance blue
        }
    }
    
    applyPaintFilter() {
        const data = this.currentImageData.data;
        const width = this.currentImageData.width;
        const height = this.currentImageData.height;
        
        // Create a copy for edge detection
        const originalData = new Uint8ClampedArray(data);
        
        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                const i = (y * width + x) * 4;
                
                // Simple edge detection and color enhancement
                const neighbors = [
                    (y - 1) * width + x,
                    (y + 1) * width + x,
                    y * width + (x - 1),
                    y * width + (x + 1)
                ];
                
                let avgR = 0, avgG = 0, avgB = 0;
                for (const n of neighbors) {
                    const ni = n * 4;
                    avgR += originalData[ni];
                    avgG += originalData[ni + 1];
                    avgB += originalData[ni + 2];
                }
                
                avgR /= neighbors.length;
                avgG /= neighbors.length;
                avgB /= neighbors.length;
                
                // Blend with original for paint effect
                data[i] = (data[i] + avgR) / 2;
                data[i + 1] = (data[i + 1] + avgG) / 2;
                data[i + 2] = (data[i + 2] + avgB) / 2;
            }
        }
    }
    
    applyEnhancedFilter() {
        const data = this.currentImageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
            // Enhance contrast and vibrance
            let r = data[i];
            let g = data[i + 1];
            let b = data[i + 2];
            
            // Increase contrast
            r = ((r / 255 - 0.5) * 1.5 + 0.5) * 255;
            g = ((g / 255 - 0.5) * 1.5 + 0.5) * 255;
            b = ((b / 255 - 0.5) * 1.5 + 0.5) * 255;
            
            // Clamp values
            data[i] = Math.max(0, Math.min(255, r));
            data[i + 1] = Math.max(0, Math.min(255, g));
            data[i + 2] = Math.max(0, Math.min(255, b));
        }
    }
    
    applyAdjustments() {
        const data = this.currentImageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
            let r = data[i];
            let g = data[i + 1];
            let b = data[i + 2];
            
            // Apply brightness
            r += this.adjustments.brightness * 2.55;
            g += this.adjustments.brightness * 2.55;
            b += this.adjustments.brightness * 2.55;
            
            // Apply contrast
            const contrast = (this.adjustments.contrast + 100) / 100;
            r = ((r / 255 - 0.5) * contrast + 0.5) * 255;
            g = ((g / 255 - 0.5) * contrast + 0.5) * 255;
            b = ((b / 255 - 0.5) * contrast + 0.5) * 255;
            
            // Apply saturation
            const gray = 0.299 * r + 0.587 * g + 0.114 * b;
            const saturation = (this.adjustments.saturation + 100) / 100;
            r = gray + (r - gray) * saturation;
            g = gray + (g - gray) * saturation;
            b = gray + (b - gray) * saturation;
            
            // Clamp values
            data[i] = Math.max(0, Math.min(255, r));
            data[i + 1] = Math.max(0, Math.min(255, g));
            data[i + 2] = Math.max(0, Math.min(255, b));
        }
    }
    
    resetAdjustments() {
        this.adjustments = {
            brightness: 0,
            contrast: 0,
            saturation: 0
        };
        
        document.getElementById('brightness').value = 0;
        document.getElementById('contrast').value = 0;
        document.getElementById('saturation').value = 0;
        
        this.applyCurrentFilter();
        this.showNotification('Adjustments reset');
    }
    
    startNewPhoto() {
        document.getElementById('uploadSection').style.display = 'block';
        document.getElementById('editorSection').style.display = 'none';
        
        this.originalImageData = null;
        this.currentImageData = null;
        this.originalImage = null;
        this.currentFilter = 'original';
        this.resetAdjustments();
        
        // Reset filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector('[data-filter="original"]').classList.add('active');
    }
    
    downloadImage() {
        const link = document.createElement('a');
        link.download = `edited-photo-${Date.now()}.png`;
        link.href = this.canvas.toDataURL();
        link.click();
        
        this.showNotification('Image downloaded successfully!');
    }
    
    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Initialize the photo editor when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new PhotoEditor();
});