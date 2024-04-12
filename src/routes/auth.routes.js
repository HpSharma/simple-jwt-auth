const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const path = require('path');

const User = require('../models/user');
const cache = require('../../cache');
const { getToken, decodeToken } = require('../../jwt');

const VIEW_PATH = path.join(__dirname, '..', 'view');

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

router.get('/login', (req, res) => {
  if (req.session.user) {
    res.redirect('/');
  }
  res.sendFile(VIEW_PATH + '/login.html');
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!isValidEmail(email)) {
      throw { message: 'Must be a valid email address!' }
    }
    let user;
    if (cache.has('users')) {
      let users = cache.get('users');
      users.forEach(item => {
        if (item.email === email) {
          user = item;
        }
      });
    }
    if (!user) {
      user = await User.findOne({ email });
      let users = cache.get('users') || [];
      users.push({ firstName: user.firstName, lastName: user.lastName, email: user.email, password: user.password });
      cache.set('users', users);
    }
    if (!user) {
      return res.status(400).send('Invalid Credentials');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).send('Invalid Credentials');
    }

    req.session.user = user;
    res.cookie('token', getToken(user), { httpOnly: true });
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

router.post('/logout', async (req, res) => {
  req.session.destroy();
  res.clearCookie('token');
  res.redirect('/login');
});

module.exports = router;