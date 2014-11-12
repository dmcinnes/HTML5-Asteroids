// Canvas Asteroids
//
// Copyright (c) 2010 Doug McInnes
//


GRID_SIZE = 60;

Game = {
    score: 0,
    totalAsteroids: 5,
    lives: 0,

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

        userId : "",

        initializeUserId : function() {
            var userId = $('#gamecloud-username').text();
            if ((userId === undefined) || (userId === "username")) {
                userId = "User" + moment().format().toString();
            }
            // And add the ex: prefix
            this.userId = "ex:" + userId;
        },

        getUserId : function() {
            if(this.userId === "") {
                this.initializeUserId();
            }

            return this.userId;
        },

        boot: function () {
            Game.spawnAsteroids(5);
            this.gamecloud = new Gamecloud();
            this.state = 'waiting';
        },
        waiting: function () {
            Text.renderText(window.ipad ? 'Touch Screen to Start' : 'Press Space to Start', 36, Game.canvasWidth/2 - 270, Game.canvasHeight/2);
            if (KEY_STATUS.space || window.gameStart) {
                KEY_STATUS.space = false; // hack so we don't shoot right away
                window.gameStart = false;
                this.state = 'start';
            }
        },
        start: function () {
            console.log("Started again!");
            var events = new Events();
            this.gamecloud.triggersEvent("nokey", events._hashTriggerStartNewGame, this.getUserId(), this.getUserId() + "charAsteroidsSpaceShip");
            for (var i = 0; i < Game.sprites.length; i++) {
                if (Game.sprites[i].name == 'asteroid') {
                    Game.sprites[i].die();
                } else if (Game.sprites[i].name == 'bullet' || Game.sprites[i].name == 'bigalien') {
                    Game.sprites[i].visible = false;
                }
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
            var events = new Events();
            this.gamecloud.triggersEvent("nokey", events._hashTriggerNewLevel, this.getUserId(), this.getUserId() + "charAsteroidsSpaceShip");
            this.state = 'run';
        }
    },
    player_died: function () {

        // Player died
        if(!this.deathFlag) {
            this.deathFlag = true;
            console.log("Player died!, sending the event to gamecloud");
            var events = new Events();
            //events.TriggerDeath("ex:player555", "ex:character5557");
            this.gamecloud.triggersEvent("nokey", events._hashTriggerPlayerDies, this.getUserId(), this.getUserId() + "charAsteroidsSpaceShip");
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
              this.state = 'spawn_ship';
          }
        }
    },
    end_game: function () {
        console.log("end_game, sending game over to gamecloud");
        var events = new Events();
        this.gamecloud.triggersEvent("nokey", events._hashTriggerGameOver, this.getUserId(), this.getUserId() + "charAsteroidsSpaceShip");
        Text.renderText('GAME OVER', 50, Game.canvasWidth/2 - 160, Game.canvasHeight/2 + 10);
        if (this.timer == null) {
            this.timer = Date.now();
        }
        // wait 5 seconds then go back to waiting state
        if (Date.now() - this.timer > 5000) {
            this.timer = null;
            this.state = 'waiting';
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
