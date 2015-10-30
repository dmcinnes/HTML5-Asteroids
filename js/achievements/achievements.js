/**
 * Created by parkkila on 29.10.2015.
 */
"use strict";

var Achievements = {
    ownedAchievements : [],
    allAchievements : ["newPlayer", "destroyFirstAsteroid", "score1000Points", "10GamesInARow", "idler"],
    /**
     * Gets the achievements owned by the player
     * @returns {Array} An array of owned achievement strings
     */
    getOwnedAchievements : function() {
        return this.ownedAchievements;
    },
    /**
     * Displays the owned achievements on a command line
     */
    displayOwnedAchievements : function() {
        console.log("The player owns the following achievements:");
        console.log("Amount of achievements:", this.getOwnedAchievements().length);
        _.forEach(this.getOwnedAchievements(), function(ownedAchievement) {
            console.log("\t" + ownedAchievement);
        });
    },
    /**
     * Checks if the given achievement string is actually in the list of achievements of this game
     * @param {String} achievementName The name of the achievement to check for
     * @return {String|null} returns the achievement string or a null, whether the achievement exists
     */
    checkIfExistsAchievement : function(achievementName) {
        return _.findWhere(this.allAchievements, achievementName);
    },
    /**
     * Checks if the player actually owns the achievement already or not
     * @param {String} achievementName Name of the achievement to check
     * @return {String|null} returns the achievement string or a null, whether the achievement exists
     */
    checkIfOwnsAchievement : function(achievementName) {
        return _.findWhere(this.ownedAchievements, achievementName);
    },
    /**
     * Retrieves the player owned achievements from Gamecloud
     * @param {Function} callback Regular (err, result) callback function
     */
    retrieveAchievementsFromGamecloud : function(callback) {
        Events.checkOwnedAchievementFromGamecloud(Gamecloud.getUserId(), callback);
        // Once done, callback
    },
    /**
     * Gives an achievement to the player, if the player does not already have it
     * @param {String} achievementName Name of the achievement to give
     */
    giveAchievement : function(achievementName) {
        // Check if the achievement even exists
        if(this.checkIfExistsAchievement(achievementName) === false) {
            // Just return, as no such thing exists
            return;
        }
        // If the user does not have the achievement yet
        if(this.checkIfOwnsAchievement(achievementName)) {
            // Don't react, as the player already has this
        } else {
            // If not, add it to list of owned achievements
            this.addAchievementToOwned(achievementName);
            // Add it to the gamecloud as well
            Events.giveAchievement(achievementName);
            // And show an info box
            $.notify("Gained achievement: " + achievementName, "success");
        }
    },
    /**
     * Adds the achievement to the list of owned achievement
     * @param {String} achievementName The name of the achievement to add to the list of owned achievements
     */
    addAchievementToOwned : function(achievementName) {
        console.log("Gave user the following achievement:", achievementName);
        // Display the given achievement
        $('#achievement-' + achievementName).show();
        this.ownedAchievements.push(achievementName);
    },
    /**
     * Zeroes the owned achievements. This is to enable new players to gain achievements as well
     * should be used for example when a player logs out of gamecloud.
     */
    zeroAchievements : function() {
        this.ownedAchievements = [];
    }
};
