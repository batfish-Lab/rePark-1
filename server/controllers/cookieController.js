const { User } = require('../models/userModels');
const cookieController = {
    
    setSSIDCookie (req, res, next) {
        User.find({name: res.locals.user.name})
        .exec()
        .then(user => {
            const cookie = user[0]._id;
            const newCookie = cookie.toString();
            res.cookie('ssid', newCookie, {httpOnly: true});
            res.locals.userId = user[0]._id;
            return next();
        })
        .catch(
            err => {return next({
                log: 'Express error handler caught setSSIDcookie error',
                status: 400,
                message: { err: 'An error occurred' },
              })}
        )
    }
};

module.exports = cookieController;