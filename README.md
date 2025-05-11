
# SkillShare Sync Connect

A full-stack application for connecting learners and teachers to share skills.

## Project Structure

This project is divided into two main parts:

- **frontend**: React-based user interface
- **backend**: Express.js API with MongoDB database

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- MongoDB (local or Atlas)

### Backend Setup

1. Navigate to the backend folder:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the backend directory with the following contents:
   ```
   MONGO_URI=mongodb://localhost:27017/skillshare-sync
   PORT=5000
   JWT_SECRET=your_jwt_secret_here
   JWT_EXPIRE=30d
   ```

4. Start the server:
   ```
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend folder:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login a user
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:userId` - Get user by ID
- `POST /api/users` - Create user
- `PUT /api/users/:userId` - Update user
- `DELETE /api/users/:userId` - Delete user

### Sessions
- `GET /api/sessions` - Get all sessions for user
- `GET /api/sessions/:sessionId` - Get session by ID
- `POST /api/sessions` - Create session request
- `PUT /api/sessions/:sessionId/respond` - Accept/decline session request

### Connections
- `GET /api/connections` - Get user connections
- `GET /api/connections/pending` - Get pending connection requests
- `POST /api/connections` - Send connection request
- `PUT /api/connections/:connectionId/respond` - Accept/decline connection request
- `DELETE /api/connections/:connectionId` - Remove connection

### Notifications
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/:notificationId/read` - Mark notification as read
- `PUT /api/notifications/read-all` - Mark all notifications as read
- `POST /api/notifications` - Create notification

### Messages
- `GET /api/messages/conversations` - Get user conversations
- `GET /api/messages/:partnerId` - Get messages with a specific user
- `POST /api/messages` - Send a message
- `GET /api/messages/unread-count` - Get unread message count

### Skills
- `GET /api/skills/teaching/:userId` - Get teaching skills for a user
- `GET /api/skills/learning/:userId` - Get learning skills for a user
- `POST /api/skills/teaching` - Add teaching skill
- `POST /api/skills/learning` - Add learning skill
- `DELETE /api/skills/teaching/:skillId` - Delete teaching skill
- `DELETE /api/skills/learning/:skillId` - Delete learning skill

## License

This project is open source, under the MIT license.
