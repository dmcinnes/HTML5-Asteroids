/**
 * Created by Janne on 10.11.2014.
 */


BigAlien = function () {
    this.init("bigalien",
        [-20,   0,
            -12,  -4,
            12,  -4,
            20,   0,
            12,   4,
            -12,   4,
            -20,   0,
            20,   0]);

    this.children.top = new Sprite();
    this.children.top.init("bigalien_top",
        [-8, -4,
            -6, -6,
            6, -6,
            8, -4]);
    this.children.top.visible = true;

    this.children.bottom = new Sprite();
    this.children.bottom.init("bigalien_top",
        [ 8, 4,
            6, 6,
            -6, 6,
            -8, 4]);
    this.children.bottom.visible = true;

    this.collidesWith = ["asteroid", "ship", "bullet"];

    this.bridgesH = false;

    this.bullets = [];
    this.bulletCounter = 0;

    this.newPosition = function () {
        if (Math.random() < 0.5) {
            this.x = -20;
            this.vel.x = 1.5;
        } else {
            this.x = Game.canvasWidth + 20;
            this.vel.x = -1.5;
        }
        this.y = Math.random() * Game.canvasHeight;
    };

    this.setup = function () {
        this.newPosition();

        for (var i = 0; i < 3; i++) {
            var bull = new AlienBullet();
            this.bullets.push(bull);
            Game.sprites.push(bull);
        }
    };

    this.preMove = function (delta) {
        var cn = this.currentNode;
        if (cn == null) return;

        var topCount = 0;
        if (cn.north.nextSprite) topCount++;
        if (cn.north.east.nextSprite) topCount++;
        if (cn.north.west.nextSprite) topCount++;

        var bottomCount = 0;
        if (cn.south.nextSprite) bottomCount++;
        if (cn.south.east.nextSprite) bottomCount++;
        if (cn.south.west.nextSprite) bottomCount++;

        if (topCount > bottomCount) {
            this.vel.y = 1;
        } else if (topCount < bottomCount) {
            this.vel.y = -1;
        } else if (Math.random() < 0.01) {
            this.vel.y = -this.vel.y;
        }

        this.bulletCounter -= delta;
        if (this.bulletCounter <= 0) {
            this.bulletCounter = 22;
            for (var i = 0; i < this.bullets.length; i++) {
                if (!this.bullets[i].visible) {
                    bullet = this.bullets[i];
                    var rad = 2 * Math.PI * Math.random();
                    var vectorx = Math.cos(rad);
                    var vectory = Math.sin(rad);
                    bullet.x = this.x;
                    bullet.y = this.y;
                    bullet.vel.x = 6 * vectorx;
                    bullet.vel.y = 6 * vectory;
                    bullet.visible = true;
                    SFX.laser();
                    break;
                }
            }
        }

    };

    BigAlien.prototype.collision = function (other) {
        if (other.name == "bullet") Game.score += 200;
        SFX.explosion();
        Game.explosionAt(other.x, other.y);
        this.visible = false;
        this.newPosition();
    };

    this.postMove = function () {
        if (this.y > Game.canvasHeight) {
            this.y = 0;
        } else if (this.y < 0) {
            this.y = Game.canvasHeight;
        }

        if ((this.vel.x > 0 && this.x > Game.canvasWidth + 20) ||
            (this.vel.x < 0 && this.x < -20)) {
            // why did the alien cross the road?
            this.visible = false;
            this.newPosition();
        }
    }
};
BigAlien.prototype = new Sprite();