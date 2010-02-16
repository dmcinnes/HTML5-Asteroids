KEY_CODES = {
  32: 'space',
  37: 'left',
  38: 'up',
  39: 'right',
  70: 'f',
  71: 'g',
  72: 'h'
}

KEY_STATUS = {};
for (code in KEY_CODES) {
  KEY_STATUS[KEY_CODES[code]] = false;
}

$(window).keydown(function (e) {
  KEY_STATUS[KEY_CODES[e.keyCode]] = true;
}).keyup(function (e) {
  KEY_STATUS[KEY_CODES[e.keyCode]] = false;
});

GRID_SIZE = 60;

Matrix = function (rows, columns) {
  var i, j;
  this.data = new Array(rows);
  for (i = 0; i < rows; i++) {
    this.data[i] = new Array(columns);
  }

  this.configure = function (rot, scale, transx, transy) {
    var rad = (rot * Math.PI)/180;
    var sin = Math.sin(rad) * scale;
    var cos = Math.cos(rad) * scale;
    this.set(cos, -sin, transx,
             sin,  cos, transy,
               0,    0,      1);
  };

  this.set = function () {
    var k = 0;
    for (i = 0; i < rows; i++) {
      for (j = 0; j < columns; j++) {
        this.data[i][j] = arguments[k];
        k++;
      }
    }
  }

  this.multiply = function () {
    var vector = new Array(rows);
    for (i = 0; i < rows; i++) {
      vector[i] = 0;
      for (j = 0; j < columns; j++) {
        vector[i] += this.data[i][j] * arguments[j];
      }
    }
    return vector;
  };
};

Sprite = function () {
  this.init = function (name, points, diameter) {
    this.name     = name;
    this.points   = points;
    this.diameter = diameter || 1;

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

  this.visible = false;
  this.reap    = false;

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
    this.context.restore();

    this.checkCollisions();
  };

  this.move = function (delta) {
    if (!this.visible) return;

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
    // +1 to take into account the border
    var gridx = Math.floor(this.x / GRID_SIZE) + 1;
    var gridy = Math.floor(this.y / GRID_SIZE) + 1;
    gridx = (gridx >= this.grid.length) ? 0 : gridx;
    gridy = (gridy >= this.grid[0].length) ? 0 : gridy;
    var newNode = this.grid[gridx][gridy];
    if (newNode != this.currentNode) {
      if (this.currentNode) {
        this.currentNode.leave(this);
      }
      newNode.enter(this);
      this.currentNode = newNode;
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

    this.context.beginPath();

    this.context.moveTo(this.points[0], this.points[1]);
    for (var i = 1; i < this.points.length/2; i++) {
      var xi = i*2;
      var yi = xi + 1;
      this.context.lineTo(this.points[xi], this.points[yi]);
    }

    this.context.closePath();
    this.context.stroke();

    for (child in this.children) {
      this.children[child].draw();
    }
  };

  this.checkCollisions = function () {
    if (!this.visible || !this.currentNode) return;
    var cn = this.currentNode;
    cn.eachSprite(this, this.checkCollision);
    cn.north.eachSprite(this, this.checkCollision);
    cn.south.eachSprite(this, this.checkCollision);
    cn.east.eachSprite(this, this.checkCollision);
    cn.west.eachSprite(this, this.checkCollision);
    cn.north.east.eachSprite(this, this.checkCollision);
    cn.north.west.eachSprite(this, this.checkCollision);
    cn.south.east.eachSprite(this, this.checkCollision);
    cn.south.west.eachSprite(this, this.checkCollision);
  };

  this.checkCollision = function (other) {
    if (!other.visible || this == other) return;
    var trans = other.translatedPoints();
    for (var i = 0; i < trans.length/2; i++) {
      var xi = i*2;
      var yi = xi + 1;
      if (this.context.isPointInPath(trans[xi], trans[yi])) {
        this.collision(other);
        other.collision(this);
        return;
      }
    }
  };

  this.collision = function () {
  };

  this.die = function () {
    this.visible = false;
    this.reap = true;
    this.currentNode.leave(this);
    this.currentNode = null;
  };

  this.translatedPoints = function () {
    this.matrix.configure(this.rot, this.scale, this.x, this.y);
    var trans = new Array(this.points.length);
    for (var i = 0; i < this.points.length/2; i++) {
      var xi = i*2;
      var yi = xi + 1;
      var pts = this.matrix.multiply(this.points[xi], this.points[yi], 1);
      trans[xi] = pts[0];
      trans[yi] = pts[1];
    }
    return trans;
  };

};

var Ship = function () {
  this.init("ship",
            [-5,   4,
              0, -12,
              5,   4], 12);

  this.children.exhaust = new Sprite();
  this.children.exhaust.init("exhaust",
                             [-3,  6,
                               0, 11,
                               3,  6]);

  this.visible = true;

  this.bulletCounter = 0;

  this.preMove = function (delta) {
    if (KEY_STATUS.left) {
      this.vel.rot = -5;
    } else if (KEY_STATUS.right) {
      this.vel.rot = 5;
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
        this.bulletCounter = 6;
        for (var i = 0; i < this.bullets.length; i++) {
          if (!this.bullets[i].visible) {
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
    if (other.name == "asteroid") {
      this.die();
    }
  };

};
Ship.prototype = new Sprite();

var Bullet = function () {
  this.init("bullet");
  this.time = 0;

  this.configureTransform = function () {};
  this.draw = function () {
    if (this.visible) {
      this.context.save();
      this.context.lineWidth = 2;
      this.context.beginPath();
      this.context.moveTo(this.x-1, this.y-1);
      this.context.lineTo(this.x+1, this.y+1);
      this.context.moveTo(this.x+1, this.y-1);
      this.context.lineTo(this.x-1, this.y+1);
      this.context.stroke();
      this.context.restore();
    }
  };
  this.preMove = function (delta) {
    if (this.visible) {
      this.time += delta;
    }
    if (this.time > 50) {
      this.visible = false;
      this.time = 0;
    }
  };
  this.collision = function (other) {
    if (other.name == "asteroid") {
      this.time = 0;
      this.visible = false;
      this.currentNode.leave(this);
      this.currentNode = null;
    }
  };
  this.translatedPoints = function () {
    return [this.x, this.y];
  };

};
Bullet.prototype = new Sprite();

var Asteroid = function () {
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
              -4,  -5], 20);

  this.visible = true;
  this.scale = 6;

};
Asteroid.prototype = new Sprite();

var Explosion = function () {
  this.init("explosion");

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

  this.translatedPoints = function () {
    return [this.x, this.y];
  };
};
Explosion.prototype = new Sprite();

var GridNode = function () {
  this.north = null;
  this.south = null;
  this.east  = null;
  this.west  = null;

  this.nextSprite = null;

  this.enter = function (sprite) {
    sprite.nextSprite = this.nextSprite;
    this.nextSprite = sprite;
  };

  this.leave = function (sprite) {
    var ref = this;
    while (ref && (ref.nextSprite != sprite)) {
      ref = ref.nextSprite;
    }
    if (ref) {
      ref.nextSprite = sprite.nextSprite;
      sprite.nextSprite = null;
    }
  };

  this.eachSprite = function(sprite, callback) {
    var ref = this;
    while (ref.nextSprite) {
      ref = ref.nextSprite;
      callback.call(sprite, ref);
    }
  };
};


$(function () {
  var canvas = $("#canvas");
  var canvasWidth  = canvas.width();
  var canvasHeight = canvas.height();

  var context = canvas[0].getContext("2d");

  // + 2 for border
  // we have a GRID_SIZE width border around the outside
  var gridWidth = Math.round(canvasWidth / GRID_SIZE) + 2;
  var gridHeight = Math.round(canvasHeight / GRID_SIZE) + 2;
  var grid = new Array(gridWidth);
  for (var i = 0; i < gridWidth; i++) {
    grid[i] = new Array(gridHeight);
    for (var j = 0; j < gridHeight; j++) {
      grid[i][j] = new GridNode();
    }
  }

  // set up the positional references
  for (var i = 0; i < gridWidth; i++) {
    for (var j = 0; j < gridHeight; j++) {
      var node   = grid[i][j];
      node.north = grid[i][(j == 0) ? gridHeight-1 : j-1];
      node.south = grid[i][(j == gridHeight-1) ? 0 : j+1];
      node.west  = grid[(i == 0) ? gridWidth-1 : i-1][j];
      node.east  = grid[(i == gridWidth-1) ? 0 : i+1][j];
    }
  }

  // so all the sprites can use it
  Sprite.prototype.context = context;
  Sprite.prototype.grid    = grid;
  Sprite.prototype.matrix  = new Matrix(3, 3);

  var sprites = [];

  var wrapPostMove = function () {
    if (this.x - GRID_SIZE > canvasWidth) {
      this.x = -GRID_SIZE;
    } else if (this.x + GRID_SIZE < 0) {
      this.x = canvasWidth + GRID_SIZE;
    }
    if (this.y - GRID_SIZE > canvasHeight) {
      this.y = -GRID_SIZE;
    } else if (this.y + GRID_SIZE < 0) {
      this.y = canvasHeight + GRID_SIZE;
    }
  };

  Ship.prototype.postMove     = wrapPostMove;
  Bullet.prototype.postMove   = wrapPostMove;
  Asteroid.prototype.postMove = wrapPostMove;

  Asteroid.prototype.collision = function (other) {
    if (other.name == "ship" ||
        other.name == "bullet") {
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
          sprites.push(roid);
        }
      }
      var splosion = new Explosion();
      splosion.x = other.x;
      splosion.y = other.y;
      splosion.visible = true;
      sprites.push(splosion);
      this.die();
    }
  };

  var ship = new Ship();

  ship.x = canvasWidth / 2;
  ship.y = canvasHeight / 2;

  sprites.push(ship);

  ship.bullets = [];
  for (var i = 0; i < 10; i++) {
    var bull = new Bullet();
    ship.bullets.push(bull);
    sprites.push(bull);
  }

  for (var i = 0; i < 3; i++) {
    var roid = new Asteroid();
    roid.x = Math.random() * canvasWidth;
    roid.y = Math.random() * canvasHeight;
    roid.vel.x = Math.random() * 4 - 2;
    roid.vel.y = Math.random() * 4 - 2;
    if (Math.random() > 0.5) {
      roid.points.reverse();
    }
    roid.vel.rot = Math.random() * 2 - 1;
    sprites.push(roid);
  }

  context.font = "18px Ariel";
  context.textAlign = "right";

  var i, j = 0;
  var showFramerate = false;
  var avgFramerate = 30;

  var lastFrame = new Date();
  var thisFrame;
  var elapsed;
  var delta;

  var mainLoop = function () {
    context.clearRect(0, 0, canvasWidth, canvasHeight);

    if (KEY_STATUS.g) {
      context.beginPath();
      for (var i = 0; i < gridWidth; i++) {
        context.moveTo(i * GRID_SIZE, 0);
        context.lineTo(i * GRID_SIZE, canvasHeight);
      }
      for (var j = 0; j < gridHeight; j++) {
        context.moveTo(0, j * GRID_SIZE);
        context.lineTo(canvasWidth, j * GRID_SIZE);
      }
      context.closePath();
      context.stroke();
    }

    thisFrame = new Date();
    elapsed = thisFrame - lastFrame;
    lastFrame = thisFrame;
    delta = elapsed / 30;

    for (i = 0; i < sprites.length; i++) {

      sprites[i].run(delta);

      if (sprites[i].reap) {
        sprites.splice(i, 1);
        i--;
      }
    }

    if (showFramerate) {
      avgFramerate = Math.round((avgFramerate * 9 + (1000 / elapsed))
                                / 10);
      context.fillText(avgFramerate, canvasWidth - 2, canvasHeight - 2);
    }
  };

  var mainLoopId = setInterval(mainLoop, 10);

  $(window).keydown(function (e) {
    if (KEY_CODES[e.keyCode] == 'f') {
      showFramerate = !showFramerate;
    }
  });

  canvas.click(function () {
    if (mainLoopId) {
      clearInterval(mainLoopId);
      mainLoopId = null;
    } else {
      lastFrame = new Date();
      mainLoopId = setInterval(mainLoop, 10);
    }
  });
});
