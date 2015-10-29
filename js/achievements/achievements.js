/**
 * Created by parkkila on 29.10.2015.
 */
"use strict";

var Achievements = {
    ownedAchievements : [],
    allAchievements : ["newPlayer", "destroyFirstAsteroid"],
    getOwnedAchievements : function() {
        return this.ownedAchievements;
    },
    displayOwnedAchievements : function() {
        console.log("The player owns the following achievements:");
        console.log("Amount of achievements:", this.getOwnedAchievements().length);
        _.forEach(this.getOwnedAchievements(), function(ownedAchievement) {
            console.log("\t" + ownedAchievement);
        });
    },
    checkIfExistsAchievement : function(achievementName) {
        return _.findWhere(this.allAchievements, achievementName);
    },
    checkIfOwnsAchievement : function(achievementName) {
        return _.findWhere(this.ownedAchievements, achievementName);
    },
    retrieveAchievementsFromGamecloud : function(callback) {
        // Once done, callback
        callback(null, true);
    },
    addAchievement : function(achievementName) {
        // Check if the achievement even exists
        if(this.checkIfExistsAchievement(achievementName) === false) {
            // Just return, as no such thing exists
            return;
        }
        // If the user does not have the achievement yet
        if(this.checkIfOwnsAchievement(achievementName)) {
            // Don't react, as the player already has this
        } else {
            // If not, add it
            this.ownedAchievements.push(achievementName);
        }
    },
    zeroAchievements : function() {
        this.ownedAchievements = [];
    }
};
