const path = require('path');
const express = require('express');
const session = require('express-session');
const exphbs = require('express-handlebars');
const routes = require('./controllers');
const authRouter = require('./controllers/api/userRoutes');
const passport = require('passport');
const axios = require('axios');
const fs = require('fs').promises;
const sequelize = require('./config/connection');
const SequelizeStore = require('connect-session-sequelize')(session.Store);

const app = express();
const PORT = process.env.PORT || 3001;

const hbs = exphbs.create();

const sess = {
    secret: 'Super secret secret',
    cookie: {
        maxAge: 300000,
        httpOnly: true,
        secure: false,
        sameSite: 'strict',
    },
    resave: false,
    saveUninitialized: true,
    store: new SequelizeStore({
        db: sequelize
    })
};

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

hbs.handlebars.registerHelper('ifEquals', function(arg1, arg2, options) {
    return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session(sess));
app.use(passport.initialize());
app.use(passport.session());
app.use('/', authRouter);
app.use(routes);

app.use((err, req, res, next) => {
    if (err.status === 401) {

      axios.get('https://api.adviceslip.com/advice')
        .then(response => {
          const advice = response.data.slip.advice;
          console.log("Rendering error401.handlebars with advice:", advice);
          res.status(401).render('error401', { advice }); // Pass the advice variable to the render function
        })
        .catch(error => {
          console.error('Error fetching advice:', error);
          res.status(401).render('error401', {
            advice: "Sorry, we couldn't fetch any advice at the moment. Please try again later."
          });
        });
    } else if (err.status === 404) {
        axios.get('https://api.chucknorris.io/jokes/random')
            .then(response => {
                const joke = response.data.value;
                res.render('error404', { joke });
            })
            .catch(error => {
                console.error('Error fetching Chuck Norris joke:', error);
                res.render('error404', {
                    joke: "Chuck Norris doesn't have 404 errors. But sometimes, even he can't find what doesn't exist."
                });
            });
    } else {
 
        res.status(err.status || 500);
        res.render('error', { 
            message: err.message,
            error: {}
        });
    }
});

sequelize.sync({ force: false }).then(() => {
    app.listen(PORT, () => console.log('🔥🔥🔥!(ON)'));
});

