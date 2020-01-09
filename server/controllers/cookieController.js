const { User } = require('../models/userModels');
const cookieController = {

    setSSIDCookie (req, res, next) {
        User.find({name: res.locals.user.name})
        .exec()
        .then(user => {
            console.log('cookie being set');
            res.cookie('ssid', user[0]._id, {httpOnly: false, overwrite: true, encode: String});
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
