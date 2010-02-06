KEY_CODES = {
  32: 'space',
  37: 'left',
  38: 'up',
  39: 'right',
  70: 'f',
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

Array.prototype.convertToPolyline = function () {
  var pairCount = this.length/2;
  var x = new Array(pairCount);
  var y = new Array(pairCount);
  for (var i = 0; i < pairCount; i++) {
    x[i] = this[i*2];
    y[i] = this[i*2+1];
  }
  return [x, y];
};

Matrix = function (rows, columns) {
  var i, j;
  this.data = new Array(rows);
  for (i = 0; i < rows; i++) {
    this.data[i] = new Array(columns);
  }

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

matrix = new Matrix(3, 3);

Sprite = function (canvas, name, points, diameter) {
  this.canvas   = canvas;
  this.name     = name;
  this.points   = points;
  this.diameter = diameter || 1;

  this.children = {};

  this.visible = false;

  this.x     = 0;
  this.y     = 0;
  this.rot   = 0;
  this.scale = 1;

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

  this.preMove = null;
  this.postMove = null;

  this.run = function() {
    this.move();
    this.configureMatrix();
    this.draw();
  };

  this.move = function () {
    if (!this.visible) return;

    if ($.isFunction(this.preMove)) {
      this.preMove();
    }

    this.vel.x += this.acc.x;
    this.vel.y += this.acc.y;
    this.x += this.vel.x;
    this.y += this.vel.y;
    this.rot += this.vel.rot;
    if (this.rot > 360) {
      this.rot -= 360;
    } else if (this.rot < 0) {
      this.rot += 360;
    }

    if ($.isFunction(this.postMove)) {
      this.postMove();
    }
  };

  this.configureMatrix = function () {
    if (!this.visible) return;

    var rad = (this.rot * Math.PI)/180;
    var sin = Math.sin(rad) * this.scale;
    var cos = Math.cos(rad) * this.scale;
    matrix.set(cos, -sin, this.x,
               sin,  cos, this.y,
                 0,    0,      1);
  };

  this.draw = function () {
    if (!this.visible) return;

    var ret = new Array(this.points.length);
    for (var i = 0; i < this.points.length/2; i++) {
      var xi = i*2;
      var yi = xi + 1;
      var vector = matrix.multiply(this.points[xi], this.points[yi], 1);
      ret[xi] = vector[0];
      ret[yi] = vector[1];
    }

    canvas.drawPolyline.apply(canvas, ret.convertToPolyline());

    for (child in this.children) {
      this.children[child].draw();
    }
  };

  this.checkCollision = function (other) {
    if (!this.visible || !other.visible) return;
    var dist = Math.sqrt(Math.pow(other.x - this.x, 2) + Math.pow(other.y - this.y, 2));
    if (dist < this.diameter * this.scale * 0.5 + other.diameter * other.scale * 0.5) {
      this.collision(other);
      other.collision(this);
    }
  };

  this.collision = function () {
  };

};


$(function () {
  var canvas = $("#canvas");
  var canvasWidth  = canvas.width();
  var canvasHeight = canvas.height();

  var sprites = [];

  var wrapPostMove = function () {
    var buffer = this.scale * this.diameter;
    if (this.x - buffer > canvasWidth) {
      this.x = -buffer;
    } else if (this.x + buffer < 0) {
      this.x = canvasWidth + buffer;
    }
    if (this.y - buffer > canvasHeight) {
      this.y = -buffer;
    } else if (this.y + buffer < 0) {
      this.y = canvasHeight + buffer;
    }
  }

  var ship = new Sprite(canvas,
                        "ship",
                        [-5,   4,
                          0, -12,
                          5,   4,
                         -5,   4], 12);

  ship.children.exhaust = new Sprite(canvas,
                                     "exhaust",
                                     [-3,  6,
                                       0, 11,
                                       3,  6,
                                      -3,  6]);

  ship.x = canvasWidth / 2;
  ship.y = canvasHeight / 2;

  ship.visible = true;

  ship.collision = function (other) {
    if (other.name == "asteroid") {
      this.visible = false;
    }
  };

  var bullet = new Sprite(canvas, "bullet");
  bullet.time = 0;

  bullet.configureMatrix = function () {};
  bullet.draw = function () {
    if (this.visible) {
      canvas.fillEllipse(this.x-1, this.y-1, 2, 2);
    }
  };
  bullet.preMove = function () {
    if (this.visible) {
      this.time++;
    }
    if (this.time > 50) {
      this.visible = false;
      this.time = 0;
    }
  };
  bullet.postMove = wrapPostMove;
  bullet.collision = function (other) {
    if (other.name == "asteroid") {
      this.visible = false;
      this.time = 0;
    }
  };

  var asteroid = new Sprite(canvas,
                            "asteroid",
                            [-10,   0,
                              -5,   7,
                              -3,   4,
                               1,  10,
                               5,   4,
                              10,   0,
                               5,  -6,
                               2, -10,
                              -4, -10,
                              -4,  -5,
                             -10,   0], 20);

  asteroid.visible = true;
  asteroid.scale = 4;
  asteroid.postMove = wrapPostMove;
  asteroid.collision = function (other) {
    if (other.name == "asteroid") return;
    this.scale /= 2;
    if (this.scale < 0.5) {
      this.visible = false;
    } else {
      // break into fragments
      for (var i = 0; i < 2; i++) {
        var roid = $.extend(true, {}, this);
        roid.vel.x = Math.random() * 6 - 3;
        roid.vel.y = Math.random() * 6 - 3;
        if (Math.random() > 0.5) {
          roid.points.reverse();
        }
        roid.vel.rot = Math.random() * 2 - 1;
        sprites.push(roid);
      }
    }
  };

  sprites.push(ship);
  sprites.push(bullet);

  ship.bullets = [bullet];
  for (var i = 0; i < 9; i++) {
    var bull = $.extend(true, {}, bullet);
    ship.bullets.push(bull);
    sprites.push(bull);
  }

  for (var i = 0; i < 3; i++) {
    var roid = $.extend(true, {}, asteroid);
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

  ship.bulletCounter = 0;

  ship.preMove = function () {
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
      this.bulletCounter--;
    }
    if (KEY_STATUS.space) {
      if (this.bulletCounter == 0) {
        this.bulletCounter = 5;
        for (var i = 0; i < ship.bullets.length; i++) {
          if (!ship.bullets[i].visible) {
            var bullet = ship.bullets[i];
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
    if (Math.sqrt(ship.vel.x * ship.vel.x + ship.vel.y * ship.vel.y) > 8) {
      ship.vel.x *= 0.95;
      ship.vel.y *= 0.95;
    }
  };

  ship.postMove = wrapPostMove;

  var i, j = 0;
  var framecounter = 0;
  var framerate = $('#framerate');

  var mainLoop = setInterval(function () {
    framecounter++;
    canvas.fillRect(0, 0, canvasWidth, canvasHeight, {color:'white'});

    for (i = 0; i < sprites.length; i++) {

      sprites[i].run();

      for (j = 0; j < sprites.length; j++) {
        if (i != j && sprites[i].name != sprites[j].name) {
          sprites[i].checkCollision(sprites[j]);
        }
      }
    }
  }, 25);

  setInterval(function () {
    framerate.text(framecounter);
    framecounter = 0;
  }, 1000);

  canvas.click(function () {
    clearInterval(mainLoop);
  });
});
