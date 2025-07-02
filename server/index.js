const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const dotenv = require('dotenv');
const db = require('./db');
const countryRoutes = require('./routes/country');
const sectorRoutes = require('./routes/sector');
const sourceRoutes = require('./routes/sources');

dotenv.config();

const app = express();
const corsOptions = {
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));

app.use(express.json({limit: '10mb'}));
app.use(express.urlencoded({extended: true, limit: '10mb'}));

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  }),
});

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '');

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (err) {
    console.error('Token verification failed:', err.message);
    return res.status(401).send({message: 'Unauthorized'});
  }
};

app.get('/protected', verifyToken, (req, res) => {
  res.send({message: `Hello ${req.user.email}, this is a protected route.`});
});

app.use('/country', countryRoutes);
app.use('/sector', sectorRoutes);
app.use('/source', sourceRoutes);

app.get('/api/ping', (req, res) => {
  res.json({message: 'API is live!'});
});

const PORT = process.env.PORT || 5050;
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
