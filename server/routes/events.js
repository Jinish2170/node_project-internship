const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const { auth, authorize } = require('../middleware/auth');
const { validateEvent } = require('../middleware/validation');
const { uploadEventImage } = require('../middleware/upload');

const router = express.Router();
const eventsPath = path.join(__dirname, '../data/events.json');

// Helper functions
const readEvents = async () => {
  try {
    const data = await fs.readFile(eventsPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

const writeEvents = async (events) => {
  await fs.writeFile(eventsPath, JSON.stringify(events, null, 2));
};

// @route   GET /api/events
// @desc    Get all events
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const events = await readEvents();
    
    // Apply query filters
    const { category, upcoming, search, limit = 20, page = 1 } = req.query;
    
    let filteredEvents = events;
    
    if (category) {
      filteredEvents = filteredEvents.filter(event => event.category === category);
    }
    
    if (upcoming === 'true') {
      const now = new Date();
      filteredEvents = filteredEvents.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate >= now;
      });
    }
    
    if (search) {
      const searchTerm = search.toLowerCase();
      filteredEvents = filteredEvents.filter(event =>
        event.title.toLowerCase().includes(searchTerm) ||
        event.description.toLowerCase().includes(searchTerm) ||
        event.venue.toLowerCase().includes(searchTerm)
      );
    }

    // Sort by event date (upcoming first)
    filteredEvents.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedEvents = filteredEvents.slice(startIndex, endIndex);

    // Add time remaining for upcoming events
    const eventsWithTimeRemaining = paginatedEvents.map(event => {
      const eventDateTime = new Date(`${event.date}T${event.time}`);
      const now = new Date();
      const timeRemaining = eventDateTime - now;
      
      return {
        ...event,
        timeRemaining: timeRemaining > 0 ? timeRemaining : null,
        isUpcoming: timeRemaining > 0,
        isPast: timeRemaining <= 0
      };
    });

    res.json({
      status: 'success',
      data: {
        events: eventsWithTimeRemaining,
        pagination: {
          total: filteredEvents.length,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(filteredEvents.length / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/events/:id
// @desc    Get single event
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const events = await readEvents();
    const event = events.find(e => e.id === req.params.id);

    if (!event) {
      return res.status(404).json({
        status: 'error',
        message: 'Event not found'
      });
    }

    // Add time calculations
    const eventDateTime = new Date(`${event.date}T${event.time}`);
    const now = new Date();
    const timeRemaining = eventDateTime - now;

    const eventWithTime = {
      ...event,
      timeRemaining: timeRemaining > 0 ? timeRemaining : null,
      isUpcoming: timeRemaining > 0,
      isPast: timeRemaining <= 0
    };

    res.json({
      status: 'success',
      data: {
        event: eventWithTime
      }
    });

  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

// @route   POST /api/events
// @desc    Create new event
// @access  Private (Faculty/Admin only)
router.post('/', auth, authorize('faculty', 'admin'), uploadEventImage.single('image'), validateEvent, async (req, res) => {
  try {
    const { 
      title, 
      description, 
      date, 
      time, 
      venue, 
      category, 
      organizer, 
      maxParticipants, 
      registrationRequired 
    } = req.body;

    const events = await readEvents();

    const newEvent = {
      id: Date.now().toString(),
      title,
      description,
      date,
      time,
      venue,
      category,
      organizer,
      maxParticipants: maxParticipants ? parseInt(maxParticipants) : null,
      registrationRequired: registrationRequired === 'true',
      image: req.file ? `/uploads/events/${req.file.filename}` : null,
      author: {
        id: req.user.id,
        name: req.user.name,
        role: req.user.role
      },
      participants: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    events.push(newEvent);
    await writeEvents(events);

    res.status(201).json({
      status: 'success',
      message: 'Event created successfully',
      data: {
        event: newEvent
      }
    });

  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

// @route   POST /api/events/:id/register
// @desc    Register for event
// @access  Private (Students only)
router.post('/:id/register', auth, authorize('student'), async (req, res) => {
  try {
    const events = await readEvents();
    const eventIndex = events.findIndex(e => e.id === req.params.id);

    if (eventIndex === -1) {
      return res.status(404).json({
        status: 'error',
        message: 'Event not found'
      });
    }

    const event = events[eventIndex];

    // Check if registration is required
    if (!event.registrationRequired) {
      return res.status(400).json({
        status: 'error',
        message: 'This event does not require registration'
      });
    }

    // Check if event is in the future
    const eventDateTime = new Date(`${event.date}T${event.time}`);
    if (eventDateTime <= new Date()) {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot register for past events'
      });
    }

    // Check if user is already registered
    const isAlreadyRegistered = event.participants.some(p => p.userId === req.user.id);
    if (isAlreadyRegistered) {
      return res.status(400).json({
        status: 'error',
        message: 'You are already registered for this event'
      });
    }

    // Check if event is full
    if (event.maxParticipants && event.participants.length >= event.maxParticipants) {
      return res.status(400).json({
        status: 'error',
        message: 'Event is full'
      });
    }

    // Register user
    const participant = {
      userId: req.user.id,
      name: req.user.name,
      email: req.user.email,
      registeredAt: new Date().toISOString()
    };

    events[eventIndex].participants.push(participant);
    events[eventIndex].updatedAt = new Date().toISOString();

    await writeEvents(events);

    res.json({
      status: 'success',
      message: 'Successfully registered for the event',
      data: {
        event: events[eventIndex]
      }
    });

  } catch (error) {
    console.error('Event registration error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

// @route   DELETE /api/events/:id/register
// @desc    Unregister from event
// @access  Private (Students only)
router.delete('/:id/register', auth, authorize('student'), async (req, res) => {
  try {
    const events = await readEvents();
    const eventIndex = events.findIndex(e => e.id === req.params.id);

    if (eventIndex === -1) {
      return res.status(404).json({
        status: 'error',
        message: 'Event not found'
      });
    }

    const event = events[eventIndex];

    // Check if user is registered
    const participantIndex = event.participants.findIndex(p => p.userId === req.user.id);
    if (participantIndex === -1) {
      return res.status(400).json({
        status: 'error',
        message: 'You are not registered for this event'
      });
    }

    // Remove participant
    events[eventIndex].participants.splice(participantIndex, 1);
    events[eventIndex].updatedAt = new Date().toISOString();

    await writeEvents(events);

    res.json({
      status: 'success',
      message: 'Successfully unregistered from the event'
    });

  } catch (error) {
    console.error('Event unregistration error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

// @route   PUT /api/events/:id
// @desc    Update event
// @access  Private (Author/Admin only)
router.put('/:id', auth, uploadEventImage.single('image'), validateEvent, async (req, res) => {
  try {
    const events = await readEvents();
    const eventIndex = events.findIndex(e => e.id === req.params.id);

    if (eventIndex === -1) {
      return res.status(404).json({
        status: 'error',
        message: 'Event not found'
      });
    }

    const event = events[eventIndex];

    // Check permissions
    const canUpdate = 
      event.author.id === req.user.id || 
      req.user.role === 'admin';

    if (!canUpdate) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied. You can only update your own events.'
      });
    }

    // Update event
    const updatedEvent = {
      ...event,
      ...req.body,
      id: event.id,
      author: event.author,
      participants: event.participants,
      createdAt: event.createdAt,
      updatedAt: new Date().toISOString()
    };

    // Update image if provided
    if (req.file) {
      updatedEvent.image = `/uploads/events/${req.file.filename}`;
    }

    // Convert boolean fields
    if (req.body.registrationRequired !== undefined) {
      updatedEvent.registrationRequired = req.body.registrationRequired === 'true';
    }
    if (req.body.maxParticipants !== undefined) {
      updatedEvent.maxParticipants = req.body.maxParticipants ? parseInt(req.body.maxParticipants) : null;
    }

    events[eventIndex] = updatedEvent;
    await writeEvents(events);

    res.json({
      status: 'success',
      message: 'Event updated successfully',
      data: {
        event: updatedEvent
      }
    });

  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

// @route   DELETE /api/events/:id
// @desc    Delete event
// @access  Private (Author/Admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const events = await readEvents();
    const eventIndex = events.findIndex(e => e.id === req.params.id);

    if (eventIndex === -1) {
      return res.status(404).json({
        status: 'error',
        message: 'Event not found'
      });
    }

    const event = events[eventIndex];

    // Check permissions
    const canDelete = 
      event.author.id === req.user.id || 
      req.user.role === 'admin';

    if (!canDelete) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied. You can only delete your own events.'
      });
    }

    events.splice(eventIndex, 1);
    await writeEvents(events);

    res.json({
      status: 'success',
      message: 'Event deleted successfully'
    });

  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

module.exports = router;
