# Social Network Starter Kit

A modern, feature-rich social network application built with React and Parse Server (Back4App). This project provides a complete foundation for building your own social networking platform.

## Features

### User Management
- **Authentication**: Sign up, login, and password reset functionality
- **User Profiles**: Customizable profiles with avatars and bio information
- **Follow System**: Follow/unfollow other users

### Content
- **Feed**: Personalized feed showing posts from followed users
- **Posts**: Create text posts with optional image attachments
- **Comments**: Comment on posts
- **Likes**: Like posts and comments

### Messaging
- **Real-time Chat**: Direct messaging between users
- **Conversation Management**: Start new conversations and view message history
- **Typing Indicators**: See when someone is typing

### Search
- **User Search**: Find other users by username
- **Content Search**: Search for posts by content

## Database Schema

### User
- `username`: String (unique)
- `email`: String (unique)
- `password`: String (encrypted)
- `avatar`: File (optional)
- `bio`: String (optional)
- `followers`: Relation to User
- `following`: Relation to User

### Post
- `author`: Pointer to User
- `content`: String
- `image`: File (optional)
- `likes`: Number
- `createdAt`: Date

### Comment
- `post`: Pointer to Post
- `author`: Pointer to User
- `content`: String
- `createdAt`: Date

### Conversation
- `participants`: Array of Pointers to User
- `lastMessage`: String
- `updatedAt`: Date

### Message
- `conversation`: Pointer to Conversation
- `sender`: Pointer to User
- `text`: String
- `createdAt`: Date

## Back4App Setup

### Prerequisites
- A Back4App account (https://back4app.com)
- Node.js and npm installed

### Setting Up Your Back4App App
1. Create a new app on Back4App
2. Navigate to "Server Settings" > "Parse Server"
3. Note your Application ID and JavaScript Key
4. Enable Live Query for the Message class to support real-time chat

### Database Configuration
1. In Back4App, go to "Dashboard" > "Database Browser"
2. Create the following classes with the schema described above:
   - User (already exists by default)
   - Post
   - Comment
   - Conversation
   - Message
3. Set up appropriate ACLs for each class

## Getting Started

### Installation
1. Clone the repository:
   ```
   git clone https://github.com/yourusername/social-network-starter.git
   cd social-network-starter
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env.local` file in the root directory with your Back4App credentials:
   ```
   REACT_APP_PARSE_APPLICATION_ID=your_application_id
   REACT_APP_PARSE_JAVASCRIPT_KEY=your_javascript_key
   REACT_APP_PARSE_SERVER_URL=https://parseapi.back4app.com
   REACT_APP_PARSE_LIVE_QUERY_URL=wss://your-app-id.back4app.io
   ```

### Running the Application
1. Start the development server:
   ```
   npm start
   ```

2. Open your browser and navigate to `http://localhost:3000`

## Deployment
1. Build the production version:
   ```
   npm run build
   ```

2. Deploy the contents of the `build` folder to your hosting provider of choice (Netlify, Vercel, GitHub Pages, etc.)

## Customization

### Styling
The project uses Chakra UI for styling. You can customize the theme in `src/theme.js`.

### Adding Features
The modular structure makes it easy to add new features:
1. Create new components in the `components` directory
2. Add new pages in the `pages` directory
3. Update routes in `App.js`

## Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## License
This project is licensed under the MIT License - see the LICENSE file for details.
