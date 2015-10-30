// Canvas Asteroids
//
// Copyright (c) 2010 Doug McInnes
//


GRID_SIZE = 60;

Game = {
    score: 0,
    totalAsteroids: 5,
    lives: 0,

    // Gamecloud related flags
    deathSent : false,
    gameOverSent : false,

    // Achievement related stuff
    startedGames : 0,

    // Started idling at 'waiting' state
    idleTimeStarted : null,

    canvasWidth: 800,
    canvasHeight: 600,

    sprites: [],
    ship: null,
    bigAlien: null,

    nextBigAlienTime: null,
    deathFlag : false,

    spawnAsteroids: function (count) {
        if (!count) count = this.totalAsteroids;
            for (var i = 0; i < count; i++) {
                var roid = new Asteroid();
                roid.x = Math.random() * this.canvasWidth;
                roid.y = Math.random() * this.canvasHeight;
                while (!roid.isClear()) {
                    roid.x = Math.random() * this.canvasWidth;
                    roid.y = Math.random() * this.canvasHeight;
                }
                roid.vel.x = Math.random() * 4 - 2;
                roid.vel.y = Math.random() * 4 - 2;
                if (Math.random() > 0.5) {
                    roid.points.reverse();
                }
                roid.vel.rot = Math.random() * 2 - 1;
                Game.sprites.push(roid);
            }
    },

    explosionAt: function (x, y) {
        var splosion = new Explosion();
        splosion.x = x;
        splosion.y = y;
        splosion.visible = true;
        Game.sprites.push(splosion);
    },

    FSM: {
        boot: function () {
            Game.spawnAsteroids(5);
            // Create the gamecloud session
            Gamecloud.initializeSession();
            this.state = 'waiting';
            // Set the idle timer
            Game.idleTimeStarted = moment();
        },
        waiting: function () {
            // If the user has idled more than 10 minutes
            var now = moment();
            //console.log("user has now idled:", now.diff(moment(Game.idleTimeStarted), 'minutes', true));
            if (now.diff(moment(Game.idleTimeStarted), 'minutes', true) > 10) {
                // Give an achievement
                Achievements.giveAchievement("idler");
            }
            Text.renderText(window.ipad ? 'Touch Screen to Start' : 'Press Space to Start', 36, Game.canvasWidth / 2 - 270, Game.canvasHeight / 2);
            if (KEY_STATUS.space || window.gameStart) {
                KEY_STATUS.space = false; // hack so we don't shoot right away
                window.gameStart = false;
                this.state = 'start';
                Achievements.displayOwnedAchievements();
            }
        },
        start: function () {
            console.log("Started again!");
            Gamecloud.triggersEvent("nokey", Event._hashTriggerStartNewGame, Gamecloud.getUserId(), Gamecloud.getCharacterId());
            // Give a new player achievement
            Achievements.giveAchievement("newPlayer");
            for (var i = 0; i < Game.sprites.length; i++) {
                if (Game.sprites[i].name == 'asteroid') {
                    Game.sprites[i].die();
                } else if (Game.sprites[i].name == 'bullet' || Game.sprites[i].name == 'bigalien') {
                    Game.sprites[i].visible = false;
                }
            }
            // set the started games +1

            Game.startedGames++;
            // See if we have started already 10 games
            if(Game.startedGames >= 10) {
                // You have played 10 games in a row
                Achievements.giveAchievement("10GamesInARow");
            }
            Game.score = 0;
            Game.lives = 2;
            Game.totalAsteroids = 2;
            Game.spawnAsteroids();

            Game.nextBigAlienTime = Date.now() + 30000 + (30000 * Math.random());

            this.state = 'spawn_ship';
        },
        spawn_ship: function () {
            Game.ship.x = Game.canvasWidth / 2;
            Game.ship.y = Game.canvasHeight / 2;
            if (Game.ship.isClear()) {
                Game.ship.rot = 0;
                Game.ship.vel.x = 0;
                Game.ship.vel.y = 0;
                Game.ship.visible = true;
                this.state = 'run';
            }
        },
        run: function () {
            for (var i = 0; i < Game.sprites.length; i++) {
                if (Game.sprites[i].name == 'asteroid') {
                    break;
                }
            }
            if (i == Game.sprites.length) {
                this.state = 'new_level';
            }
            if (!Game.bigAlien.visible && Date.now() > Game.nextBigAlienTime) {
                Game.bigAlien.visible = true;
                Game.nextBigAlienTime = Date.now() + (30000 * Math.random());
            }
        },
        new_level: function () {
            if (this.timer == null) {
                this.timer = Date.now();
            }
            // wait a second before spawning more asteroids
            if (Date.now() - this.timer > 1000) {
                this.timer = null;
                Game.totalAsteroids++;
                if (Game.totalAsteroids > 12) Game.totalAsteroids = 12;
                Game.spawnAsteroids();
                Gamecloud.triggersEvent("nokey", Event._hashTriggerNewLevel, Gamecloud.getUserId(), Gamecloud.getCharacterId());
                this.state = 'run';
            }
        },
        player_died: function () {

            // Player died
            if (!this.deathFlag) {
                this.deathFlag = true;

                // No death event has been sent
                if (!this.deathSent) {
                    console.log("Player died!, sending the event to gamecloud");
                    // So send it now
                    Gamecloud.triggersEvent("nokey", Event._hashTriggerPlayerDies, Gamecloud.getUserId(), Gamecloud.getCharacterId());
                    // And change the flag
                    this.deathSent = true;
                }
            }
            if (Game.lives < 0) {
                this.deathFlag = false;
                this.state = 'end_game';
            } else {
                if (this.timer == null) {
                    this.timer = Date.now();
                }
                // wait a second before spawning
                if (Date.now() - this.timer > 1000) {
                    this.timer = null;
                    this.deathFlag = false;
                    // We go to spawn, so flip of the deathSent
                    this.deathSent = false;
                    this.state = 'spawn_ship';
                }
            }
        },
        end_game: function () {
            // If no game over has yet been sent
            if (!this.gameOverSent) {
                console.log("end_game, sending game over to gamecloud");
                // Send it
                Gamecloud.triggersEvent("nokey", Event._hashTriggerGameOver, Gamecloud.getUserId(), Gamecloud.getCharacterId());
                // And flag
                this.gameOverSent = true;
            }

            Text.renderText('GAME OVER', 50, Game.canvasWidth / 2 - 160, Game.canvasHeight / 2 + 10);
            if (this.timer == null) {
                this.timer = Date.now();
            }
            // wait 5 seconds then go back to waiting state
            if (Date.now() - this.timer > 5000) {
                this.timer = null;
                // Set the gameover sent flag back to false
                this.gameOverSent = false;
                this.state = 'waiting';
                // Set the idle timer
                Game.idleTimeStarted = moment();
            }

            window.gameStart = false;
        },

        execute: function () {
            this[this.state]();
        },

        state: 'boot'
    }

};


// vim: fdl=0
