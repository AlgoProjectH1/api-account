module.exports = {
    connection: "",
    sha1: "",
    tokenManager: "",

    /**
     * Init the model
     * @param object connection
     * @param object sha1
     */
    init: function (connection, sha1) {
        this.connection = connection;
        this.sha1 = sha1;

        return this;
    },

    /**
     * Set the token manager
     * @param object tokenManager
     */
    setTokenManager: function (tokenManager) {
        this.tokenManager = tokenManager;
    },

    /**
     * Login an user
     * @param object options
     * @param function failure
     * @param function success
     */
    login: function (options, failure, success) {
        if (options.email === null) {
            failure("L'email fourni est invalide");
            return false;
        }

        if (options.password === null) {
            failure("Le mot de passe fourni est invalide");
            return false;
        }

        var password = this.sha1(options.password);
        var connection = this.connection;
        var tokenManager = this.tokenManager;

        // Verify the provided connection infos
        connection.query("SELECT id, COUNT(id) AS count FROM users WHERE email = '" + options.email +"' AND password = '"+ password +"'", function (error, rows)
        {
            if (error || rows[0].count <= 0) {
                console.log(error);
                failure("Aucun compte n'existe avec ces identifiants");
                return false;
            }

            var user_id = rows[0].id;
            var token = tokenManager.generate();

            // Save the token
            connection.query("INSERT INTO tokens SET token = '"+ token +"', users_id = "+ user_id +", device = '"+ options.device +"'", function (error)
            {
                if (error) {
                    console.log(error);
                    failure("Une erreur est survenue durant la génération du jeton de connexion");
                    return false;
                }

                success(tokenManager.format(token, user_id));
            });
        });
    },

    /**
     * Login an user via Facebook
     * @param object options
     * @param function failure
     * @param function success
     */
    fbLogin: function (options, failure, success) {
        var connection = this.connection;
        var tokenManager = this.tokenManager;

        // Verify the provided connection infos
        connection.query("SELECT users_id, COUNT(facebook_id) AS count FROM users_facebook WHERE facebook_id = '" + options.facebookID +"'", function (error, rows)
        {
            if (error) {
                console.log(error);
                failure("Une erreur est survenue durant la connexion");
                return false;
            }

            if (rows[0].count <= 0) {
                // We create the account
                return false;
            }

            var user_id = rows[0].users_id;
            var token = tokenManager.generate();

            // Save the token
            connection.query("INSERT INTO tokens SET token = '"+ token +"', users_id = "+ user_id +", device = '"+ options.device +"'", function (error)
            {
                if (error) {
                    console.log(error);
                    failure("Une erreur est survenue durant la génération du jeton de connexion");
                    return false;
                }

                success(tokenManager.format(token, user_id));
            });
        });
    },

    /**
     * Add a user
     * @param object options
     * @param function success
     * @param function failure
     */
    signup: function (options, failure, success) {
        if (options.email === null) {
            failure("L'email fourni est invalide");
            return false;
        }

        if (options.password === null) {
            failure("Le mot de passe fourni est invalide");
            return false;
        }

        if (options.pseudo === null) {
            failure("Le pseudo fourni est invalide");
            return false;
        }

        var password = this.sha1(options.password);
        var connection = this.connection;
        var tokenManager = this.tokenManager;

        // Verify the provided connection infos
        connection.query("INSERT INTO users SET email = '" + options.email +"', password = '"+ password +"', username = '"+ options.pseudo +"'", function (error, result)
        {
            if (error) {
                console.log(error);
                failure("Une erreur est survenue");
                return false;
            }

            var user_id = result.insertId;
            var token = tokenManager.generate();

            // Save the token
            connection.query("INSERT INTO tokens SET token = '"+ token +"', users_id = "+ user_id +", device = '"+ options.device +"'", function (error)
            {
                if (error) {
                    console.log(error);
                    failure("Une erreur est survenue durant la génération du jeton de connexion");
                    return false;
                }

                success(tokenManager.format(token, user_id));
            });
        });
    },

    /**
     * Get user datas from an id
     * @param int id
     * @param function failure
     * @param function success
     */
    getDatas: function (id, failure, success) {
        var connection = this.connection;

        connection.query("SELECT username, email, rank FROM users WHERE id = "+ id +"", function (error, rows) {
            if (error) {
                console.log(error);
                failure("Une erreur est survenue durant la recuperation des informations");
                return false;
            }

            success(rows[0]);
        });
    }
};
