/**
 * Originally Created by Timo Hynninen on 13.02.2014
 * Further updated by Janne Parkkila on 10.11.2014.
 *
 * Gamecloud interfacing library for javascript
 * (http request simplifier)
 */

var SERVER_ADDRESS = Config.gamecloudAddress;

/**
 * Constructor for the Gamecloud API
 * @constructor
 */
function Gamecloud() {
    this.session = "";
    this.initializeSession();
}

/**
 * Initializes the session
 */
Gamecloud.prototype.initializeSession = function() {
    this.session = moment() + this.randomString(7);
    console.log("Session is:", this.session);
};

/**
 * Creates a random string, according to optional given charset or the full alpha-numeric set
 * @param {Number} len The length of the random string
 * @param {String} charSet The charset to use in creation | OPTIONAL
 * @returns {string} Random string
 */
Gamecloud.prototype.randomString = function randomString(len, charSet) {
    charSet = charSet || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var randomString = '';
    for (var i = 0; i < len; i++) {
        var randomPoz = Math.floor(Math.random() * charSet.length);
        randomString += charSet.substring(randomPoz,randomPoz+1);
    }
    return randomString;
};

Gamecloud.prototype.httpGet = function httpGet(theUrl) {
    var xmlHttp = null;

    xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", theUrl, false ); // method, url, bool async
    xmlHttp.send( null );
    return xmlHttp.responseText;
};

Gamecloud.prototype.gainItem = function (authkey, hash, playerId, characterId) {

    json = { "callType" : "gameDataSave",
        "authkey" : authkey,
        "hash" : hash,
        "playerId" : playerId,
        "characterId" : characterId,
        "sessionId" : this.session
    };


    $.post(SERVER_ADDRESS, JSON.stringify(json), function(data, textStatus, jqXHR){
        if (!data ) return false;
        else return true;

    });

};

Gamecloud.prototype.loseItem = function (authkey, hash, playerId, characterId) {

    json = { "callType" : "gameDataSave",
        "authkey" : authkey,
        "hash" : hash,
        "playerId" : playerId,
        "characterId" : characterId,
        "sessionId" : this.session
    };

    $.post(SERVER_ADDRESS, JSON.stringify(json), function(data, textStatus, jqXHR){
        if (!data ) return false;
        else return true;

    });

};

Gamecloud.prototype.hasItem = function (authkey, hash, playerId, characterId) {

    json = { "callType" : "ask",
        "authkey" : authkey,
        "hash" : hash,
        "playerId" : playerId,
        "characterId" : characterId,
        "sessionId" : this.session
    };

    $.post(SERVER_ADDRESS, JSON.stringify(json), function(data, textStatus, jqXHR){
        if (!data ) return false;
        else return data;

    });

};

Gamecloud.prototype.giveAchievement = function (authkey, hash, playerId, characterId) {

    json = { "callType" : "gameDataSave",
        "authkey" : authkey,
        "hash" : hash,
        "playerId" : playerId,
        "characterId" : characterId,
        "sessionId" : this.session
    };

    $.post(SERVER_ADDRESS, JSON.stringify(json), function(data, textStatus, jqXHR){
        if (!data ) return false;
        else return true;

    });

};

Gamecloud.prototype.hasAchievement = function (authkey, hash, playerId, characterId, callback) {

    json = { "callType" : "ask",
        "authkey" : authkey,
        "hash" : hash,
        "playerId" : playerId,
        "characterId" : characterId,
        "sessionId" : this.session
    };

    $.post(SERVER_ADDRESS, JSON.stringify(json), function(data, textStatus, jqXHR){
        if (!data ) {
            callback("no data", null);
        } else {
            callback(null, data);
        }

    });

};

Gamecloud.prototype.triggersEvent = function (authkey, hash, playerId, characterId) {

    json = { "callType" : "gameDataSave",
        "authkey" : authkey,
        "hash" : hash,
        "playerId" : playerId,
        "characterId" : characterId,
        "sessionId" : this.session
    };

    $.post(SERVER_ADDRESS, JSON.stringify(json), function(data, textStatus, jqXHR){
        if (!data ) return false;
        else return data;

    });

};

Gamecloud.prototype.hasTriggeredEvent = function (authkey, hash, playerId, characterId) {

    json = { "callType" : "ask",
        "authkey" : authkey,
        "hash" : hash,
        "playerId" : playerId,
        "characterId" : characterId,
        "sessionId" : this.session
    };

    $.post(SERVER_ADDRESS, JSON.stringify(json), function(data, textStatus, jqXHR){
        if (!data ) return false;
        else return data;

    });

};