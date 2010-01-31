KEY_CODES = {
  32: 'space',
  37: 'left',
  38: 'up',
  39: 'right',
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

Sprite = function (canvas, points) {
  this.canvas = canvas;
  this.points = points;
  this.children = {};

  this.visible = false;

  this.x = 0;
  this.y = 0;
  this.rot = 0;

  this.vel = {
    x: 0,
    y: 0
  };
  this.vrot = 0;

  this.acc = {
    x: 0,
    y: 0
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
    this.rot += this.vrot;
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
    var sin = Math.sin(rad);
    var cos = Math.cos(rad);
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

};


$(function () {
  var canvas = $("#canvas");
  var canvasWidth  = canvas.width();
  var canvasHeight = canvas.height();

  var sprites = [];

  var ship = new Sprite(canvas, [-5,   4,
                                  0, -12,
                                  5,   4,
                                 -5,   4]);

  ship.children.exhaust = new Sprite(canvas, [-3,  6,
                                               0, 11,
                                               3,  6,
                                              -3,  6]);

  ship.x = canvasWidth / 2;
  ship.y = canvasHeight / 2;

  ship.visible = true;

  var bullet = new Sprite(canvas, []);

  bullet.configureMatrix = function () {};
  bullet.draw = function () {
    canvas.fillEllipse(this.x, this.y, 2, 2);
  };
  bullet.postMove = function () {
    if (this.x >= canvasWidth || this.x <= 0 ||
        this.y >= canvasHeight || this.y <= 0) {
      this.visible = false;
    }
  };

  sprites.push(ship);

  bullets = [];
  for (var i = 0; i < 10; i++) {
    var bull = $.extend(true, {}, bullet);
    bullets.push(bull)
    sprites.push(bull);
  }

  var spaceCounter = 0;

  ship.preMove = function () {
    if (KEY_STATUS.left) {
      ship.vrot = -5;
    } else if (KEY_STATUS.right) {
      ship.vrot = 5;
    } else {
      ship.vrot = 0;
    }

    if (KEY_STATUS.up) {
      var rad = ((ship.rot-90) * Math.PI)/180;
      ship.acc.x = 0.5 * Math.cos(rad);
      ship.acc.y = 0.5 * Math.sin(rad);
      ship.children.exhaust.visible = Math.random() > 0.1;
    } else {
      ship.acc.x = 0;
      ship.acc.y = 0;
      ship.children.exhaust.visible = false;
    }

    if (KEY_STATUS.space) {
      spaceCounter++;
      if (spaceCounter > 5) {
        spaceCounter = 0;
        for (var i = 0; i < bullets.length; i++) {
          if (!bullets[i].visible) {
            var rad = ((ship.rot-90) * Math.PI)/180;
            bullets[i].x = ship.x;
            bullets[i].y = ship.y;
            bullets[i].vel.x = 6 * Math.cos(rad) + ship.vel.x;
            bullets[i].vel.y = 6 * Math.sin(rad) + ship.vel.y;
            bullets[i].visible = true;
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

  ship.postMove = function () {
    if (ship.x >= canvasWidth || ship.x <= 0) {
      ship.vel.x = -ship.vel.x
    }
    if (ship.y >= canvasHeight || ship.y <= 0) {
      ship.vel.y = -ship.vel.y
    }
  };

  var i = 0;
  var mainLoop = setInterval(function () {
    canvas.fillRect(0, 0, canvasWidth, canvasHeight, {color:'white'});

    for (i = 0; i < sprites.length; i++) {
      sprites[i].run();
    }
  }, 25);

  canvas.click(function () {
    clearInterval(mainLoop);
  });
});
