/**
 * Created by Janne on 10.11.2014.
 */


Sprite = function () {
    this.init = function (name, points) {
        this.name     = name;
        this.points   = points;

        this.vel = {
            x:   0,
            y:   0,
            rot: 0
        };

        this.acc = {
            x:   0,
            y:   0,
            rot: 0
        };
    };

    this.children = {};

    this.visible  = false;
    this.reap     = false;
    this.bridgesH = true;
    this.bridgesV = true;

    this.collidesWith = [];

    this.x     = 0;
    this.y     = 0;
    this.rot   = 0;
    this.scale = 1;

    this.currentNode = null;
    this.nextSprite  = null;

    this.preMove  = null;
    this.postMove = null;

    this.run = function(delta) {

        this.move(delta);
        this.updateGrid();

        this.context.save();
        this.configureTransform();
        this.draw();

        var canidates = this.findCollisionCanidates();

        this.matrix.configure(this.rot, this.scale, this.x, this.y);
        this.checkCollisionsAgainst(canidates);

        this.context.restore();

        if (this.bridgesH && this.currentNode && this.currentNode.dupe.horizontal) {
            this.x += this.currentNode.dupe.horizontal;
            this.context.save();
            this.configureTransform();
            this.draw();
            this.checkCollisionsAgainst(canidates);
            this.context.restore();
            if (this.currentNode) {
                this.x -= this.currentNode.dupe.horizontal;
            }
        }
        if (this.bridgesV && this.currentNode && this.currentNode.dupe.vertical) {
            this.y += this.currentNode.dupe.vertical;
            this.context.save();
            this.configureTransform();
            this.draw();
            this.checkCollisionsAgainst(canidates);
            this.context.restore();
            if (this.currentNode) {
                this.y -= this.currentNode.dupe.vertical;
            }
        }
        if (this.bridgesH && this.bridgesV &&
            this.currentNode &&
            this.currentNode.dupe.vertical &&
            this.currentNode.dupe.horizontal) {
            this.x += this.currentNode.dupe.horizontal;
            this.y += this.currentNode.dupe.vertical;
            this.context.save();
            this.configureTransform();
            this.draw();
            this.checkCollisionsAgainst(canidates);
            this.context.restore();
            if (this.currentNode) {
                this.x -= this.currentNode.dupe.horizontal;
                this.y -= this.currentNode.dupe.vertical;
            }
        }
    };
    this.move = function (delta) {
        if (!this.visible) return;
        this.transPoints = null; // clear cached points

        if ($.isFunction(this.preMove)) {
            this.preMove(delta);
        }

        this.vel.x += this.acc.x * delta;
        this.vel.y += this.acc.y * delta;
        this.x += this.vel.x * delta;
        this.y += this.vel.y * delta;
        this.rot += this.vel.rot * delta;
        if (this.rot > 360) {
            this.rot -= 360;
        } else if (this.rot < 0) {
            this.rot += 360;
        }

        if ($.isFunction(this.postMove)) {
            this.postMove(delta);
        }
    };
    this.updateGrid = function () {
        if (!this.visible) return;
        var gridx = Math.floor(this.x / GRID_SIZE);
        var gridy = Math.floor(this.y / GRID_SIZE);
        gridx = (gridx >= this.grid.length) ? 0 : gridx;
        gridy = (gridy >= this.grid[0].length) ? 0 : gridy;
        gridx = (gridx < 0) ? this.grid.length-1 : gridx;
        gridy = (gridy < 0) ? this.grid[0].length-1 : gridy;
        var newNode = this.grid[gridx][gridy];
        if (newNode != this.currentNode) {
            if (this.currentNode) {
                this.currentNode.leave(this);
            }
            newNode.enter(this);
            this.currentNode = newNode;
        }

        if (KEY_STATUS.g && this.currentNode) {
            this.context.lineWidth = 3.0;
            this.context.strokeStyle = 'green';
            this.context.strokeRect(gridx*GRID_SIZE+2, gridy*GRID_SIZE+2, GRID_SIZE-4, GRID_SIZE-4);
            this.context.strokeStyle = 'black';
            this.context.lineWidth = 1.0;
        }
    };
    this.configureTransform = function () {
        if (!this.visible) return;

        var rad = (this.rot * Math.PI)/180;

        this.context.translate(this.x, this.y);
        this.context.rotate(rad);
        this.context.scale(this.scale, this.scale);
    };
    this.draw = function () {
        if (!this.visible) return;

        this.context.lineWidth = 1.0 / this.scale;

        for (child in this.children) {
            this.children[child].draw();
        }

        this.context.beginPath();

        this.context.moveTo(this.points[0], this.points[1]);
        for (var i = 1; i < this.points.length/2; i++) {
            var xi = i*2;
            var yi = xi + 1;
            this.context.lineTo(this.points[xi], this.points[yi]);
        }

        this.context.closePath();
        this.context.stroke();
    };
    this.findCollisionCanidates = function () {
        if (!this.visible || !this.currentNode) return [];
        var cn = this.currentNode;
        var canidates = [];
        if (cn.nextSprite) canidates.push(cn.nextSprite);
        if (cn.north.nextSprite) canidates.push(cn.north.nextSprite);
        if (cn.south.nextSprite) canidates.push(cn.south.nextSprite);
        if (cn.east.nextSprite) canidates.push(cn.east.nextSprite);
        if (cn.west.nextSprite) canidates.push(cn.west.nextSprite);
        if (cn.north.east.nextSprite) canidates.push(cn.north.east.nextSprite);
        if (cn.north.west.nextSprite) canidates.push(cn.north.west.nextSprite);
        if (cn.south.east.nextSprite) canidates.push(cn.south.east.nextSprite);
        if (cn.south.west.nextSprite) canidates.push(cn.south.west.nextSprite);
        return canidates
    };
    this.checkCollisionsAgainst = function (canidates) {
        for (var i = 0; i < canidates.length; i++) {
            var ref = canidates[i];
            do {
                this.checkCollision(ref);
                ref = ref.nextSprite;
            } while (ref)
        }
    };
    this.checkCollision = function (other) {
        if (!other.visible ||
            this == other ||
            this.collidesWith.indexOf(other.name) == -1) return;
        var trans = other.transformedPoints();
        var px, py;
        var count = trans.length/2;
        for (var i = 0; i < count; i++) {
            px = trans[i*2];
            py = trans[i*2 + 1];
            // mozilla doesn't take into account transforms with isPointInPath >:-P
            if (($.browser.mozilla) ? this.pointInPolygon(px, py) : this.context.isPointInPath(px, py)) {
                other.collision(this);
                this.collision(other);
                return;
            }
        }
    };
    this.pointInPolygon = function (x, y) {
        var points = this.transformedPoints();
        var j = 2;
        var y0, y1;
        var oddNodes = false;
        for (var i = 0; i < points.length; i += 2) {
            y0 = points[i + 1];
            y1 = points[j + 1];
            if ((y0 < y && y1 >= y) ||
                (y1 < y && y0 >= y)) {
                if (points[i]+(y-y0)/(y1-y0)*(points[j]-points[i]) < x) {
                    oddNodes = !oddNodes;
                }
            }
            j += 2
            if (j == points.length) j = 0;
        }
        return oddNodes;
    };
    this.collision = function () {
    };
    this.die = function () {
        this.visible = false;
        this.reap = true;
        if (this.currentNode) {
            this.currentNode.leave(this);
            this.currentNode = null;
        }
    };
    this.transformedPoints = function () {
        if (this.transPoints) return this.transPoints;
        var trans = new Array(this.points.length);
        this.matrix.configure(this.rot, this.scale, this.x, this.y);
        for (var i = 0; i < this.points.length/2; i++) {
            var xi = i*2;
            var yi = xi + 1;
            var pts = this.matrix.multiply(this.points[xi], this.points[yi], 1);
            trans[xi] = pts[0];
            trans[yi] = pts[1];
        }
        this.transPoints = trans; // cache translated points
        return trans;
    };
    this.isClear = function () {
        if (this.collidesWith.length == 0) return true;
        var cn = this.currentNode;
        if (cn == null) {
            var gridx = Math.floor(this.x / GRID_SIZE);
            var gridy = Math.floor(this.y / GRID_SIZE);
            gridx = (gridx >= this.grid.length) ? 0 : gridx;
            gridy = (gridy >= this.grid[0].length) ? 0 : gridy;
            cn = this.grid[gridx][gridy];
        }
        return (cn.isEmpty(this.collidesWith) &&
        cn.north.isEmpty(this.collidesWith) &&
        cn.south.isEmpty(this.collidesWith) &&
        cn.east.isEmpty(this.collidesWith) &&
        cn.west.isEmpty(this.collidesWith) &&
        cn.north.east.isEmpty(this.collidesWith) &&
        cn.north.west.isEmpty(this.collidesWith) &&
        cn.south.east.isEmpty(this.collidesWith) &&
        cn.south.west.isEmpty(this.collidesWith));
    };
    this.wrapPostMove = function () {
        if (this.x > Game.canvasWidth) {
            this.x = 0;
        } else if (this.x < 0) {
            this.x = Game.canvasWidth;
        }
        if (this.y > Game.canvasHeight) {
            this.y = 0;
        } else if (this.y < 0) {
            this.y = Game.canvasHeight;
        }
    };

};