/**
 * Created by Janne on 11.11.2014.
 */

function Events() {
    this._hashTriggerPlayerDies = "z8l5d3n7m71ll3di";
    this._hashCheckPlayerDeaths = "utxlv6pq7c9b2o6r";
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