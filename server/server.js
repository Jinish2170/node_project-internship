const app = require('./app');
const path = require('path');
const fs = require('fs');

// Load environment variables
require('dotenv').config();

const PORT = process.env.PORT || 5000;

// Ensure required directories exist
const requiredDirs = [
  path.join(__dirname, 'data'),
  path.join(__dirname, '../uploads'),
  path.join(__dirname, '../uploads/materials'),
  path.join(__dirname, '../uploads/resumes'),
  path.join(__dirname, '../uploads/events')
];

requiredDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
});

// Initialize data files if they don't exist
const dataFiles = [
  { path: path.join(__dirname, 'data/users.json'), data: [] },
  { path: path.join(__dirname, 'data/notices.json'), data: [] },
  { path: path.join(__dirname, 'data/events.json'), data: [] },
  { path: path.join(__dirname, 'data/materials.json'), data: [] },
  { path: path.join(__dirname, 'data/resumes.json'), data: [] }
];

dataFiles.forEach(file => {
  if (!fs.existsSync(file.path)) {
    fs.writeFileSync(file.path, JSON.stringify(file.data, null, 2));
    console.log(`Created data file: ${file.path}`);
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 CampusConnect Server running on port ${PORT}`);
  console.log(`🌐 API Base URL: http://localhost:${PORT}/api`);
  console.log(`📁 Environment: ${process.env.NODE_ENV || 'development'}`);
});
