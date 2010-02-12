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

Sprite = function () {
  this.init = function (context, name, points, diameter) {
    this.context   = context;
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

  this.preMove = null;
  this.postMove = null;

  this.run = function(delta) {
    this.context.save();

    this.move(delta);
    this.configureTransform();
    this.draw();

    this.context.restore();
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

var Ship = function (context) {
  this.init(context,
            "ship",
            [-5,   4,
              0, -12,
              5,   4], 12);

  this.children.exhaust = new Sprite();
  this.children.exhaust.init(context,
                             "exhaust",
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
      this.visible = false;
    }
  };

};
Ship.prototype = new Sprite();

var Bullet = function (context) {
  this.init(context, "bullet");
  this.time = 0;

  this.configureTransform = function () {};
  this.draw = function () {
    if (this.visible) {
      context.save();
      context.lineWidth = 2;
      context.beginPath();
      context.moveTo(this.x-1, this.y-1);
      context.lineTo(this.x+1, this.y+1);
      context.moveTo(this.x+1, this.y-1);
      context.lineTo(this.x-1, this.y+1);
      context.stroke();
      context.restore();
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
      this.visible = false;
      this.time = 0;
    }
  };

};
Bullet.prototype = new Sprite();

var Asteroid = function (context) {
  this.init(context,
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
              -4,  -5], 20);

  this.visible = true;
  this.scale = 6;

};
Asteroid.prototype = new Sprite();

var Explosion = function (context) {
  this.init(context, "explosion");

  this.lines = [];
  for (var i = 0; i < 5; i++) {
    var rad = 2 * Math.PI * Math.random();
    var x = Math.cos(rad);
    var y = Math.sin(rad);
    this.lines.push([x, y, x*2, y*2]);
  }

  this.draw = function () {
    if (this.visible) {
      context.save();
      context.lineWidth = 1.0 / this.scale;
      context.beginPath();
      for (var i = 0; i < 5; i++) {
        var line = this.lines[i];
        context.moveTo(line[0], line[1]);
        context.lineTo(line[2], line[3]);
      }
      context.stroke();
      context.restore();
    }
  };

  this.preMove = function (delta) {
    if (this.visible) {
      this.scale += delta;
    }
    if (this.scale > 8) {
      this.visible = false;
      this.reap = true;
    }
  };

};
Explosion.prototype = new Sprite();


$(function () {
  var canvas = $("#canvas");
  var canvasWidth  = canvas.width();
  var canvasHeight = canvas.height();

  var context = canvas[0].getContext("2d");

  var sprites = [];

  var wrapPostMove = function () {
    var buffer = 60; // half an asteroid
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
      this.visible = false;
      this.reap = true;
      var splosion = new Explosion(context);
      splosion.x = other.x;
      splosion.y = other.y;
      splosion.visible = true;
      sprites.push(splosion);
    }
  };

  var ship = new Ship(context);

  ship.x = canvasWidth / 2;
  ship.y = canvasHeight / 2;

  sprites.push(ship);

  ship.bullets = [];
  for (var i = 0; i < 10; i++) {
    var bull = new Bullet(context);
    ship.bullets.push(bull);
    sprites.push(bull);
  }

  for (var i = 0; i < 3; i++) {
    var roid = new Asteroid(context);
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

    thisFrame = new Date();
    elapsed = thisFrame - lastFrame;
    lastFrame = thisFrame;
    delta = elapsed / 30;

    for (i = 0; i < sprites.length; i++) {

      sprites[i].run(delta);

      for (j = 0; j < sprites.length; j++) {
        if (i != j && sprites[i].name != sprites[j].name) {
          sprites[i].checkCollision(sprites[j]);
        }
      }

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
    clearInterval(mainLoopId);
  });
});
