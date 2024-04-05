const { User } = require('../../models');
const express = require('express');
const router = require('express').Router();
const passport = require('passport');

const registerRoute = require('./registerRoute');

router.post('/register', registerRoute.registerUser);


router.post('/', async (req, res) => {
  try {

    const existingUser = await User.findOne({ where: { email: req.body.email } });


    if (existingUser) {
      return res.status(401).render('error401', {
        message: 'Email already exists, please use a different email'
      });
    }
    const userData = await User.create(req.body);

    req.session.save(() => {
      req.session.user_id = userData.id;
      req.session.logged_in = true;
      res.redirect('/');
    });
  } catch (err) {
    res.status(400).json(err);
  }
});

router.post('/login', async (req, res) => {
  try {
    console.log(req.body);
    const userData = await User.findOne({ where: { email: req.body.email } });

    if (!userData || !(await userData.checkPassword(req.body.password))) {
      return res.status(401).render('error401', {
        message: 'Incorrect email or password, please try again'
      });
    }

    req.session.save(() => {
      req.session.user_id = userData.id;
      req.session.logged_in = true;
      res.redirect('/');
    });
  } catch (err) {
    res.status(400).json(err);
  }
});

router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to log out' });
    }
    res.clearCookie('connect.sid');
    res.status(204).json({ message: 'Logged out successfully' });
  });
});




module.exports = router;