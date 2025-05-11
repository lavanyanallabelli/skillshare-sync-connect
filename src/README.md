
# SkillShare Connect Application

## Project Structure

This application is built using React with TypeScript, and integrates with Supabase for backend functionality. Here's an overview of the project structure:

### API Layer
- `src/api/config.ts`: API endpoints configuration
- `src/api/client.ts`: API client for making HTTP requests

### Models
- `src/models/User.ts`: User profile data model
- `src/models/Session.ts`: Learning session data model
- `src/models/Message.ts`: Messaging data model
- `src/models/Notification.ts`: Notification data model

### Services
- `src/services/authService.ts`: Authentication functionality
- `src/services/userService.ts`: User profile management
- `src/services/sessionService.ts`: Session request and management
- `src/services/notificationService.ts`: Notification handling
- `src/services/messageService.ts`: Messaging functionality
- `src/services/connectionService.ts`: User connections/networking
- `src/services/skillService.ts`: Skills catalog and management

### Utilities
- `src/utils/notificationUtils.ts`: Helper functions for notifications
- `src/utils/meetingUtils.ts`: Google Meet integration helpers

### Hooks
- Custom React hooks for various functionalities

### Components
- UI components organized by feature

### Pages
- Top-level page components

## Backend

This application uses Supabase for backend functionality:

- Authentication
- Database tables
- Row-level security policies
- Edge functions for server-side operations
- Real-time subscriptions

## Features

- User authentication (email/password and Google OAuth)
- User profiles with education, experience, and skills
- Teaching and learning skills management
- Session scheduling with Google Meet integration
- Real-time messaging
- Notifications
- User connections/networking

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Run the development server: `npm run dev`
4. Access the application at `http://localhost:5173`

## Database Schema

The application uses the following key tables:
- profiles
- sessions
- messages
- notifications
- teaching_skills
- learning_skills
- user_experiences
- user_education
- connections
- skills_catalog

## API Documentation

See `src/api/config.ts` for a list of available API endpoints.

## Edge Functions

- `create-google-meet-link`: Creates Google Meet links for sessions
- `get_user_email`: SQL function to retrieve user emails securely

## Contributing

1. Create a feature branch
2. Make your changes
3. Submit a pull request

## License

This project is proprietary and confidential.
