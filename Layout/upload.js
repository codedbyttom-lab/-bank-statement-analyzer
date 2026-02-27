// Get DOM elements
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const filePreview = document.getElementById('filePreview');
const fileName = document.getElementById('fileName');
const fileSize = document.getElementById('fileSize');
const removeFile = document.getElementById('removeFile');
const uploadButton = document.getElementById('uploadButton');

let selectedFile = null;

// Click to upload
uploadArea.addEventListener('click', () => {
  fileInput.click();
});

// File input change
fileInput.addEventListener('change', (e) => {
  handleFile(e.target.files[0]);
});

// Drag and drop events
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
  
  const file = e.dataTransfer.files[0];
  handleFile(file);
});

// Handle file selection
function handleFile(file) {
  if (!file) return;

  // Check file type
  if (!file.name.endsWith('.csv')) {
    alert('Please upload a CSV file');
    return;
  }

  // Check file size (10MB limit)
  const maxSize = 10 * 1024 * 1024; // 10MB in bytes
  if (file.size > maxSize) {
    alert('File size exceeds 10MB limit');
    return;
  }

  selectedFile = file;
  
  // Display file info
  fileName.textContent = file.name;
  fileSize.textContent = formatFileSize(file.size);
  
  // Show preview, hide upload area
  uploadArea.style.display = 'none';
  filePreview.style.display = 'block';
}

// Remove file
removeFile.addEventListener('click', (e) => {
  e.stopPropagation();
  selectedFile = null;
  fileInput.value = '';
  
  // Hide preview, show upload area
  filePreview.style.display = 'none';
  uploadArea.style.display = 'block';
});

// Upload button
uploadButton.addEventListener('click', () => {
  if (!selectedFile) return;

  // Show loading state
  uploadButton.textContent = 'Analyzing...';
  uploadButton.disabled = true;

  // Read and analyze CSV file client-side
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const csvText = e.target.result;
      const analysisResults = analyzeBankStatement(csvText);
      
      // Store results in localStorage
      localStorage.setItem('bankAnalysisData', JSON.stringify(analysisResults));
      
      // Redirect to dashboard
      window.location.href = 'homepage.html';
    } catch (error) {
      console.error('Error:', error);
      alert(error.message || 'Analysis failed. Please check your CSV format.');
      uploadButton.textContent = 'Upload & Analyze';
      uploadButton.disabled = false;
    }
  };
  
  reader.onerror = function() {
    alert('Failed to read file. Please try again.');
    uploadButton.textContent = 'Upload & Analyze';
    uploadButton.disabled = false;
  };
  
  reader.readAsText(selectedFile);
});

// Format file size
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}
