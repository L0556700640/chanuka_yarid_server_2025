const express = require('express');
const bodyParser = require('body-parser');
const { google } = require('googleapis');
const apiRoutes = require('../src/routes/api');
const errorHandler = require('../src/middleware/errorHandler');
const config = require('../src/config');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Google Sheets API setup
const sheets = google.sheets({ version: 'v4', auth: config.GOOGLE_SHEETS_API_KEY });

// Routes
app.use('/api', apiRoutes);

// Error handling middleware
app.use(errorHandler);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});