var Login = {
    res: "",
    models: ""
};


/**
 * Lorsqu'un utilisateur souhaite se connecter
 * POST /login
 * @param email
 * @param password
 */
Login.index = function (req, res) {
    var pseudo = req.body.email ? req.body.email : false;
    var password = req.body.password ? req.body.password : false;

    Login.res = res;
    Login.models = req.app.get('models');

    if (!pseudo) {
        res.send(JSON.stringify({
            error: true,
            message: "Merci d'indiquer un email"
        }));

        return false;
    }

    if (!password) {
        res.send(JSON.stringify({
            error: true,
            message: "Merci d'indiquer un mot de passe"
        }));

        return false;
    }

    Login.models.users.login({
        email: pseudo,
        password: password,
        device: 'computer'
    }, Login.failure, Login.success);

};


/**
 * Lorsqu'une erreur survient
 * @param string errorMessage
 */
Login.failure = function (errorMessage) {
    Login.res.send(JSON.stringify({
        error: true,
        message: errorMessage
    }));
};


/**
 * Lorsque tout est ok
 * @param string token
 */
Login.success = function (token) {
    var decodedToken = Login.models.tokens.decode(token);
    Login.models.tokens.updateLastUse(decodedToken.token, decodedToken.user);

    Login.res.send(JSON.stringify({
        error: false,
        token: token
    }));
};


module.exports = Login.index;
