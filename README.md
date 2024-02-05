# Video Sharing Platform API

## Features

### User Management

- **Registration**: New users can create an account to access additional features.
- **Authentication**: Secure login process to manage user sessions and protect private content.
- **Profile Management**: Users can update their profiles and manage content.

### Video Management

- **Video Upload**: Registered users have the ability to upload videos with attributes such as title, description, and credits.
- **Public and Private Videos**: Users can set videos as public or private. Public videos are accessible by all, while private videos are restricted to registered users.
- **Video Browsing**: An endpoint to list videos, filterable by various criteria like publication date, popularity, etc.

### Interactivity

- **Comments**: Users can comment on videos. Comments support threaded replies, similar to a Reddit-style hierarchy.
- **Likes**: Users can like videos, with a like count available for each video to indicate popularity.

### Categories

- **Categorization**: Videos can be associated with categories, allowing for a more organized browsing experience and easier discoverability.

### Analytics

- **View History**: The platform tracks users' view history for personalized recommendations and analytics.

## Tools and Technologies

This API is built using the following stack:

- **Node.js**: A JavaScript runtime built on Chrome's V8 JavaScript engine.
- **TypeScript**: A typed superset of JavaScript that compiles to plain JavaScript.
- **Prisma**: Next-generation ORM for Node.js and TypeScript, providing a robust framework to model and manage data in the app.
- **SQLite**: A self-contained, high-reliability, embedded, full-featured, public-domain, SQL database engine.

Security, performance, and code quality are top priorities for this project. It is architected to both scale with growing usage and remain maintainable through clear coding practices and documentation standards.

## API Documentation

Comprehensive API documentation is provided via Swagger and is accessible at `/api-docs` endpoint when running the application. This interactive documentation allows for easy testing and exploration of the API's capabilities.
