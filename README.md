# Google Sheets DB Server

This project is a Node.js server that connects to Google Sheets to manage room and user information. It provides a RESTful API for interacting with the data stored in Google Sheets.

## Project Structure

```
google-sheets-db-server
├── server
│   └── server.js          # Entry point of the Node.js server
├── src
│   ├── routes
│   │   └── api.js        # API routes for user and room operations
│   ├── controllers
│   │   ├── roomsController.js  # Handles room-related operations
│   │   └── usersController.js  # Handles user-related operations
│   ├── services
│   │   └── sheetsService.js     # Manages interactions with Google Sheets
│   ├── config
│   │   └── index.js             # Configuration settings for the application
│   └── middleware
│       └── errorHandler.js       # Middleware for error handling
├── package.json                  # npm configuration file
├── .env.example                  # Template for environment variables
└── README.md                     # Project documentation
```

## Setup Instructions

1. **Clone the repository:**
   ```
   git clone <repository-url>
   cd google-sheets-db-server
   ```

2. **Install dependencies:**
   ```
   npm install
   ```

3. **Set up environment variables:**
   - Copy `.env.example` to `.env` and fill in the required values, including your Google Sheets API credentials.

4. **Run the server:**
   ```
   node server/server.js
   ```

## API Endpoints

### Users

- **GET /api/users**: Retrieve all users.
- **POST /api/users**: Add a new user.
- **PUT /api/users/:id**: Update user information.
- **DELETE /api/users/:id**: Remove a user.

### Rooms

- **GET /api/rooms**: Retrieve all rooms.
- **POST /api/rooms**: Add a new room.
- **PUT /api/rooms/:id**: Update room information.
- **DELETE /api/rooms/:id**: Remove a room.

## License

This project is licensed under the MIT License.