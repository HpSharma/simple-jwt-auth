const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const { config } = require('dotenv');
const path = require('path');

const userRoutes = require('./src/routes/user.routes');
const authRoutes = require('./src/routes/auth.routes');
const { verifyToken } = require('./jwt');

config();
const app = express();
const VIEW_PATH = path.join(__dirname, 'src', 'view');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
  secret: 'Aum@2024',
  resave: false,
  saveUninitialized: false
}));

mongoose.connect(process.env.ATLAS_URI);
const db = mongoose.connection;
db.on("error", error => console.error(error));
db.once("open", () => console.log("Connected With Mongo :)"));

app.get('/', verifyToken, (req, res) => res.sendFile(VIEW_PATH + '/home.html'));
app.use("/", userRoutes);
app.use("/", authRoutes);

app.listen(process.env.PORT, () => console.log("Server has started on Port: ", process.env.PORT));
