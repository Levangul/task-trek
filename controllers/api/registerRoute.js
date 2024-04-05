const { User } = require('../../models');

exports.registerUser = async (req, res) => {
    try {
           
        const existingUser = await User.findOne({ where: { email: req.body.email } });
            if (existingUser) {

                return res.status(401).render('error401', {
                    message: 'Email is already registered either register with new email or log in'
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
};

module.exports = exports;