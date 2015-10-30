/**
 * Created by Janne on 10.11.2014.
 */

$(document).ready(function() {

    // Button functions
    $('#gamecloud-login-button').on('click', Login);
    $('#gamecloud-logout-button').on('click', Logout);

    // Hide the logout
    $('#gamecloud-logged').hide();

    $('#gamecloud-create-button').on('click', Create);

});

function Create() {
    if (!ValidateCreateData()) {
        alert("Passwords do not match!");
        return;
    }
    var json = ReadCreateData();
    SendToServer(json, CreateCallback);

}

/**
 * The callback function for create user calls
 * @param {String} data The data received from the gamecloud server
 * @constructor
 */
function CreateCallback(data) {
    alert(data);
}

/**
 * Validates the create data, returning whether all the data is valid or not
 * @returns {boolean}
 * @constructor
 */
function ValidateCreateData() {
    // Check that the passwords match
    return ($('#gamecloud-create-password').val() === $('#gamecloud-create-password2').val());
}

/**
 * Reads the create data from the form
 * @returns {*}
 * @constructor
 */
function ReadCreateData() {
    // Get all the data
    var username = $('#gamecloud-create-username').val();
    var password = $('#gamecloud-create-password').val();
    var email = $('#gamecloud-create-email').val();

    var json = {
        "callType" : "createUser",
        "username" : username,
        "password" : password,
        "email" : email
    };

    return JSON.stringify(json);

}

/**
 * Handles loggin out from the server
 * @constructor
 */
function Logout() {
    // Show the login
    $('#gamecloud-login').show();
    // Empty the fields
    $('#gamecloud-login-username').val("");
    $('#gamecloud-login-password').val("");
    // And hide yourself
    $('#gamecloud-logged').hide();
    // Empty achievements from memory
    Achievements.zeroAchievements();
    // And initialize a new user and session
    Gamecloud.initializeUserId();
    Gamecloud.initializeSession();
}

/**
 * Handles logging in to the gamecloud server
 * @constructor
 */
function Login() {
    var json = ReadCredentials();
    SendToServer(json, AuthCallback);
}

/**
 * Reads the user credentials from the webpage
 * @returns {JSON} Stringified JSON
 * @constructor
 */
function ReadCredentials() {
    var username = $('#gamecloud-login-username').val();
    var password = $('#gamecloud-login-password').val();
    console.log("Username is:", username, "password is:", password);

    var json = {
        "callType": "loginUser",
        "username": username,
        "password": password
    };

    return JSON.stringify(json);
}

/**
 * Sends the stringified json to server
 * @param {JSON} json the stringified JSON sent to the server
 * @param {Function} callback The callback function to use with returning messages
 * @constructor
 */
function SendToServer(json, callback) {
    $.post(Config.gamecloudAddress, json, callback);
}

/**
 * The Authentication callback function
 * @param {String} data The resulting datastring
 * @constructor
 */
function AuthCallback(data) {
    if (CheckAuth(data)) {
        // Authentication success
        $.notify("Login Successful!", "success");
        // Hide yourself
        $('#gamecloud-login').hide();
        // And show the logged
        $('#gamecloud-logged').show();
        // And set username
        var playerId = $('#gamecloud-login-username').val();
        $('#gamecloud-username').text(playerId);

        // And make Gamecloud to initialize the userId
        Gamecloud.initializeUserId();
        // And create a new session
        Gamecloud.initializeSession();

        // Check the player achievements
        Achievements.retrieveAchievementsFromGamecloud(function(err, result) {
            if(err) {
                throw err;
            } else {
                console.log("---Checked achievements from Gamecloud---");
            }
        });
    } else {
        $.notify("Error while logging: " + data, "danger");
    }
}

/**
 * Checks for auth results
 * @param {String} authResult The results of the authentication
 * @returns {boolean} depending on whether auth was succesful or not
 * @constructor
 */
function CheckAuth(authResult) {
    return (authResult !== "No such player in the system");
}