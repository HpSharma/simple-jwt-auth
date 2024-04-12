const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const path = require('path');
const nodeCache = require('node-cache');

const User = require('../models/user');
const { getToken } = require('../../jwt');

const VIEW_PATH = path.join(__dirname, '..', 'view');

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

router.get('/register', (req, res) => {
  if (req.session.user) {
    res.redirect('/');
  }
  res.sendFile(VIEW_PATH + '/registeration.html');
});

router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    if (password.length < 6) {
      throw { message: 'Password must be 6 Digit long!' }
    }
    if (!isValidEmail(email)) {
      throw { message: 'Must be a valid email address!' }
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ firstName, lastName, email, password: hashedPassword });
    await newUser.save();

    req.session.user = newUser;
    res.cookie('token', getToken(newUser), { httpOnly: true });
    res.redirect('/');
  } catch (err) {
    console.error(err.message);
    if (err.errors) {
      const errors = Object.values(err.errors).map(val => val.message);
      res.status(500).send(`Error creating the user: ${errors.join(', ')}`);
    }
    res.status(500).send(`Error creating the user: ${err.message}`);
  }
});

module.exports = router;