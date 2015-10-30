/**
 * Created by Janne on 10.11.2014.
 */

Asteroid = function () {
    this.init("asteroid",
        [-10,   0,
            -5,   7,
            -3,   4,
            1,  10,
            5,   4,
            10,   0,
            5,  -6,
            2, -10,
            -4, -10,
            -4,  -5]);

    this.visible = true;
    this.scale = 6;
    this.postMove = this.wrapPostMove;

    this.collidesWith = ["ship", "bullet", "bigalien", "alienbullet"];

    this.collision = function (other) {
        SFX.explosion();
        if (other.name == "bullet") Game.score += 120 / this.scale;
        this.scale /= 3;
        if (this.scale > 0.5) {
            // break into fragments
            for (var i = 0; i < 3; i++) {
                var roid = $.extend(true, {}, this);
                roid.vel.x = Math.random() * 6 - 3;
                roid.vel.y = Math.random() * 6 - 3;
                if (Math.random() > 0.5) {
                    roid.points.reverse();
                }
                roid.vel.rot = Math.random() * 2 - 1;
                roid.move(roid.scale * 3); // give them a little push
                Game.sprites.push(roid);
            }
        } else {
            // Otherwise, we killed the last asteroid piece
            Achievements.giveAchievement("destroyFirstAsteroid");
        }
        // Also, check if we got 1000 points
        if(Game.score >= 1000) {
            Achievements.giveAchievement("score1000Points");
        }
        Game.explosionAt(other.x, other.y);
        this.die();
    };
};
Asteroid.prototype = new Sprite();

Explosion = function () {
    this.init("explosion");

    this.bridgesH = false;
    this.bridgesV = false;

    this.lines = [];
    for (var i = 0; i < 5; i++) {
        var rad = 2 * Math.PI * Math.random();
        var x = Math.cos(rad);
        var y = Math.sin(rad);
        this.lines.push([x, y, x*2, y*2]);
    }

    this.draw = function () {
        if (this.visible) {
            this.context.save();
            this.context.lineWidth = 1.0 / this.scale;
            this.context.beginPath();
            for (var i = 0; i < 5; i++) {
                var line = this.lines[i];
                this.context.moveTo(line[0], line[1]);
                this.context.lineTo(line[2], line[3]);
            }
            this.context.stroke();
            this.context.restore();
        }
    };

    this.preMove = function (delta) {
        if (this.visible) {
            this.scale += delta;
        }
        if (this.scale > 8) {
            this.die();
        }
    };
};
Explosion.prototype = new Sprite();