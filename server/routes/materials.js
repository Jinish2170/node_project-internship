const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const { auth, authorize } = require('../middleware/auth');
const { validateMaterial } = require('../middleware/validation');
const { uploadMaterial } = require('../middleware/upload');

const router = express.Router();
const materialsPath = path.join(__dirname, '../data/materials.json');

// Helper functions
const readMaterials = async () => {
  try {
    const data = await fs.readFile(materialsPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

const writeMaterials = async (materials) => {
  await fs.writeFile(materialsPath, JSON.stringify(materials, null, 2));
};

// @route   GET /api/materials
// @desc    Get all materials
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const materials = await readMaterials();
    
    // Apply query filters
    const { 
      subject, 
      semester, 
      department, 
      materialType, 
      search, 
      limit = 20, 
      page = 1 
    } = req.query;
    
    let filteredMaterials = materials;
    
    if (subject) {
      filteredMaterials = filteredMaterials.filter(material => 
        material.subject.toLowerCase().includes(subject.toLowerCase())
      );
    }
    
    if (semester) {
      filteredMaterials = filteredMaterials.filter(material => 
        material.semester === parseInt(semester)
      );
    }
    
    if (department) {
      filteredMaterials = filteredMaterials.filter(material => 
        material.department.toLowerCase().includes(department.toLowerCase())
      );
    }
    
    if (materialType) {
      filteredMaterials = filteredMaterials.filter(material => 
        material.materialType === materialType
      );
    }
    
    if (search) {
      const searchTerm = search.toLowerCase();
      filteredMaterials = filteredMaterials.filter(material =>
        material.title.toLowerCase().includes(searchTerm) ||
        material.description.toLowerCase().includes(searchTerm) ||
        material.subject.toLowerCase().includes(searchTerm)
      );
    }

    // Sort by upload date (newest first)
    filteredMaterials.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedMaterials = filteredMaterials.slice(startIndex, endIndex);

    res.json({
      status: 'success',
      data: {
        materials: paginatedMaterials,
        pagination: {
          total: filteredMaterials.length,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(filteredMaterials.length / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get materials error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/materials/:id
// @desc    Get single material
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const materials = await readMaterials();
    const material = materials.find(m => m.id === req.params.id);

    if (!material) {
      return res.status(404).json({
        status: 'error',
        message: 'Material not found'
      });
    }

    // Increment download count
    const materialIndex = materials.findIndex(m => m.id === req.params.id);
    if (materialIndex !== -1) {
      materials[materialIndex].downloadCount = (materials[materialIndex].downloadCount || 0) + 1;
      materials[materialIndex].lastDownloaded = new Date().toISOString();
      await writeMaterials(materials);
    }

    res.json({
      status: 'success',
      data: {
        material: materials[materialIndex]
      }
    });

  } catch (error) {
    console.error('Get material error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

// @route   POST /api/materials
// @desc    Upload new material
// @access  Private (Faculty/Admin only)
router.post('/', auth, authorize('faculty', 'admin'), uploadMaterial.single('file'), validateMaterial, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'File is required'
      });
    }

    const { 
      title, 
      description, 
      subject, 
      semester, 
      department, 
      materialType 
    } = req.body;

    const materials = await readMaterials();

    const newMaterial = {
      id: Date.now().toString(),
      title,
      description: description || '',
      subject,
      semester: parseInt(semester),
      department,
      materialType,
      fileName: req.file.originalname,
      filePath: `/uploads/materials/${req.file.filename}`,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      uploadedBy: {
        id: req.user.id,
        name: req.user.name,
        role: req.user.role
      },
      downloadCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    materials.push(newMaterial);
    await writeMaterials(materials);

    res.status(201).json({
      status: 'success',
      message: 'Material uploaded successfully',
      data: {
        material: newMaterial
      }
    });

  } catch (error) {
    console.error('Upload material error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/materials/:id/download
// @desc    Download material file
// @access  Private
router.get('/:id/download', auth, async (req, res) => {
  try {
    const materials = await readMaterials();
    const material = materials.find(m => m.id === req.params.id);

    if (!material) {
      return res.status(404).json({
        status: 'error',
        message: 'Material not found'
      });
    }

    const filePath = path.join(__dirname, '../..', material.filePath);
    
    // Check if file exists
    try {
      await fs.access(filePath);
    } catch (error) {
      return res.status(404).json({
        status: 'error',
        message: 'File not found on server'
      });
    }

    // Update download count
    const materialIndex = materials.findIndex(m => m.id === req.params.id);
    if (materialIndex !== -1) {
      materials[materialIndex].downloadCount = (materials[materialIndex].downloadCount || 0) + 1;
      materials[materialIndex].lastDownloaded = new Date().toISOString();
      await writeMaterials(materials);
    }

    // Set headers for file download
    res.setHeader('Content-Disposition', `attachment; filename="${material.fileName}"`);
    res.setHeader('Content-Type', material.mimeType);

    // Send file
    res.sendFile(filePath);

  } catch (error) {
    console.error('Download material error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

// @route   PUT /api/materials/:id
// @desc    Update material metadata
// @access  Private (Author/Admin only)
router.put('/:id', auth, validateMaterial, async (req, res) => {
  try {
    const materials = await readMaterials();
    const materialIndex = materials.findIndex(m => m.id === req.params.id);

    if (materialIndex === -1) {
      return res.status(404).json({
        status: 'error',
        message: 'Material not found'
      });
    }

    const material = materials[materialIndex];

    // Check permissions
    const canUpdate = 
      material.uploadedBy.id === req.user.id || 
      req.user.role === 'admin';

    if (!canUpdate) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied. You can only update your own materials.'
      });
    }

    // Update material (preserve file-related fields)
    const updatedMaterial = {
      ...material,
      ...req.body,
      id: material.id,
      fileName: material.fileName,
      filePath: material.filePath,
      fileSize: material.fileSize,
      mimeType: material.mimeType,
      uploadedBy: material.uploadedBy,
      downloadCount: material.downloadCount,
      createdAt: material.createdAt,
      updatedAt: new Date().toISOString(),
      semester: parseInt(req.body.semester)
    };

    materials[materialIndex] = updatedMaterial;
    await writeMaterials(materials);

    res.json({
      status: 'success',
      message: 'Material updated successfully',
      data: {
        material: updatedMaterial
      }
    });

  } catch (error) {
    console.error('Update material error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

// @route   DELETE /api/materials/:id
// @desc    Delete material
// @access  Private (Author/Admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const materials = await readMaterials();
    const materialIndex = materials.findIndex(m => m.id === req.params.id);

    if (materialIndex === -1) {
      return res.status(404).json({
        status: 'error',
        message: 'Material not found'
      });
    }

    const material = materials[materialIndex];

    // Check permissions
    const canDelete = 
      material.uploadedBy.id === req.user.id || 
      req.user.role === 'admin';

    if (!canDelete) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied. You can only delete your own materials.'
      });
    }

    // Delete file from filesystem
    try {
      const filePath = path.join(__dirname, '../..', material.filePath);
      await fs.unlink(filePath);
    } catch (error) {
      console.warn('Could not delete file from filesystem:', error.message);
    }

    // Remove from database
    materials.splice(materialIndex, 1);
    await writeMaterials(materials);

    res.json({
      status: 'success',
      message: 'Material deleted successfully'
    });

  } catch (error) {
    console.error('Delete material error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/materials/stats/overview
// @desc    Get material statistics
// @access  Private (Faculty/Admin only)
router.get('/stats/overview', auth, authorize('faculty', 'admin'), async (req, res) => {
  try {
    const materials = await readMaterials();

    const stats = {
      totalMaterials: materials.length,
      byType: {},
      bySemester: {},
      byDepartment: {},
      totalDownloads: materials.reduce((sum, m) => sum + (m.downloadCount || 0), 0),
      recentUploads: materials
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5)
        .map(m => ({
          id: m.id,
          title: m.title,
          subject: m.subject,
          uploadedBy: m.uploadedBy.name,
          createdAt: m.createdAt
        }))
    };

    // Group by type
    materials.forEach(material => {
      stats.byType[material.materialType] = (stats.byType[material.materialType] || 0) + 1;
    });

    // Group by semester
    materials.forEach(material => {
      stats.bySemester[material.semester] = (stats.bySemester[material.semester] || 0) + 1;
    });

    // Group by department
    materials.forEach(material => {
      stats.byDepartment[material.department] = (stats.byDepartment[material.department] || 0) + 1;
    });

    res.json({
      status: 'success',
      data: {
        stats
      }
    });

  } catch (error) {
    console.error('Get material stats error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

module.exports = router;
