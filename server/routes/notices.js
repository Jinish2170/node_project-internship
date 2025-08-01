const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const { auth, authorize } = require('../middleware/auth');
const { validateNotice } = require('../middleware/validation');

const router = express.Router();
const noticesPath = path.join(__dirname, '../data/notices.json');

// Helper function to read notices
const readNotices = async () => {
  try {
    const data = await fs.readFile(noticesPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

// Helper function to write notices
const writeNotices = async (notices) => {
  await fs.writeFile(noticesPath, JSON.stringify(notices, null, 2));
};

// @route   GET /api/notices
// @desc    Get all notices
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const notices = await readNotices();
    
    // Filter notices based on user role and target audience
    let filteredNotices = notices.filter(notice => {
      // Check if notice is expired
      if (notice.expiryDate && new Date(notice.expiryDate) < new Date()) {
        return false;
      }
      
      // Check target audience
      if (notice.targetAudience === 'all') return true;
      if (notice.targetAudience === req.user.role) return true;
      if (notice.targetAudience === 'students' && req.user.role === 'student') return true;
      if (notice.targetAudience === 'faculty' && req.user.role === 'faculty') return true;
      
      return false;
    });

    // Apply query filters
    const { category, department, search, limit = 50, page = 1 } = req.query;
    
    if (category) {
      filteredNotices = filteredNotices.filter(notice => notice.category === category);
    }
    
    if (department) {
      filteredNotices = filteredNotices.filter(notice => 
        !notice.department || notice.department === department
      );
    }
    
    if (search) {
      const searchTerm = search.toLowerCase();
      filteredNotices = filteredNotices.filter(notice =>
        notice.title.toLowerCase().includes(searchTerm) ||
        notice.content.toLowerCase().includes(searchTerm)
      );
    }

    // Sort by creation date (newest first)
    filteredNotices.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedNotices = filteredNotices.slice(startIndex, endIndex);

    res.json({
      status: 'success',
      data: {
        notices: paginatedNotices,
        pagination: {
          total: filteredNotices.length,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(filteredNotices.length / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get notices error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/notices/:id
// @desc    Get single notice
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const notices = await readNotices();
    const notice = notices.find(n => n.id === req.params.id);

    if (!notice) {
      return res.status(404).json({
        status: 'error',
        message: 'Notice not found'
      });
    }

    // Check if user can access this notice
    const canAccess = 
      notice.targetAudience === 'all' ||
      notice.targetAudience === req.user.role ||
      (notice.targetAudience === 'students' && req.user.role === 'student') ||
      (notice.targetAudience === 'faculty' && req.user.role === 'faculty') ||
      req.user.role === 'admin';

    if (!canAccess) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied to this notice'
      });
    }

    res.json({
      status: 'success',
      data: {
        notice
      }
    });

  } catch (error) {
    console.error('Get notice error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

// @route   POST /api/notices
// @desc    Create new notice
// @access  Private (Faculty/Admin only)
router.post('/', auth, authorize('faculty', 'admin'), validateNotice, async (req, res) => {
  try {
    const { title, content, category, targetAudience, expiryDate, department } = req.body;

    const notices = await readNotices();

    const newNotice = {
      id: Date.now().toString(),
      title,
      content,
      category,
      targetAudience: targetAudience || 'all',
      department,
      expiryDate,
      author: {
        id: req.user.id,
        name: req.user.name,
        role: req.user.role
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true
    };

    notices.push(newNotice);
    await writeNotices(notices);

    res.status(201).json({
      status: 'success',
      message: 'Notice created successfully',
      data: {
        notice: newNotice
      }
    });

  } catch (error) {
    console.error('Create notice error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

// @route   PUT /api/notices/:id
// @desc    Update notice
// @access  Private (Author/Admin only)
router.put('/:id', auth, validateNotice, async (req, res) => {
  try {
    const notices = await readNotices();
    const noticeIndex = notices.findIndex(n => n.id === req.params.id);

    if (noticeIndex === -1) {
      return res.status(404).json({
        status: 'error',
        message: 'Notice not found'
      });
    }

    const notice = notices[noticeIndex];

    // Check if user can update this notice
    const canUpdate = 
      notice.author.id === req.user.id || 
      req.user.role === 'admin';

    if (!canUpdate) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied. You can only update your own notices.'
      });
    }

    // Update notice
    const updatedNotice = {
      ...notice,
      ...req.body,
      id: notice.id,
      author: notice.author,
      createdAt: notice.createdAt,
      updatedAt: new Date().toISOString()
    };

    notices[noticeIndex] = updatedNotice;
    await writeNotices(notices);

    res.json({
      status: 'success',
      message: 'Notice updated successfully',
      data: {
        notice: updatedNotice
      }
    });

  } catch (error) {
    console.error('Update notice error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

// @route   DELETE /api/notices/:id
// @desc    Delete notice
// @access  Private (Author/Admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const notices = await readNotices();
    const noticeIndex = notices.findIndex(n => n.id === req.params.id);

    if (noticeIndex === -1) {
      return res.status(404).json({
        status: 'error',
        message: 'Notice not found'
      });
    }

    const notice = notices[noticeIndex];

    // Check if user can delete this notice
    const canDelete = 
      notice.author.id === req.user.id || 
      req.user.role === 'admin';

    if (!canDelete) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied. You can only delete your own notices.'
      });
    }

    notices.splice(noticeIndex, 1);
    await writeNotices(notices);

    res.json({
      status: 'success',
      message: 'Notice deleted successfully'
    });

  } catch (error) {
    console.error('Delete notice error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

module.exports = router;
