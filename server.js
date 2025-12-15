const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors()); // מאפשר קריאות מה-client המקומי

// serve API routes (אם יש לכם router ב-src/routes/api.js)
const apiRouter = require('./src/routes/api');
app.use('/api', apiRouter);

// serve client סטטי (עמודים שתחת google-sheets-db-client/src)
const clientPath = path.join(__dirname, 'google-sheets-db-client', 'src');
app.use(express.static(clientPath));

// כל בקשה לא-API תחזיר index (אופציונלי)
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) return res.status(404).end();
  res.sendFile(path.join(clientPath, 'pages', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log("Server running"));
