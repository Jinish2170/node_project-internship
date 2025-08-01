# CampusConnect

A comprehensive full-stack web application designed for college students and faculty to access centralized academic resources, notices, events, and file repositories. Built with React.js frontend and Node.js + Express backend, using JSON files for data storage.

## 🚀 Features

### For Students
- **📋 Notice Board**: View important announcements and updates from faculty and administration
- **📅 Event Management**: Browse campus events, view details, and register for participation
- **📚 Study Materials**: Access and download study materials, notes, assignments, and academic resources
- **📄 Resume Vault**: Upload resumes and browse other students' public resumes for networking
- **👤 Profile Management**: Update personal and academic information
- **🌙 Dark Mode**: Toggle between light and dark themes for comfortable viewing

### For Faculty
- **📝 Content Management**: Create, edit, and delete notices and events
- **📤 File Upload**: Upload study materials and academic resources for students
- **📊 Analytics**: View download statistics and engagement metrics
- **👥 Student Access**: Access student resumes for academic and placement purposes
- **🎯 Targeted Communication**: Send notices to specific departments or years

### For Administrators
- **🔧 System Management**: Full access to all content and user management
- **📈 Dashboard Analytics**: Comprehensive overview of platform usage and statistics
- **👨‍💼 User Administration**: Manage user accounts and permissions
- **🔍 Content Moderation**: Monitor and moderate all uploaded content

## 🛠️ Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **JSON Files** - Data storage (no external database required)
- **JWT** - Authentication and authorization
- **bcryptjs** - Password hashing
- **multer** - File upload handling
- **Joi** - Data validation
- **CORS** - Cross-origin resource sharing
- **helmet** - Security middleware

### Frontend
- **React 18** - Frontend framework
- **React Router DOM** - Client-side routing
- **React Query** - Server state management
- **Axios** - HTTP client
- **Tailwind CSS** - Utility-first CSS framework
- **Headless UI** - Unstyled, accessible UI components
- **Heroicons** - Beautiful SVG icons
- **React Hot Toast** - Toast notifications
- **date-fns** - Date manipulation library

## 📁 Project Structure

```
node_project-internship/
├── server/
│   ├── data/
│   │   ├── users.json              # User accounts and profiles
│   │   ├── notices.json            # Notice board posts
│   │   ├── events.json             # Campus events
│   │   ├── materials.json          # Study materials metadata
│   │   └── resumes.json            # Resume metadata
│   ├── middleware/
│   │   ├── auth.js                 # JWT authentication middleware
│   │   ├── errorHandler.js         # Global error handling
│   │   ├── upload.js               # File upload configuration
│   │   └── validation.js           # Request validation schemas
│   ├── routes/
│   │   ├── auth.js                 # Authentication routes
│   │   ├── notices.js              # Notice management routes
│   │   ├── events.js               # Event management routes
│   │   ├── materials.js            # Study materials routes
│   │   └── resumes.js              # Resume management routes
│   ├── uploads/                    # File storage directory
│   ├── app.js                      # Express application setup
│   ├── server.js                   # Server entry point
│   └── package.json                # Backend dependencies
├── client/
│   ├── public/
│   │   ├── index.html              # HTML template
│   │   └── manifest.json           # PWA manifest
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── Button.js       # Reusable button component
│   │   │   │   ├── Card.js         # Card container component
│   │   │   │   └── LoadingSpinner.js # Loading indicator
│   │   │   └── layout/
│   │   │       ├── Navbar.js       # Top navigation bar
│   │   │       └── Sidebar.js      # Side navigation menu
│   │   ├── contexts/
│   │   │   ├── AuthContext.js      # Authentication state management
│   │   │   └── ThemeContext.js     # Dark mode state management
│   │   ├── pages/
│   │   │   ├── Login.js            # User login page
│   │   │   ├── Register.js         # User registration page
│   │   │   ├── Dashboard.js        # Main dashboard
│   │   │   ├── Notices.js          # Notice board listing
│   │   │   ├── NoticeDetail.js     # Individual notice view
│   │   │   ├── Events.js           # Events listing
│   │   │   ├── EventDetail.js      # Individual event view
│   │   │   ├── Materials.js        # Study materials listing
│   │   │   ├── Resumes.js          # Resume vault
│   │   │   ├── Profile.js          # User profile management
│   │   │   └── NotFound.js         # 404 error page
│   │   ├── services/
│   │   │   └── api.js              # API service layer
│   │   ├── App.js                  # Main React application
│   │   ├── index.js                # React entry point
│   │   └── index.css               # Global styles
│   ├── tailwind.config.js          # Tailwind CSS configuration
│   └── package.json                # Frontend dependencies
├── package.json                    # Root package configuration
└── README.md                       # Project documentation
```

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v14 or higher)
- **npm** (v6 or higher)
- **Git** (for version control)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd node_project-internship
   ```

2. **Install dependencies for both frontend and backend**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   
   # JWT Configuration
   JWT_SECRET=your-super-secure-jwt-secret-key-here
   JWT_EXPIRE=7d
   
   # File Upload Configuration
   MAX_FILE_SIZE=10485760
   UPLOAD_PATH=./server/uploads
   ```

4. **Start the development servers**
   ```bash
   npm run dev
   ```
   
   This will start both the backend server (port 5000) and frontend development server (port 3000) concurrently.

### Individual Server Commands

**Backend only:**
```bash
npm run server
```

**Frontend only:**
```bash
npm run client
```

**Production build:**
```bash
npm run build
```

## 🔧 Configuration

### Backend Configuration

The backend server can be configured through environment variables:

- `PORT`: Server port (default: 5000)
- `NODE_ENV`: Environment mode (development/production)
- `JWT_SECRET`: Secret key for JWT token signing
- `JWT_EXPIRE`: JWT token expiration time
- `MAX_FILE_SIZE`: Maximum file upload size in bytes
- `UPLOAD_PATH`: Directory for file uploads

### Frontend Configuration

The React application automatically connects to the backend API. For production deployment, update the API base URL in `client/src/services/api.js`.

## 📡 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/api/auth/register` | Register new user | Public |
| POST | `/api/auth/login` | User login | Public |
| POST | `/api/auth/logout` | User logout | Private |
| GET | `/api/auth/profile` | Get user profile | Private |
| PUT | `/api/auth/profile` | Update user profile | Private |
| PUT | `/api/auth/change-password` | Change password | Private |

### Notice Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/api/notices` | Get all notices | Private |
| GET | `/api/notices/:id` | Get notice by ID | Private |
| POST | `/api/notices` | Create new notice | Faculty/Admin |
| PUT | `/api/notices/:id` | Update notice | Faculty/Admin |
| DELETE | `/api/notices/:id` | Delete notice | Faculty/Admin |

### Event Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/api/events` | Get all events | Private |
| GET | `/api/events/:id` | Get event by ID | Private |
| POST | `/api/events` | Create new event | Faculty/Admin |
| PUT | `/api/events/:id` | Update event | Faculty/Admin |
| DELETE | `/api/events/:id` | Delete event | Faculty/Admin |
| POST | `/api/events/:id/register` | Register for event | Private |
| DELETE | `/api/events/:id/register` | Unregister from event | Private |

### Material Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/api/materials` | Get all materials | Private |
| GET | `/api/materials/:id` | Get material by ID | Private |
| POST | `/api/materials/upload` | Upload new material | Faculty/Admin |
| GET | `/api/materials/:id/download` | Download material | Private |
| DELETE | `/api/materials/:id` | Delete material | Faculty/Admin |

### Resume Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/api/resumes` | Get all resumes | Private |
| GET | `/api/resumes/:id` | Get resume by ID | Private |
| POST | `/api/resumes/upload` | Upload resume | Student |
| GET | `/api/resumes/:id/download` | Download resume | Faculty/Admin |
| PUT | `/api/resumes/:id` | Update resume | Owner |
| DELETE | `/api/resumes/:id` | Delete resume | Owner/Admin |

## 🔐 Authentication & Authorization

### JWT Token Authentication
- Tokens are stored in localStorage on the client side
- Tokens expire after 7 days (configurable)
- Automatic token refresh on API calls
- Secure logout clears all client-side data

### Role-Based Access Control
- **Student**: Can view content, upload resumes, register for events
- **Faculty**: Can create notices/events, upload materials, access all resumes
- **Admin**: Full system access and user management capabilities

### Security Features
- Password hashing with bcrypt
- JWT token-based authentication
- CORS protection
- Helmet security headers
- File upload validation
- Input sanitization and validation

## 📦 File Upload System

### Supported File Types
- **Study Materials**: PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX
- **Resumes**: PDF, DOC, DOCX
- **General Documents**: TXT, RTF

### Upload Limits
- Maximum file size: 10MB (configurable)
- Automatic file type validation
- Secure file storage with unique naming
- Metadata tracking and download statistics

## 🎨 UI/UX Features

### Responsive Design
- Mobile-first approach
- Adaptive layouts for all screen sizes
- Touch-friendly interface elements
- Optimized performance on all devices

### Dark Mode
- System preference detection
- Manual toggle option
- Persistent user preference
- Smooth transitions between themes

### Accessibility
- ARIA labels and roles
- Keyboard navigation support
- High contrast color schemes
- Screen reader compatibility

## 🔍 Search & Filtering

### Advanced Search Capabilities
- **Notices**: Search by title, content, department, urgency
- **Events**: Filter by date, category, registration status
- **Materials**: Filter by subject, semester, department, type
- **Resumes**: Search by skills, department, experience level

### Pagination
- Efficient data loading with pagination
- Configurable page sizes
- Smooth navigation between pages
- Total count and current position indicators

## 📊 Analytics & Statistics

### Dashboard Metrics
- Total users, notices, events, materials
- Recent activity overview
- Quick action buttons
- Role-specific statistics

### Usage Analytics
- Download tracking for materials and resumes
- Event registration statistics
- User engagement metrics
- Content popularity insights

## 🛡️ Error Handling

### Client-Side Error Handling
- Global error boundaries
- Toast notifications for user feedback
- Graceful degradation for failed API calls
- Loading states for all async operations

### Server-Side Error Handling
- Centralized error middleware
- Structured error responses
- Logging for debugging
- Validation error details

## 🚀 Deployment

### Production Build
```bash
npm run build
```

### Environment Setup
1. Set `NODE_ENV=production`
2. Configure production JWT secret
3. Set up file upload directory
4. Configure CORS for production domain

### Docker Deployment (Optional)
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 5000
CMD ["npm", "start"]
```

## 🤝 Contributing

### Development Guidelines
1. Follow the established code structure
2. Use meaningful commit messages
3. Test all functionality before submitting
4. Update documentation for new features
5. Follow React and Node.js best practices

### Code Style
- ES6+ JavaScript features
- Functional components with hooks
- Consistent naming conventions
- Comprehensive error handling
- Responsive design principles

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Troubleshooting

**Common Issues:**

1. **Server won't start**
   - Check if port 5000 is available
   - Verify all dependencies are installed
   - Check environment variables

2. **File uploads failing**
   - Verify upload directory permissions
   - Check file size limits
   - Ensure correct file types

3. **Authentication issues**
   - Clear localStorage and cookies
   - Check JWT secret configuration
   - Verify token expiration settings

**Getting Help:**
- Check the console for error messages
- Review the API documentation
- Ensure all environment variables are set
- Verify file permissions for uploads directory

### Development Tips
- Use browser developer tools for debugging
- Check network tab for API call issues
- Monitor console for React warnings
- Use React Developer Tools extension

## 🔮 Future Enhancements

### Planned Features
- **Real-time Notifications**: WebSocket integration for live updates
- **Email Integration**: Automated email notifications for important notices
- **Mobile App**: React Native mobile application
- **Advanced Analytics**: Detailed usage reports and insights
- **Chat System**: Direct messaging between users
- **Calendar Integration**: Event calendar with reminders
- **File Versioning**: Track material updates and versions
- **Bulk Operations**: Mass upload and management tools

### Technical Improvements
- **Database Migration**: Option to migrate from JSON to MongoDB/PostgreSQL
- **Caching Layer**: Redis integration for improved performance
- **API Rate Limiting**: Request throttling and abuse prevention
- **Advanced Search**: Elasticsearch integration for complex queries
- **File Compression**: Automatic image and document optimization
- **Backup System**: Automated data backup and recovery

---

## 📞 Contact

For questions, suggestions, or issues, please contact the development team or create an issue in the repository.

**Happy Learning with CampusConnect! 🎓**
