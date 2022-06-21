const express = require('express');
require('dotenv').config({ path: './local.env' });
const mongoose = require('mongoose');
const cors = require('cors');
const cloudinary = require('cloudinary');
const cookieParser = require('cookie-parser');
const AppError = require('./utils/appError');
const errorController = require('./controllers/errorController');
const Team = require('./models/teamModel');
const routesFactory = require('./routes/routesFactory');
const authRoutes = require('./routes/authRoutes');
const Player = require('./models/playerModel');
const League = require('./models/leagueModel');
const Season = require('./models/seasonModel');
const seasonGenerator = require('./routes/seasonsGenerator')

const app = express();

cloudinary.config({
  cloud_name: process.env.cloud_name,
  api_key: process.env.cloud_api_key,
  api_secret: process.env.cloud_api_secret,
});

const PORT = process.env.PORT;

process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log('UNHANDLED REJECTION. Shutting down...');
  server.close(() => process.exit(1));
});

const db = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);
mongoose.connect(
  db,
  () => {
    console.log('Connected');
  },
  (err) => console.log(err.message)
);

app.use(cors({ credentials: true, origin: process.env.FRONTEND_PORT }));
app.use(express.json());
app.use(cookieParser());

app.use('/api/v1/users', authRoutes);
app.use('/api/v1/teams', routesFactory(Team));
app.use('/api/v1/players', routesFactory(Player));
app.use('/api/v1/leagues', routesFactory(League));
app.use('/api/v1/seasons', routesFactory(Season));
app.use('/api/v1/seasons/generator', (seasonGenerator))

app.all('*', (req, res, next) => {
  next(new AppError(`Route ${req.originalUrl} is not defined!`, 404));
});

app.use(errorController);

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
