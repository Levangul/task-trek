const router = require('express').Router();
const { Task, User } = require('../models');
const withAuth = require('../utils/auth');




router.get('/', withAuth, async (req, res) => {
  try {
    const userData = await User.findByPk(req.session.user_id, {
      attributes: { exclude: ['password'] },
      include: [{ model: Task }],
    });

    const user = userData.get({ plain: true });

    res.render('homepage', {
      ...user,
      logged_in: true
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get('/login', (req, res) => {
 
  if (req.session.logged_in) {
    res.redirect('/login');
    return;
  }

  res.render('login');
});

router.get('/register', (req, res) => {
  
  if (req.session.logged_in) {
    res.redirect('/');
    return;
  }

  res.render('register');
});

module.exports = router;