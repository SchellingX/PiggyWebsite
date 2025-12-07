# Changelog

## [Unreleased] - 2025-12-07

### Added
- **Multi-Session AI Chat**: Each conversation is now saved as an independent session. Users can:
  - View all past conversations in a sidebar panel
  - Switch between different chat sessions
  - Start new conversations with the "新对话" button
  - Delete individual sessions or clear all history
- **Session Auto-Titles**: Each session automatically generates a title from the first message
- **Chat History Sidebar**: Added collapsible sidebar in AI modal showing all conversation sessions
- **Chat History API (v2)**: New multi-session backend endpoints:
  - `GET /api/chat/:userId` - Get all sessions for a user
  - `GET /api/chat/:userId/:sessionId` - Get specific session
  - `POST /api/chat/:userId` - Create/update session with `sessionId` parameter
  - `POST /api/chat/:userId` - Create/update session with `sessionId` parameter
  - `DELETE /api/chat/:userId?sessionId=X` - Delete specific or all sessions
- **Photo Description Editing**: Users can now edit the description (caption) of photos after they are uploaded. Click the "Edit" icon in the photo detail view to modify.

### Fixed
- **Gallery Interactions**: Ensured Like, Favorite, and Comment features are robustly handled in the frontend context.
- **Backend API**: Added `PUT /api/photos/:id` to support photo updates.
- **Modal Flickering**: Fixed animation flickering issues in all modals by:
  - Adding proper `scale-in`, `fade-in`, `fade-in-up` keyframes to Tailwind config
  - Using `forwards` animation fill mode to prevent state changes
  - Adding unique `key` prop to modal components
- **AI Chat Continuation**: Fixed async state bug where consecutive messages weren't using updated chat history by using `useRef` to track current state

### Changed
- **AI Modal Width**: Expanded modal width to `max-w-4xl` to accommodate history sidebar
- **Chat Input**: Converted to controlled component for better state management
- **Auto-Scroll**: Chat area now auto-scrolls to newest message

### Technical
- Updated `ChatSession` type to include `title` field
- Added `UserChatData` interface for multi-session storage
- Refactored `server.js` chat endpoints for session-based storage structure


---

## [Previous] - 2025-12-06

### Added
- **Guest Access**: Visitors can now access the site without a password using the "我是猪迷" (Guest) button.
- **Simplified Family Login**: Family members (daddy, mommy, nanny) can login with just their username and no password.

### Changed
- **Admin Credentials**: Admin username is now `admin` with password `123456`.
- **Assets**: Updated image references to match the current file system state (using `background-default.jpg` as fallback for missing slides).
- **Asset Cleanup**: Removed references to deleted assets (`slide1.jpg`, `slide2.jpg`, `slide3.jpg`, `background.jpg`) and mapped them to `background-default.jpg`.

### Fixed
- **Login Logic**: Fixed authentication logic to support empty passwords for specific users.
- **Admin Access**: Resolved issue where Admin account name was not correctly updated to `admin`.
- **Guest Button**: Fixed "Guest" button not triggering the correct login flow.
- **Asset Mapping**: Correctly mapped new asset filenames to the application constants.
- **Background Images**: Fixed background images not loading on Main, Blog, and Gallery pages by implementing dynamic background switching and correcting filenames.
- **UI Enhancements**: Removed background overlays on all pages to ensure the background image is clearly visible, while maintaining component shadows for readability.
- **Component Transparency**: Adjusted transparency of Blog and Gallery components to ensure the background image is visible through the content containers.
- **UI Colors & Typography**: Updated Home page app icons to theme yellow for better contrast. Added brand tagline to Navbar and updated footer text color.
- **Content Updates**: Removed footer copyright line. Rewrote "Piggy Admin Guide" with a friendlier tone and simplified technical instructions for Gallery mounting.
- **Backend**: Implemented Gemini AI support (`/api/ai`) and enabled API Key configuration via Docker environment variables.
- **Optimization**: Removed deprecated API endpoints and cleaned up unused UI code.
