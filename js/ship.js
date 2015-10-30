/**
 * Created by Janne on 10.11.2014.
 */


Ship = function () {
    this.init("ship",
        [-5,   4,
            0, -12,
            5,   4]);

    this.children.exhaust = new Sprite();
    this.children.exhaust.init("exhaust",
        [-3,  6,
            0, 11,
            3,  6]);

    this.bulletCounter = 0;

    this.postMove = this.wrapPostMove;

    this.collidesWith = ["asteroid", "bigalien", "alienbullet"];

    this.preMove = function (delta) {
        if (KEY_STATUS.left) {
            this.vel.rot = -6;
        } else if (KEY_STATUS.right) {
            this.vel.rot = 6;
        } else {
            this.vel.rot = 0;
        }

        if (KEY_STATUS.up) {
            var rad = ((this.rot-90) * Math.PI)/180;
            this.acc.x = 0.5 * Math.cos(rad);
            this.acc.y = 0.5 * Math.sin(rad);
            this.children.exhaust.visible = Math.random() > 0.1;
        } else {
            this.acc.x = 0;
            this.acc.y = 0;
            this.children.exhaust.visible = false;
        }

        if (this.bulletCounter > 0) {
            this.bulletCounter -= delta;
        }
        if (KEY_STATUS.space) {
            if (this.bulletCounter <= 0) {
                this.bulletCounter = 10;
                for (var i = 0; i < this.bullets.length; i++) {
                    if (!this.bullets[i].visible) {
                        SFX.laser();
                        var bullet = this.bullets[i];
                        var rad = ((this.rot-90) * Math.PI)/180;
                        var vectorx = Math.cos(rad);
                        var vectory = Math.sin(rad);
                        // move to the nose of the ship
                        bullet.x = this.x + vectorx * 4;
                        bullet.y = this.y + vectory * 4;
                        bullet.vel.x = 6 * vectorx + this.vel.x;
                        bullet.vel.y = 6 * vectory + this.vel.y;
                        bullet.visible = true;
                        break;
                    }
                }
            }
        }

        // limit the ship's speed
        if (Math.sqrt(this.vel.x * this.vel.x + this.vel.y * this.vel.y) > 8) {
            this.vel.x *= 0.95;
            this.vel.y *= 0.95;
        }
    };

    this.collision = function (other) {
        SFX.explosion();
        Game.explosionAt(other.x, other.y);
        Game.FSM.state = 'player_died';
        this.visible = false;
        this.currentNode.leave(this);
        this.currentNode = null;
        Game.lives--;
    };

};
Ship.prototype = new Sprite();