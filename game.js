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

Sprite = function (context, name, points, diameter) {
  this.context   = context;
  this.name     = name;
  this.points   = points;
  this.diameter = diameter || 1;

  this.children = {};

  this.visible = false;
  this.reap    = false;

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

  this.run = function(delta) {
    context.save();

    this.move(delta);
    this.configureTransform();
    this.draw();

    context.restore();
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

    context.translate(this.x, this.y);
    context.rotate(rad);
    context.scale(this.scale, this.scale);
  };

  this.draw = function () {
    if (!this.visible) return;

    context.lineWidth = 1.0 / this.scale;

    context.beginPath();

    context.moveTo(this.points[0], this.points[1]);
    for (var i = 1; i < this.points.length/2; i++) {
      var xi = i*2;
      var yi = xi + 1;
      context.lineTo(this.points[xi], this.points[yi]);
    }

    context.closePath();
    context.stroke();

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

var spriteDefs = {
  ship: function (context) {
    var ship = new Sprite(context,
                          "ship",
                          [-5,   4,
                            0, -12,
                            5,   4], 12);

    ship.children.exhaust = new Sprite(context,
                                       "exhaust",
                                       [-3,  6,
                                         0, 11,
                                         3,  6]);

    ship.visible = true;

    ship.bulletCounter = 0;

    ship.collision = function (other) {
      if (other.name == "asteroid") {
        this.visible = false;
      }
    };

    return ship;
  },
  bullet: function (context) {
    var bullet = new Sprite(context, "bullet");
    bullet.time = 0;

    bullet.configureTransform = function () {};
    bullet.draw = function () {
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
    bullet.preMove = function (delta) {
      if (this.visible) {
        this.time += delta;
      }
      if (this.time > 50) {
        this.visible = false;
        this.time = 0;
      }
    };
    bullet.collision = function (other) {
      if (other.name == "asteroid") {
        this.visible = false;
        this.time = 0;
      }
    };

    return bullet;
  },
  asteroid: function (context) {
    var asteroid = new Sprite(context,
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

    asteroid.visible = true;
    asteroid.scale = 6;

    return asteroid;
  },
  explosion: function (context) {
    var explosion = new Sprite(context, "explosion");

    explosion.lines = [];
    for (var i = 0; i < 5; i++) {
      var rad = 2 * Math.PI * Math.random();
      var x = Math.cos(rad);
      var y = Math.sin(rad);
      explosion.lines.push([x, y, x*2, y*2]);
    }

    explosion.draw = function () {
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

    explosion.preMove = function (delta) {
      if (this.visible) {
        this.scale += delta;
      }
      if (this.scale > 8) {
        this.visible = false;
        this.reap = true;
      }
    };

    return explosion;
  }
};


$(function () {
  var canvas = $("#canvas");
  var canvasWidth  = canvas.width();
  var canvasHeight = canvas.height();

  var context = canvas[0].getContext("2d");

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
  };

  var ship      = spriteDefs.ship(context);
  var bullet    = spriteDefs.bullet(context);
  var asteroid  = spriteDefs.asteroid(context);

  ship.postMove     = wrapPostMove;
  bullet.postMove   = wrapPostMove;
  asteroid.postMove = wrapPostMove;

  ship.x = canvasWidth / 2;
  ship.y = canvasHeight / 2;

  asteroid.collision = function (other) {
    if (other.name == "ship" ||
        other.name == "bullet") {
      this.scale /= 3;
      if (this.scale < 0.5) {
        this.visible = false;
        this.reap = true;
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
      var splosion = spriteDefs.explosion(context);
      splosion.x = other.x;
      splosion.y = other.y;
      splosion.visible = true;
      sprites.push(splosion);
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

  ship.preMove = function (delta) {
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

  var i, j = 0;
  var showFramerate = false;
  var avgFramerate = 30;
  var framerate = $('#framerate');

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
      framerate.text(avgFramerate);
    }

  };

  var mainLoopId = setInterval(mainLoop, 10);

  $(window).keydown(function (e) {
    if (KEY_CODES[e.keyCode] == 'f') {
      showFramerate = !showFramerate;
      if (!showFramerate) {
        framerate.text('');
      }
    }
  });

  canvas.click(function () {
    clearInterval(mainLoopId);
  });
});
