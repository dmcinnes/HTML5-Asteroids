/**
 * Created by Janne on 11.11.2014.
 */

function Events() {
    this._hashTriggerPlayerDies = "qoxyomgo9ntutyb9";
    this._hashCheckPlayerDeaths = "q5hkxlt3b6vtpgb9";
    this._hashTriggerGameOver = "1gc0n61e1d53tyb9";
    this._hashCheckPlayerGameOvers = "t7b6g13prnj6ecdi";
    this._hashTriggerStartNewGame = "3txcv5phj5ze61or";
    this._hashTriggerNewLevel = "zscriegujqlx47vi";
}

/**
 * Event fired when triggering player death event
 * @param {String} playerId The id of the player in question
 * @param {String} characterId The id of the character in question
 * @constructor
 */
Events.prototype.TriggerDeath = function(playerId, characterId) {

    // Send the trigger event to backend
    triggersEvent("nokey", this._hashTriggerPlayerDies, playerId, characterId);

};