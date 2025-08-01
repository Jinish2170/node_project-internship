const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const { auth, authorize } = require('../middleware/auth');
const { validateResume } = require('../middleware/validation');
const { uploadResume } = require('../middleware/upload');

const router = express.Router();
const resumesPath = path.join(__dirname, '../data/resumes.json');

// Helper functions
const readResumes = async () => {
  try {
    const data = await fs.readFile(resumesPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

const writeResumes = async (resumes) => {
  await fs.writeFile(resumesPath, JSON.stringify(resumes, null, 2));
};

// @route   GET /api/resumes
// @desc    Get all resumes
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const resumes = await readResumes();
    
    // Apply query filters
    const { 
      category, 
      experience, 
      skills, 
      search, 
      limit = 20, 
      page = 1 
    } = req.query;
    
    let filteredResumes = resumes;
    
    // Students can only see their own resumes unless they're viewing public ones
    if (req.user.role === 'student') {
      filteredResumes = filteredResumes.filter(resume => 
        resume.uploadedBy.id === req.user.id || resume.isPublic
      );
    }
    
    if (category) {
      filteredResumes = filteredResumes.filter(resume => 
        resume.category === category
      );
    }
    
    if (experience) {
      filteredResumes = filteredResumes.filter(resume => 
        resume.experience === experience
      );
    }
    
    if (skills) {
      const skillsArray = skills.split(',').map(s => s.trim().toLowerCase());
      filteredResumes = filteredResumes.filter(resume => 
        resume.skills && resume.skills.some(skill => 
          skillsArray.some(searchSkill => 
            skill.toLowerCase().includes(searchSkill)
          )
        )
      );
    }
    
    if (search) {
      const searchTerm = search.toLowerCase();
      filteredResumes = filteredResumes.filter(resume =>
        resume.title.toLowerCase().includes(searchTerm) ||
        resume.description.toLowerCase().includes(searchTerm) ||
        (resume.skills && resume.skills.some(skill => 
          skill.toLowerCase().includes(searchTerm)
        ))
      );
    }

    // Sort by upload date (newest first)
    filteredResumes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Remove sensitive information for non-owners
    filteredResumes = filteredResumes.map(resume => {
      if (resume.uploadedBy.id !== req.user.id && req.user.role !== 'admin') {
        const { filePath, ...publicResume } = resume;
        return publicResume;
      }
      return resume;
    });

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedResumes = filteredResumes.slice(startIndex, endIndex);

    res.json({
      status: 'success',
      data: {
        resumes: paginatedResumes,
        pagination: {
          total: filteredResumes.length,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(filteredResumes.length / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get resumes error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/resumes/:id
// @desc    Get single resume
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const resumes = await readResumes();
    const resume = resumes.find(r => r.id === req.params.id);

    if (!resume) {
      return res.status(404).json({
        status: 'error',
        message: 'Resume not found'
      });
    }

    // Check access permissions
    const canAccess = 
      resume.uploadedBy.id === req.user.id || 
      req.user.role === 'admin' || 
      req.user.role === 'faculty' ||
      resume.isPublic;

    if (!canAccess) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied to this resume'
      });
    }

    // Increment view count
    const resumeIndex = resumes.findIndex(r => r.id === req.params.id);
    if (resumeIndex !== -1) {
      resumes[resumeIndex].viewCount = (resumes[resumeIndex].viewCount || 0) + 1;
      resumes[resumeIndex].lastViewed = new Date().toISOString();
      await writeResumes(resumes);
    }

    res.json({
      status: 'success',
      data: {
        resume: resumes[resumeIndex]
      }
    });

  } catch (error) {
    console.error('Get resume error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

// @route   POST /api/resumes
// @desc    Upload new resume
// @access  Private (Students only)
router.post('/', auth, authorize('student'), uploadResume.single('file'), validateResume, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'Resume file is required'
      });
    }

    const { 
      title, 
      description, 
      category, 
      skills, 
      experience 
    } = req.body;

    const resumes = await readResumes();

    // Parse skills if provided as string
    let skillsArray = [];
    if (skills) {
      if (typeof skills === 'string') {
        skillsArray = skills.split(',').map(skill => skill.trim());
      } else if (Array.isArray(skills)) {
        skillsArray = skills;
      }
    }

    const newResume = {
      id: Date.now().toString(),
      title,
      description: description || '',
      category,
      skills: skillsArray,
      experience: experience || 'fresher',
      fileName: req.file.originalname,
      filePath: `/uploads/resumes/${req.file.filename}`,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      uploadedBy: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        department: req.user.department,
        semester: req.user.semester
      },
      isPublic: false,
      viewCount: 0,
      downloadCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    resumes.push(newResume);
    await writeResumes(resumes);

    res.status(201).json({
      status: 'success',
      message: 'Resume uploaded successfully',
      data: {
        resume: newResume
      }
    });

  } catch (error) {
    console.error('Upload resume error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/resumes/:id/download
// @desc    Download resume file
// @access  Private (Author/Faculty/Admin only)
router.get('/:id/download', auth, async (req, res) => {
  try {
    const resumes = await readResumes();
    const resume = resumes.find(r => r.id === req.params.id);

    if (!resume) {
      return res.status(404).json({
        status: 'error',
        message: 'Resume not found'
      });
    }

    // Check download permissions
    const canDownload = 
      resume.uploadedBy.id === req.user.id || 
      req.user.role === 'admin' || 
      req.user.role === 'faculty';

    if (!canDownload) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied. Only the owner, faculty, or admin can download resumes.'
      });
    }

    const filePath = path.join(__dirname, '../..', resume.filePath);
    
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
    const resumeIndex = resumes.findIndex(r => r.id === req.params.id);
    if (resumeIndex !== -1) {
      resumes[resumeIndex].downloadCount = (resumes[resumeIndex].downloadCount || 0) + 1;
      resumes[resumeIndex].lastDownloaded = new Date().toISOString();
      await writeResumes(resumes);
    }

    // Set headers for file download
    res.setHeader('Content-Disposition', `attachment; filename="${resume.fileName}"`);
    res.setHeader('Content-Type', resume.mimeType);

    // Send file
    res.sendFile(filePath);

  } catch (error) {
    console.error('Download resume error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

// @route   PUT /api/resumes/:id
// @desc    Update resume metadata
// @access  Private (Author only)
router.put('/:id', auth, validateResume, async (req, res) => {
  try {
    const resumes = await readResumes();
    const resumeIndex = resumes.findIndex(r => r.id === req.params.id);

    if (resumeIndex === -1) {
      return res.status(404).json({
        status: 'error',
        message: 'Resume not found'
      });
    }

    const resume = resumes[resumeIndex];

    // Check permissions (only owner can update)
    if (resume.uploadedBy.id !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied. You can only update your own resume.'
      });
    }

    // Parse skills if provided
    let skillsArray = resume.skills;
    if (req.body.skills) {
      if (typeof req.body.skills === 'string') {
        skillsArray = req.body.skills.split(',').map(skill => skill.trim());
      } else if (Array.isArray(req.body.skills)) {
        skillsArray = req.body.skills;
      }
    }

    // Update resume (preserve file-related fields)
    const updatedResume = {
      ...resume,
      ...req.body,
      id: resume.id,
      fileName: resume.fileName,
      filePath: resume.filePath,
      fileSize: resume.fileSize,
      mimeType: resume.mimeType,
      uploadedBy: resume.uploadedBy,
      viewCount: resume.viewCount,
      downloadCount: resume.downloadCount,
      createdAt: resume.createdAt,
      updatedAt: new Date().toISOString(),
      skills: skillsArray
    };

    resumes[resumeIndex] = updatedResume;
    await writeResumes(resumes);

    res.json({
      status: 'success',
      message: 'Resume updated successfully',
      data: {
        resume: updatedResume
      }
    });

  } catch (error) {
    console.error('Update resume error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

// @route   PUT /api/resumes/:id/visibility
// @desc    Toggle resume visibility
// @access  Private (Author only)
router.put('/:id/visibility', auth, async (req, res) => {
  try {
    const { isPublic } = req.body;

    if (typeof isPublic !== 'boolean') {
      return res.status(400).json({
        status: 'error',
        message: 'isPublic field must be a boolean'
      });
    }

    const resumes = await readResumes();
    const resumeIndex = resumes.findIndex(r => r.id === req.params.id);

    if (resumeIndex === -1) {
      return res.status(404).json({
        status: 'error',
        message: 'Resume not found'
      });
    }

    const resume = resumes[resumeIndex];

    // Check permissions
    if (resume.uploadedBy.id !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied. You can only update your own resume.'
      });
    }

    // Update visibility
    resumes[resumeIndex].isPublic = isPublic;
    resumes[resumeIndex].updatedAt = new Date().toISOString();

    await writeResumes(resumes);

    res.json({
      status: 'success',
      message: `Resume is now ${isPublic ? 'public' : 'private'}`,
      data: {
        resume: resumes[resumeIndex]
      }
    });

  } catch (error) {
    console.error('Update resume visibility error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

// @route   DELETE /api/resumes/:id
// @desc    Delete resume
// @access  Private (Author only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const resumes = await readResumes();
    const resumeIndex = resumes.findIndex(r => r.id === req.params.id);

    if (resumeIndex === -1) {
      return res.status(404).json({
        status: 'error',
        message: 'Resume not found'
      });
    }

    const resume = resumes[resumeIndex];

    // Check permissions (only owner can delete)
    if (resume.uploadedBy.id !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied. You can only delete your own resume.'
      });
    }

    // Delete file from filesystem
    try {
      const filePath = path.join(__dirname, '../..', resume.filePath);
      await fs.unlink(filePath);
    } catch (error) {
      console.warn('Could not delete file from filesystem:', error.message);
    }

    // Remove from database
    resumes.splice(resumeIndex, 1);
    await writeResumes(resumes);

    res.json({
      status: 'success',
      message: 'Resume deleted successfully'
    });

  } catch (error) {
    console.error('Delete resume error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/resumes/my/list
// @desc    Get current user's resumes
// @access  Private (Students only)
router.get('/my/list', auth, authorize('student'), async (req, res) => {
  try {
    const resumes = await readResumes();
    
    // Filter user's own resumes
    const userResumes = resumes.filter(resume => 
      resume.uploadedBy.id === req.user.id
    );

    // Sort by creation date (newest first)
    userResumes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({
      status: 'success',
      data: {
        resumes: userResumes,
        total: userResumes.length
      }
    });

  } catch (error) {
    console.error('Get my resumes error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

module.exports = router;
