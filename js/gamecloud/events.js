/**
 * Created by Janne on 11.11.2014.
 */

var Events = {
    _hashTriggerPlayerDies : "qoxyomgo9ntutyb9",
    _hashCheckPlayerDeaths : "q5hkxlt3b6vtpgb9",
    _hashTriggerGameOver : "1gc0n61e1d53tyb9",
    _hashCheckPlayerGameOvers : "t7b6g13prnj6ecdi",
    _hashTriggerStartNewGame : "3txcv5phj5ze61or",
    _hashTriggerNewLevel : "zscriegujqlx47vi",

    _gainAchievementHashes : {
        "newPlayer" : "5e67w4efn6s10pb9",
        "destroyFirstAsteroid" : "ul13s30542o9lik9",
        "score1000Points" : "lmcvdonsjb81tt9",
        "10GamesInARow" : "y2l9xmum4u7ynwmi",
        "idler" : "c1lar1tacmrvygb9"
    },

    _askAschievementHashes : {
        newPlayer : "r8g8g5jbcjlzbyb9",
        destroyFirstAsteroid : "0a19kom0bi5m6lxr",
        score1000Points : "8ab2w5uk26e0zfr",
        "10GamesInARow" : "e4mf3n35m4h1tt9",
        idler : "bltjzhh60vdt2o6r"
    },

    /**
     * Event fired when triggering player death event
     * @param {String} playerId The id of the player in question
     * @param {String} characterId The id of the character in question
     * @constructor
     */
    TriggerDeath : function(playerId, characterId) {

        // Send the trigger event to backend
        triggersEvent("nokey", this._hashTriggerPlayerDies, playerId, characterId);

    },

    giveAchievement : function(playerId, achievementName, characterId) {
        Gamecloud.giveAchievement("NOAUTH", this._gainAchievementHashes[achievementName], playerId, characterId);
    },

    checkOwnedAchievementFromGamecloud : function(playerId, characterId) {
        _.forEach(this._askAschievementHashes, function (achievementHash) {
            Gamecloud.hasAchievement("NOAUTH", achievementHash, playerId, characterId, function (err, result) {
                if (err) {
                    throw err;
                }
                // We have some results
                console.log("--RESULTS FROM GAMECLOUD:", result);
            });
        });
    }
};


