var supportsvg = detectSVG();
/*if ( !results.support && results.builtin )
	alert( "You need to enable SVG support first!" );
else if ( !results.support )
	alert( "You need a browser with SVG support" );
else if ( results.native == "Opera" && results.builtinVersion < 9 )
	alert( "Opera 8 is not compatible with this program.. please upgrade Opera to at least version 9" );
else if ( results.support == "Plugin" && !results.IID )
	alert( "Please disable the " + results.plugin + " SVG plugin as it is not compatible with this software for this browser" );
else	alert( "Success! Starting the application.." );
*/


//explorercanvas, patch for canvas on ie (http://code.google.com/p/explorercanvas/)
if (/*(!window.CanvasRenderingContext2D) && */(jQuery.browser.msie)){

if(!window.CanvasRenderingContext2D)
{(function () {

  // alias some functions to make (compiled) code shorter
  var m = Math;
  var mr = m.round;
  var ms = m.sin;
  var mc = m.cos;

  // this is used for sub pixel precision
  var Z = 10;
  var Z2 = Z / 2;

  var G_vmlCanvasManager_ = {
    init: function (opt_doc) {
      var doc = opt_doc || document;
      if (/MSIE/.test(navigator.userAgent) && !window.opera) {
        var self = this;
        doc.attachEvent("onreadystatechange", function () {
          self.init_(doc);
        });
      }
    },

    init_: function (doc) {
      if (doc.readyState == "complete") {
        // create xmlns
        if (!doc.namespaces["g_vml_"]) {
          doc.namespaces.add("g_vml_", "urn:schemas-microsoft-com:vml");
        }

        // setup default css
        var ss = doc.createStyleSheet();
        ss.cssText = "canvas{display:inline-block;overflow:hidden;" +
            // default size is 300x150 in Gecko and Opera
            "text-align:left;width:300px;height:150px}" +
            "g_vml_\\:*{behavior:url(#default#VML)}";

        // find all canvas elements
	var listedivs = $(".canvas").get();
	 for (var i = 0; i < listedivs.length; i++) {
         var newNode = document.createElement("canvas");
		newNode.style.width  = $(listedivs[i]).css('width');
		newNode.style.height =  $(listedivs[i]).css('height');
		listedivs[i].appendChild(newNode);
          }
	
	var els = $(".canvas").find("canvas").get();
        for (var i = 0; i < els.length; i++) {
	
		
          if (!els[i].getContext) {
            this.initElement(els[i]);
          }
        }
      }
    },

    fixElement_: function (el) {
      // in IE before version 5.5 we would need to add HTML: to the tag name
      // but we do not care about IE before version 6
      var outerHTML = el.outerHTML;

      var newEl = el.ownerDocument.createElement(outerHTML);
      // if the tag is still open IE has created the children as siblings and
      // it has also created a tag with the name "/FOO"
      if (outerHTML.slice(-2) != "/>") {
        var tagName = "/" + el.tagName;
        var ns;
        // remove content
        while ((ns = el.nextSibling) && ns.tagName != tagName) {
          ns.removeNode();
        }
        // remove the incorrect closing tag
        if (ns) {
          ns.removeNode();
        }
      }
      el.parentNode.replaceChild(newEl, el);
      return newEl;
    },

    /**
     * Public initializes a canvas element so that it can be used as canvas
     * element from now on. This is called automatically before the page is
     * loaded but if you are creating elements using createElement you need to
     * make sure this is called on the element.
     * @param {HTMLElement} el The canvas element to initialize.
     * @return {HTMLElement} the element that was created.
     */
    initElement: function (el) {
      el = this.fixElement_(el);
      el.getContext = function () {
        if (this.context_) {
          return this.context_;
        }
        return this.context_ = new CanvasRenderingContext2D_(this);
      };

      // do not use inline function because that will leak memory
      el.attachEvent('onpropertychange', onPropertyChange);
      el.attachEvent('onresize', onResize);

      var attrs = el.attributes;
      if (attrs.width && attrs.width.specified) {
        // TODO: use runtimeStyle and coordsize
        // el.getContext().setWidth_(attrs.width.nodeValue);
        el.style.width = attrs.width.nodeValue + "px";
      } else {
        el.width = el.clientWidth;
      }
      if (attrs.height && attrs.height.specified) {
        // TODO: use runtimeStyle and coordsize
        // el.getContext().setHeight_(attrs.height.nodeValue);
        el.style.height = attrs.height.nodeValue + "px";
      } else {
        el.height = el.clientHeight;
      }
      //el.getContext().setCoordsize_()
      return el;
    }
  };

  function onPropertyChange(e) {
    var el = e.srcElement;

    switch (e.propertyName) {
      case 'width':
        el.style.width = el.attributes.width.nodeValue + "px";
        el.getContext().clearRect();
        break;
      case 'height':
        el.style.height = el.attributes.height.nodeValue + "px";
        el.getContext().clearRect();
        break;
    }
  }

  function onResize(e) {
    var el = e.srcElement;
    if (el.firstChild) {
      el.firstChild.style.width =  el.clientWidth + 'px';
      el.firstChild.style.height = el.clientHeight + 'px';
    }
  }

  G_vmlCanvasManager_.init();

  // precompute "00" to "FF"
  var dec2hex = [];
  for (var i = 0; i < 16; i++) {
    for (var j = 0; j < 16; j++) {
      dec2hex[i * 16 + j] = i.toString(16) + j.toString(16);
    }
  }

  function createMatrixIdentity() {
    return [
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1]
    ];
  }

  function matrixMultiply(m1, m2) {
    var result = createMatrixIdentity();

    for (var x = 0; x < 3; x++) {
      for (var y = 0; y < 3; y++) {
        var sum = 0;

        for (var z = 0; z < 3; z++) {
          sum += m1[x][z] * m2[z][y];
        }

        result[x][y] = sum;
      }
    }
    return result;
  }

  function copyState(o1, o2) {
    o2.fillStyle     = o1.fillStyle;
    o2.lineCap       = o1.lineCap;
    o2.lineJoin      = o1.lineJoin;
    o2.lineWidth     = o1.lineWidth;
    o2.miterLimit    = o1.miterLimit;
    o2.shadowBlur    = o1.shadowBlur;
    o2.shadowColor   = o1.shadowColor;
    o2.shadowOffsetX = o1.shadowOffsetX;
    o2.shadowOffsetY = o1.shadowOffsetY;
    o2.strokeStyle   = o1.strokeStyle;
    o2.arcScaleX_    = o1.arcScaleX_;
    o2.arcScaleY_    = o1.arcScaleY_;
  }

  function processStyle(styleString) {
    var str, alpha = 1;

    styleString = String(styleString);
    if (styleString.substring(0, 3) == "rgb") {
      var start = styleString.indexOf("(", 3);
      var end = styleString.indexOf(")", start + 1);
      var guts = styleString.substring(start + 1, end).split(",");

      str = "#";
      for (var i = 0; i < 3; i++) {
        str += dec2hex[Number(guts[i])];
      }

      if ((guts.length == 4) && (styleString.substr(3, 1) == "a")) {
        alpha = guts[3];
      }
    } else {
      str = styleString;
    }

    return [str, alpha];
  }

  function processLineCap(lineCap) {
    switch (lineCap) {
      case "butt":
        return "flat";
      case "round":
        return "round";
      case "square":
      default:
        return "square";
    }
  }

  /**
   * This class implements CanvasRenderingContext2D interface as described by
   * the WHATWG.
   * @param {HTMLElement} surfaceElement The element that the 2D context should
   * be associated with
   */
   function CanvasRenderingContext2D_(surfaceElement) {
    this.m_ = createMatrixIdentity();

    this.mStack_ = [];
    this.aStack_ = [];
    this.currentPath_ = [];

    // Canvas context properties
    this.strokeStyle = "#000";
    this.fillStyle = "#000";

    this.lineWidth = 1;
    this.lineJoin = "miter";
    this.lineCap = "butt";
    this.miterLimit = Z * 1;
    this.globalAlpha = 1;
    this.canvas = surfaceElement;

    var el = surfaceElement.ownerDocument.createElement('div');
    el.style.width =  surfaceElement.clientWidth + 'px';
    el.style.height = surfaceElement.clientHeight + 'px';
    el.style.overflow = 'hidden';
    el.style.position = 'absolute';
    surfaceElement.appendChild(el);

    this.element_ = el;
    this.arcScaleX_ = 1;
    this.arcScaleY_ = 1;
  };

  var contextPrototype = CanvasRenderingContext2D_.prototype;
  contextPrototype.clearRect = function() {
    this.element_.innerHTML = "";
    this.currentPath_ = [];
  };

  contextPrototype.beginPath = function() {
    // TODO: Branch current matrix so that save/restore has no effect
    //       as per safari docs.

    this.currentPath_ = [];
  };

  contextPrototype.moveTo = function(aX, aY) {
    this.currentPath_.push({type: "moveTo", x: aX, y: aY});
    this.currentX_ = aX;
    this.currentY_ = aY;
  };

  contextPrototype.lineTo = function(aX, aY) {
    this.currentPath_.push({type: "lineTo", x: aX, y: aY});
    this.currentX_ = aX;
    this.currentY_ = aY;
  };

  contextPrototype.bezierCurveTo = function(aCP1x, aCP1y,
                                            aCP2x, aCP2y,
                                            aX, aY) {
    this.currentPath_.push({type: "bezierCurveTo",
                           cp1x: aCP1x,
                           cp1y: aCP1y,
                           cp2x: aCP2x,
                           cp2y: aCP2y,
                           x: aX,
                           y: aY});
    this.currentX_ = aX;
    this.currentY_ = aY;
  };

  contextPrototype.quadraticCurveTo = function(aCPx, aCPy, aX, aY) {
    // the following is lifted almost directly from
    // http://developer.mozilla.org/en/docs/Canvas_tutorial:Drawing_shapes
    var cp1x = this.currentX_ + 2.0 / 3.0 * (aCPx - this.currentX_);
    var cp1y = this.currentY_ + 2.0 / 3.0 * (aCPy - this.currentY_);
    var cp2x = cp1x + (aX - this.currentX_) / 3.0;
    var cp2y = cp1y + (aY - this.currentY_) / 3.0;
    this.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, aX, aY);
  };

  contextPrototype.arc = function(aX, aY, aRadius,
                                  aStartAngle, aEndAngle, aClockwise) {
    aRadius *= Z;
    var arcType = aClockwise ? "at" : "wa";

    var xStart = aX + (mc(aStartAngle) * aRadius) - Z2;
    var yStart = aY + (ms(aStartAngle) * aRadius) - Z2;

    var xEnd = aX + (mc(aEndAngle) * aRadius) - Z2;
    var yEnd = aY + (ms(aEndAngle) * aRadius) - Z2;

    // IE won't render arches drawn counter clockwise if xStart == xEnd.
    if (xStart == xEnd && !aClockwise) {
      xStart += 0.125; // Offset xStart by 1/80 of a pixel. Use something
                       // that can be represented in binary
    }

    this.currentPath_.push({type: arcType,
                           x: aX,
                           y: aY,
                           radius: aRadius,
                           xStart: xStart,
                           yStart: yStart,
                           xEnd: xEnd,
                           yEnd: yEnd});

  };

  contextPrototype.rect = function(aX, aY, aWidth, aHeight) {
    this.moveTo(aX, aY);
    this.lineTo(aX + aWidth, aY);
    this.lineTo(aX + aWidth, aY + aHeight);
    this.lineTo(aX, aY + aHeight);
    this.closePath();
  };

  contextPrototype.strokeRect = function(aX, aY, aWidth, aHeight) {
    // Will destroy any existing path (same as FF behaviour)
    this.beginPath();
    this.moveTo(aX, aY);
    this.lineTo(aX + aWidth, aY);
    this.lineTo(aX + aWidth, aY + aHeight);
    this.lineTo(aX, aY + aHeight);
    this.closePath();
    this.stroke();
  };

  contextPrototype.fillRect = function(aX, aY, aWidth, aHeight) {
    // Will destroy any existing path (same as FF behaviour)
    this.beginPath();
    this.moveTo(aX, aY);
    this.lineTo(aX + aWidth, aY);
    this.lineTo(aX + aWidth, aY + aHeight);
    this.lineTo(aX, aY + aHeight);
    this.closePath();
    this.fill();
  };

  contextPrototype.createLinearGradient = function(aX0, aY0, aX1, aY1) {
    var gradient = new CanvasGradient_("gradient");
    return gradient;
  };

  contextPrototype.createRadialGradient = function(aX0, aY0,
                                                   aR0, aX1,
                                                   aY1, aR1) {
    var gradient = new CanvasGradient_("gradientradial");
    gradient.radius1_ = aR0;
    gradient.radius2_ = aR1;
    gradient.focus_.x = aX0;
    gradient.focus_.y = aY0;
    return gradient;
  };

  contextPrototype.drawImage = function (image, var_args) {
    var dx, dy, dw, dh, sx, sy, sw, sh;

    // to find the original width we overide the width and height
    var oldRuntimeWidth = image.runtimeStyle.width;
    var oldRuntimeHeight = image.runtimeStyle.height;
    image.runtimeStyle.width = 'auto';
    image.runtimeStyle.height = 'auto';

    // get the original size
    var w = image.width;
    var h = image.height;

    // and remove overides
    image.runtimeStyle.width = oldRuntimeWidth;
    image.runtimeStyle.height = oldRuntimeHeight;

    if (arguments.length == 3) {
      dx = arguments[1];
      dy = arguments[2];
      sx = sy = 0;
      sw = dw = w;
      sh = dh = h;
    } else if (arguments.length == 5) {
      dx = arguments[1];
      dy = arguments[2];
      dw = arguments[3];
      dh = arguments[4];
      sx = sy = 0;
      sw = w;
      sh = h;
    } else if (arguments.length == 9) {
      sx = arguments[1];
      sy = arguments[2];
      sw = arguments[3];
      sh = arguments[4];
      dx = arguments[5];
      dy = arguments[6];
      dw = arguments[7];
      dh = arguments[8];
    } else {
      throw "Invalid number of arguments";
    }

    var d = this.getCoords_(dx, dy);

    var w2 = sw / 2;
    var h2 = sh / 2;

    var vmlStr = [];

    var W = 10;
    var H = 10;

    // For some reason that I've now forgotten, using divs didn't work
    vmlStr.push(' <g_vml_:group',
                ' coordsize="', Z * W, ',', Z * H, '"',
                ' coordorigin="0,0"' ,
                ' style="width:', W, ';height:', H, ';position:absolute;');

    // If filters are necessary (rotation exists), create them
    // filters are bog-slow, so only create them if abbsolutely necessary
    // The following check doesn't account for skews (which don't exist
    // in the canvas spec (yet) anyway.

    if (this.m_[0][0] != 1 || this.m_[0][1]) {
      var filter = [];

      // Note the 12/21 reversal
      filter.push("M11='", this.m_[0][0], "',",
                  "M12='", this.m_[1][0], "',",
                  "M21='", this.m_[0][1], "',",
                  "M22='", this.m_[1][1], "',",
                  "Dx='", mr(d.x / Z), "',",
                  "Dy='", mr(d.y / Z), "'");

      // Bounding box calculation (need to minimize displayed area so that
      // filters don't waste time on unused pixels.
      var max = d;
      var c2 = this.getCoords_(dx + dw, dy);
      var c3 = this.getCoords_(dx, dy + dh);
      var c4 = this.getCoords_(dx + dw, dy + dh);

      max.x = Math.max(max.x, c2.x, c3.x, c4.x);
      max.y = Math.max(max.y, c2.y, c3.y, c4.y);

      vmlStr.push("padding:0 ", mr(max.x / Z), "px ", mr(max.y / Z),
                  "px 0;filter:progid:DXImageTransform.Microsoft.Matrix(",
                  filter.join(""), ", sizingmethod='clip');")
    } else {
      vmlStr.push("top:", mr(d.y / Z), "px;left:", mr(d.x / Z), "px;")
    }

    vmlStr.push(' ">' ,
                '<g_vml_:image src="', image.src, '"',
                ' style="width:', Z * dw, ';',
                ' height:', Z * dh, ';"',
                ' cropleft="', sx / w, '"',
                ' croptop="', sy / h, '"',
                ' cropright="', (w - sx - sw) / w, '"',
                ' cropbottom="', (h - sy - sh) / h, '"',
                ' />',
                '</g_vml_:group>');

    this.element_.insertAdjacentHTML("BeforeEnd",
                                    vmlStr.join(""));
  };

  contextPrototype.stroke = function(aFill) {
    var lineStr = [];
    var lineOpen = false;
    var a = processStyle(aFill ? this.fillStyle : this.strokeStyle);
    var color = a[0];
    var opacity = a[1] * this.globalAlpha;

    var W = 10;
    var H = 10;

    lineStr.push('<g_vml_:shape',
                 ' fillcolor="', color, '"',
                 ' filled="', Boolean(aFill), '"',
                 ' style="position:absolute;width:', W, ';height:', H, ';"',
                 ' coordorigin="0 0" coordsize="', Z * W, ' ', Z * H, '"',
                 ' stroked="', !aFill, '"',
                 ' strokeweight="', this.lineWidth, '"',
                 ' strokecolor="', color, '"',
                 ' path="');

    var newSeq = false;
    var min = {x: null, y: null};
    var max = {x: null, y: null};

    for (var i = 0; i < this.currentPath_.length; i++) {
      var p = this.currentPath_[i];

      if (p.type == "moveTo") {
        lineStr.push(" m ");
        var c = this.getCoords_(p.x, p.y);
        lineStr.push(mr(c.x), ",", mr(c.y));
      } else if (p.type == "lineTo") {
        lineStr.push(" l ");
        var c = this.getCoords_(p.x, p.y);
        lineStr.push(mr(c.x), ",", mr(c.y));
      } else if (p.type == "close") {
        lineStr.push(" x ");
      } else if (p.type == "bezierCurveTo") {
        lineStr.push(" c ");
        var c = this.getCoords_(p.x, p.y);
        var c1 = this.getCoords_(p.cp1x, p.cp1y);
        var c2 = this.getCoords_(p.cp2x, p.cp2y);
        lineStr.push(mr(c1.x), ",", mr(c1.y), ",",
                     mr(c2.x), ",", mr(c2.y), ",",
                     mr(c.x), ",", mr(c.y));
      } else if (p.type == "at" || p.type == "wa") {
        lineStr.push(" ", p.type, " ");
        var c  = this.getCoords_(p.x, p.y);
        var cStart = this.getCoords_(p.xStart, p.yStart);
        var cEnd = this.getCoords_(p.xEnd, p.yEnd);

        lineStr.push(mr(c.x - this.arcScaleX_ * p.radius), ",",
                     mr(c.y - this.arcScaleY_ * p.radius), " ",
                     mr(c.x + this.arcScaleX_ * p.radius), ",",
                     mr(c.y + this.arcScaleY_ * p.radius), " ",
                     mr(cStart.x), ",", mr(cStart.y), " ",
                     mr(cEnd.x), ",", mr(cEnd.y));
      }


      // TODO: Following is broken for curves due to
      //       move to proper paths.

      // Figure out dimensions so we can do gradient fills
      // properly
      if(c) {
        if (min.x == null || c.x < min.x) {
          min.x = c.x;
        }
        if (max.x == null || c.x > max.x) {
          max.x = c.x;
        }
        if (min.y == null || c.y < min.y) {
          min.y = c.y;
        }
        if (max.y == null || c.y > max.y) {
          max.y = c.y;
        }
      }
    }
    lineStr.push(' ">');

    if (typeof this.fillStyle == "object") {
      var focus = {x: "50%", y: "50%"};
      var width = (max.x - min.x);
      var height = (max.y - min.y);
      var dimension = (width > height) ? width : height;

      focus.x = mr((this.fillStyle.focus_.x / width) * 100 + 50) + "%";
      focus.y = mr((this.fillStyle.focus_.y / height) * 100 + 50) + "%";

      var colors = [];

      // inside radius (%)
      if (this.fillStyle.type_ == "gradientradial") {
        var inside = (this.fillStyle.radius1_ / dimension * 100);

        // percentage that outside radius exceeds inside radius
        var expansion = (this.fillStyle.radius2_ / dimension * 100) - inside;
      } else {
        var inside = 0;
        var expansion = 100;
      }

      var insidecolor = {offset: null, color: null};
      var outsidecolor = {offset: null, color: null};

      // We need to sort 'colors' by percentage, from 0 > 100 otherwise ie
      // won't interpret it correctly
      this.fillStyle.colors_.sort(function (cs1, cs2) {
        return cs1.offset - cs2.offset;
      });

      for (var i = 0; i < this.fillStyle.colors_.length; i++) {
        var fs = this.fillStyle.colors_[i];

        colors.push( (fs.offset * expansion) + inside, "% ", fs.color, ",");

        if (fs.offset > insidecolor.offset || insidecolor.offset == null) {
          insidecolor.offset = fs.offset;
          insidecolor.color = fs.color;
        }

        if (fs.offset < outsidecolor.offset || outsidecolor.offset == null) {
          outsidecolor.offset = fs.offset;
          outsidecolor.color = fs.color;
        }
      }
      colors.pop();

      lineStr.push('<g_vml_:fill',
                   ' color="', outsidecolor.color, '"',
                   ' color2="', insidecolor.color, '"',
                   ' type="', this.fillStyle.type_, '"',
                   ' focusposition="', focus.x, ', ', focus.y, '"',
                   ' colors="', colors.join(""), '"',
                   ' opacity="', opacity, '" />');
    } else if (aFill) {
      lineStr.push('<g_vml_:fill color="', color, '" opacity="', opacity, '" />');
    } else {
      lineStr.push(
        '<g_vml_:stroke',
        ' opacity="', opacity,'"',
        ' joinstyle="', this.lineJoin, '"',
        ' miterlimit="', this.miterLimit, '"',
        ' endcap="', processLineCap(this.lineCap) ,'"',
        ' weight="', this.lineWidth, 'px"',
        ' color="', color,'" />'
      );
    }

    lineStr.push("</g_vml_:shape>");

    this.element_.insertAdjacentHTML("beforeEnd", lineStr.join(""));

    this.currentPath_ = [];
  };

  contextPrototype.fill = function() {
    this.stroke(true);
  }

  contextPrototype.closePath = function() {
    this.currentPath_.push({type: "close"});
  };

  /**
   * @private
   */
  contextPrototype.getCoords_ = function(aX, aY) {
    return {
      x: Z * (aX * this.m_[0][0] + aY * this.m_[1][0] + this.m_[2][0]) - Z2,
      y: Z * (aX * this.m_[0][1] + aY * this.m_[1][1] + this.m_[2][1]) - Z2
    }
  };

  contextPrototype.save = function() {
    var o = {};
    copyState(this, o);
    this.aStack_.push(o);
    this.mStack_.push(this.m_);
    this.m_ = matrixMultiply(createMatrixIdentity(), this.m_);
  };

  contextPrototype.restore = function() {
    copyState(this.aStack_.pop(), this);
    this.m_ = this.mStack_.pop();
  };

  contextPrototype.translate = function(aX, aY) {
    var m1 = [
      [1,  0,  0],
      [0,  1,  0],
      [aX, aY, 1]
    ];

    this.m_ = matrixMultiply(m1, this.m_);
  };

  contextPrototype.rotate = function(aRot) {
    var c = mc(aRot);
    var s = ms(aRot);

    var m1 = [
      [c,  s, 0],
      [-s, c, 0],
      [0,  0, 1]
    ];

    this.m_ = matrixMultiply(m1, this.m_);
  };

  contextPrototype.scale = function(aX, aY) {
    this.arcScaleX_ *= aX;
    this.arcScaleY_ *= aY;
    var m1 = [
      [aX, 0,  0],
      [0,  aY, 0],
      [0,  0,  1]
    ];

    this.m_ = matrixMultiply(m1, this.m_);
  };

  /******** STUBS ********/
  contextPrototype.clip = function() {
    // TODO: Implement
  };

  contextPrototype.arcTo = function() {
    // TODO: Implement
  };

  contextPrototype.createPattern = function() {
    return new CanvasPattern_;
  };

  // Gradient / Pattern Stubs
  function CanvasGradient_(aType) {
    this.type_ = aType;
    this.radius1_ = 0;
    this.radius2_ = 0;
    this.colors_ = [];
    this.focus_ = {x: 0, y: 0};
  }

  CanvasGradient_.prototype.addColorStop = function(aOffset, aColor) {
    aColor = processStyle(aColor);
    this.colors_.push({offset: 1-aOffset, color: aColor});
  };

  function CanvasPattern_() {}

  // set up externs
  G_vmlCanvasManager = G_vmlCanvasManager_;
  CanvasRenderingContext2D = CanvasRenderingContext2D_;
  CanvasGradient = CanvasGradient_;
  CanvasPattern = CanvasPattern_;

})();
}
}







/* this notice must be untouched at all times.

wz_jsgraphics.js    v. 3.02
The latest version is available at
http://www.walterzorn.com
or http://www.devira.com
or http://www.walterzorn.de

***************************
Adaptation for jQuery, background, opacity and <canvas> use on compatibles browsers by :
Arnault Pachot - OpenStudio
http://www.openstudio.fr
***************************

Copyright (c) 2002-2004 Walter Zorn. All rights reserved.
Created 3. 11. 2002 by Walter Zorn (Web: http://www.walterzorn.com )
Last modified: 26. 10. 2007

Performance optimizations for Internet Explorer
by Thomas Frank and John Holdsworth.
fillPolygon method implemented by Matthieu Haller.

High Performance JavaScript Graphics Library.
Provides methods
- to draw lines, rectangles, ellipses, polygons
	with specifiable line thickness,
- to fill rectangles, polygons, ellipses and arcs
- to draw text.
NOTE: Operations, functions and branching have rather been optimized
to efficiency and speed than to shortness of source code.

LICENSE: LGPL

$(this) library is free software; you can redistribute it and/or
modify it under the terms of the GNU Lesser General Public
License (LGPL) as published by the Free Software Foundation; either
version 2.1 of the License, or (at your option) any later version.

$(this) library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public
License along with $(this) library; if not, write to the Free Software
Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA,
or see http://www.gnu.org/copyleft/lesser.html
*/

(function($) {
$.fn._mkDiv = function(x, y, w, h, settings) {
	$(this).append('<div style="position:absolute;'+
		'left:' + (x) + 'px;'+
		'top:' + (y) + 'px;'+
		'width:' + w + 'px;'+
		'height:' + h + 'px;'+
		'margin: 0 0 0 0; padding: 0 0 0 0;clip:rect(0,'+w+'px,'+h+'px,0);'+
		'opacity:' + settings.opacity +';'+
		'background-color: ' + settings.color +';'+
		'background-image: url(' + settings.backgroundImage +');'+
		'background-position: '+(-(x-settings.xorigin))+'px '+(-(y-settings.yorigin))+'px'+
		';"><\/div>');
	
}

$.fn._mkLin = function(x1, y1, x2, y2, settings) {
	if(x1 > x2)
	{
		var _x2 = x2;
		var _y2 = y2;
		x2 = x1;
		y2 = y1;
		x1 = _x2;
		y1 = _y2;
	}
	var dx = x2-x1, dy = Math.abs(y2-y1),
	x = x1, y = y1,
	yIncr = (y1 > y2)? -1 : 1;

	if(dx >= dy)
	{
		var pr = dy<<1,
		pru = pr - (dx<<1),
		p = pr-dx,
		ox = x;
		while(dx > 0)
		{--dx;
			++x;
			if(p > 0)
			{
				$(this)._mkDiv(ox, y, x-ox, 1, settings);
				y += yIncr;
				p += pru;
				ox = x;
			}
			else p += pr;
		}
		$(this)._mkDiv(ox, y, x2-ox+1, 1, settings);
	}

	else
	{
		var pr = dx<<1,
		pru = pr - (dy<<1),
		p = pr-dy,
		oy = y;
		if(y2 <= y1)
		{
			while(dy > 0)
			{--dy;
				if(p > 0)
				{
					$(this)._mkDiv(x++, y, 1, oy-y+1, settings);
					y += yIncr;
					p += pru;
					oy = y;
				}
				else
				{
					y += yIncr;
					p += pr;
				}
			}
			$(this)._mkDiv(x2, y2, 1, oy-y2+1, settings);
		}
		else
		{
			while(dy > 0)
			{--dy;
				y += yIncr;
				if(p > 0)
				{
					$(this)._mkDiv(x++, oy, 1, y-oy, settings);
					p += pru;
					oy = y;
				}
				else p += pr;
			}
			$(this)._mkDiv(x2, oy, 1, y2-oy+1, settings);
		}
	}
	return $(this);
}

$.fn._mkLin2D = function(x1, y1, x2, y2, settings) {
	if(x1 > x2)
	{
		var _x2 = x2;
		var _y2 = y2;
		x2 = x1;
		y2 = y1;
		x1 = _x2;
		y1 = _y2;
	}
	var dx = x2-x1, dy = Math.abs(y2-y1),
	x = x1, y = y1,
	yIncr = (y1 > y2)? -1 : 1;

	var s = settings.stroke;
	if(dx >= dy)
	{
		if(dx > 0 && s-3 > 0)
		{
			var _s = (s*dx*Math.sqrt(1+dy*dy/(dx*dx))-dx-(s>>1)*dy) / dx;
			_s = (!(s-4)? Math.ceil(_s) : Math.round(_s)) + 1;
		}
		else var _s = s;
		var ad = Math.ceil(s/2);

		var pr = dy<<1,
		pru = pr - (dx<<1),
		p = pr-dx,
		ox = x;
		while(dx > 0)
		{--dx;
			++x;
			if(p > 0)
			{
				$(this)._mkDiv(ox, y, x-ox+ad, _s, settings);
				y += yIncr;
				p += pru;
				ox = x;
			}
			else p += pr;
		}
		$(this)._mkDiv(ox, y, x2-ox+ad+1, _s, settings);
	}

	else
	{
		if(s-3 > 0)
		{
			var _s = (s*dy*Math.sqrt(1+dx*dx/(dy*dy))-(s>>1)*dx-dy) / dy;
			_s = (!(s-4)? Math.ceil(_s) : Math.round(_s)) + 1;
		}
		else var _s = s;
		var ad = Math.round(s/2);

		var pr = dx<<1,
		pru = pr - (dy<<1),
		p = pr-dy,
		oy = y;
		if(y2 <= y1)
		{
			++ad;
			while(dy > 0)
			{--dy;
				if(p > 0)
				{
					$(this)._mkDiv(x++, y, _s, oy-y+ad, settings);
					y += yIncr;
					p += pru;
					oy = y;
				}
				else
				{
					y += yIncr;
					p += pr;
				}
			}
			$(this)._mkDiv(x2, y2, _s, oy-y2+ad, settings);
		}
		else
		{
			while(dy > 0)
			{--dy;
				y += yIncr;
				if(p > 0)
				{
					$(this)._mkDiv(x++, oy, _s, y-oy+ad, settings);
					p += pru;
					oy = y;
				}
				else p += pr;
			}
			$(this)._mkDiv(x2, oy, _s, y2-oy+ad+1, settings);
		}
	}
	return $(this);
}

$.fn._mkLinDott = function(x1, y1, x2, y2, settings) {
	if(x1 > x2)
	{
		var _x2 = x2;
		var _y2 = y2;
		x2 = x1;
		y2 = y1;
		x1 = _x2;
		y1 = _y2;
	}
	var dx = x2-x1, dy = Math.abs(y2-y1),
	x = x1, y = y1,
	yIncr = (y1 > y2)? -1 : 1,
	drw = true;
	if(dx >= dy)
	{
		var pr = dy<<1,
		pru = pr - (dx<<1),
		p = pr-dx;
		while(dx > 0)
		{--dx;
			if(drw) $(this)._mkDiv(x, y, 1, 1, settings);
			drw = !drw;
			if(p > 0)
			{
				y += yIncr;
				p += pru;
			}
			else p += pr;
			++x;
		}
	}
	else
	{
		var pr = dx<<1,
		pru = pr - (dy<<1),
		p = pr-dy;
		while(dy > 0)
		{--dy;
			if(drw) $(this)._mkDiv(x, y, 1, 1, settings);
			drw = !drw;
			y += yIncr;
			if(p > 0)
			{
				++x;
				p += pru;
			}
			else p += pr;
		}
	}
	if(drw) $(this)._mkDiv(x, y, 1, 1, settings);
	return $(this);
}

$.fn._mkOv = function(left, top, width, height, settings) {
	var a = (++width)>>1, b = (++height)>>1,
	wod = width&1, hod = height&1,
	cx = left+a, cy = top+b,
	x = 0, y = b,
	ox = 0, oy = b,
	aa2 = (a*a)<<1, aa4 = aa2<<1, bb2 = (b*b)<<1, bb4 = bb2<<1,
	st = (aa2>>1)*(1-(b<<1)) + bb2,
	tt = (bb2>>1) - aa2*((b<<1)-1),
	w, h;
	while(y > 0)
	{
		if(st < 0)
		{
			st += bb2*((x<<1)+3);
			tt += bb4*(++x);
		}
		else if(tt < 0)
		{
			st += bb2*((x<<1)+3) - aa4*(y-1);
			tt += bb4*(++x) - aa2*(((y--)<<1)-3);
			w = x-ox;
			h = oy-y;
			if((w&2) && (h&2))
			{
				$(this)._mkOvQds(cx, cy, x-2, y+2, 1, 1, wod, hod, settings);
				$(this)._mkOvQds(cx, cy, x-1, y+1, 1, 1, wod, hod, settings);
			}
			else $(this)._mkOvQds(cx, cy, x-1, oy, w, h, wod, hod, settings);
			ox = x;
			oy = y;
		}
		else
		{
			tt -= aa2*((y<<1)-3);
			st -= aa4*(--y);
		}
	}
	w = a-ox+1;
	h = (oy<<1)+hod;
	y = cy-oy;
	$(this)._mkDiv(cx-a, y, w, h, settings);
	$(this)._mkDiv(cx+ox+wod-1, y, w, h, settings);
	return $(this);
}

$.fn._mkOv2D = function(left, top, width, height, settings) {
	var s = settings.stroke;
	width += s+1;
	height += s+1;
	var a = width>>1, b = height>>1,
	wod = width&1, hod = height&1,
	cx = left+a, cy = top+b,
	x = 0, y = b,
	aa2 = (a*a)<<1, aa4 = aa2<<1, bb2 = (b*b)<<1, bb4 = bb2<<1,
	st = (aa2>>1)*(1-(b<<1)) + bb2,
	tt = (bb2>>1) - aa2*((b<<1)-1);

	if(s-4 < 0 && (!(s-2) || width-51 > 0 && height-51 > 0))
	{
		var ox = 0, oy = b,
		w, h,
		pxw;
		while(y > 0)
		{
			if(st < 0)
			{
				st += bb2*((x<<1)+3);
				tt += bb4*(++x);
			}
			else if(tt < 0)
			{
				st += bb2*((x<<1)+3) - aa4*(y-1);
				tt += bb4*(++x) - aa2*(((y--)<<1)-3);
				w = x-ox;
				h = oy-y;

				if(w-1)
				{
					pxw = w+1+(s&1);
					h = s;
				}
				else if(h-1)
				{
					pxw = s;
					h += 1+(s&1);
				}
				else pxw = h = s;
				$(this)._mkOvQds(cx, cy, x-1, oy, pxw, h, wod, hod, settings);
				ox = x;
				oy = y;
			}
			else
			{
				tt -= aa2*((y<<1)-3);
				st -= aa4*(--y);
			}
		}
		$(this)._mkDiv(cx-a, cy-oy, s, (oy<<1)+hod, settings);
		$(this)._mkDiv(cx+a+wod-s, cy-oy, s, (oy<<1)+hod, settings);
	}

	else
	{
		var _a = (width-(s<<1))>>1,
		_b = (height-(s<<1))>>1,
		_x = 0, _y = _b,
		_aa2 = (_a*_a)<<1, _aa4 = _aa2<<1, _bb2 = (_b*_b)<<1, _bb4 = _bb2<<1,
		_st = (_aa2>>1)*(1-(_b<<1)) + _bb2,
		_tt = (_bb2>>1) - _aa2*((_b<<1)-1),

		pxl = new Array(),
		pxt = new Array(),
		_pxb = new Array();
		pxl[0] = 0;
		pxt[0] = b;
		_pxb[0] = _b-1;
		while(y > 0)
		{
			if(st < 0)
			{
				pxl[pxl.length] = x;
				pxt[pxt.length] = y;
				st += bb2*((x<<1)+3);
				tt += bb4*(++x);
			}
			else if(tt < 0)
			{
				pxl[pxl.length] = x;
				st += bb2*((x<<1)+3) - aa4*(y-1);
				tt += bb4*(++x) - aa2*(((y--)<<1)-3);
				pxt[pxt.length] = y;
			}
			else
			{
				tt -= aa2*((y<<1)-3);
				st -= aa4*(--y);
			}

			if(_y > 0)
			{
				if(_st < 0)
				{
					_st += _bb2*((_x<<1)+3);
					_tt += _bb4*(++_x);
					_pxb[_pxb.length] = _y-1;
				}
				else if(_tt < 0)
				{
					_st += _bb2*((_x<<1)+3) - _aa4*(_y-1);
					_tt += _bb4*(++_x) - _aa2*(((_y--)<<1)-3);
					_pxb[_pxb.length] = _y-1;
				}
				else
				{
					_tt -= _aa2*((_y<<1)-3);
					_st -= _aa4*(--_y);
					_pxb[_pxb.length-1]--;
				}
			}
		}

		var ox = -wod, oy = b,
		_oy = _pxb[0],
		l = pxl.length,
		w, h;
		for(var i = 0; i < l; i++)
		{
			if(typeof _pxb[i] != "undefined")
			{
				if(_pxb[i] < _oy || pxt[i] < oy)
				{
					x = pxl[i];
					$(this)._mkOvQds(cx, cy, x, oy, x-ox, oy-_oy, wod, hod, settings);
					ox = x;
					oy = pxt[i];
					_oy = _pxb[i];
				}
			}
			else
			{
				x = pxl[i];
				$(this)._mkDiv(cx-x, cy-oy, 1, (oy<<1)+hod, settings);
				$(this)._mkDiv(cx+ox+wod, cy-oy, 1, (oy<<1)+hod, settings);
				ox = x;
				oy = pxt[i];
			}
		}
		$(this)._mkDiv(cx-a, cy-oy, 1, (oy<<1)+hod, settings);
		$(this)._mkDiv(cx+ox+wod, cy-oy, 1, (oy<<1)+hod, settings);
	}
	return $(this);
}

$.fn._mkOvDott = function(left, top, width, height, settings) {
	var a = (++width)>>1, b = (++height)>>1,
	wod = width&1, hod = height&1, hodu = hod^1,
	cx = left+a, cy = top+b,
	x = 0, y = b,
	aa2 = (a*a)<<1, aa4 = aa2<<1, bb2 = (b*b)<<1, bb4 = bb2<<1,
	st = (aa2>>1)*(1-(b<<1)) + bb2,
	tt = (bb2>>1) - aa2*((b<<1)-1),
	drw = true;
	while(y > 0)
	{
		if(st < 0)
		{
			st += bb2*((x<<1)+3);
			tt += bb4*(++x);
		}
		else if(tt < 0)
		{
			st += bb2*((x<<1)+3) - aa4*(y-1);
			tt += bb4*(++x) - aa2*(((y--)<<1)-3);
		}
		else
		{
			tt -= aa2*((y<<1)-3);
			st -= aa4*(--y);
		}
		if(drw && y >= hodu) $(this)._mkOvQds(cx, cy, x, y, 1, 1, wod, hod, settings);
		drw = !drw;
	}
	return $(this);
}

$.fn._mkRect = function(x, y, w, h, settings) {
	var s = settings.stroke;
	$(this)._mkDiv(x, y, w, s, settings);
	$(this)._mkDiv(x+w, y, s, h, settings);
	$(this)._mkDiv(x, y+h, w+s, s, settings);
	$(this)._mkDiv(x, y+s, s, h-s, settings);
	return $(this);
}

$.fn._mkRectDott = function(x, y, w, h, settings) {
	$(this).drawLine(x, y, x+w, y, settings);
	$(this).drawLine(x+w, y, x+w, y+h, settings);
	$(this).drawLine(x, y+h, x+w, y+h, settings);
	$(this).drawLine(x, y, x, y+h, settings);
	return $(this);
}

	

	$.fn.drawLine = function(x1, y1, x2, y2, settings) {
		
		settings = jQuery.extend({stroke: 1, color: 'black', opacity: 1, backgroundImage: 'none'}, settings);
		settings.xorigin = x1; settings.yorigin = y1;
		
		if (supportsvg.support && !jQuery.browser.msie)
		{
			
	
			var myrand = 'id'+parseInt(Math.random()*1000000);
				$(this).append("<div id ='"+myrand+"' style='position: absolute;top: 0; left: 0;'></div>");

				$("#"+myrand).css('width', $(this).css('width')).css('height', $(this).css('height')).svg(function () {
			var svg = svgManager.getSVGFor("#"+myrand);
			var g = svg.group(null, {stroke: settings.color, stroke_width: settings.stroke});
			svg.line(g, x1, y1, x2, y2);
			});
		}
		else
		{
		if (!$(this).find('canvas').get(0))
			$(this).append("<canvas  width='"+$(this).css('width')+"' height='"+$(this).css('height')+"' style='position: absolute; top: 0; left: 0;'></canvas>");
 		var canvas = $(this).find("canvas").get(0);
			

		try {
                
			var ctx = canvas.getContext("2d");

		  	ctx.globalAlpha = settings.opacity; if (settings.stroke == 'dotted') ctx.lineWidth = .5; else if (settings.stroke == 'dotted') ctx.lineWidth = .5; else ctx.lineWidth = settings.stroke;
		    	ctx.beginPath();
		  	ctx.strokeStyle = settings.color;
 			ctx.moveTo(x1, y1);
   			ctx.lineTo(x2, y2);
			ctx.closePath();
			ctx.stroke();

	}
	catch (e) {
             
				
	
			if(settings.stroke=='dotted')
			{
				$(this)._mkLinDott(x1, y1, x2, y2, settings);
			}
			else if(settings.stroke-1 > 0)
			{
				$(this)._mkLin2D(x1, y1, x2, y2, settings);
			}
			else
			{
				$(this)._mkLin(x1, y1, x2, y2, settings);
			}
		}
		}
	
		return $(this);
	};
	$.fn.drawRect = function(x1, y1, x2, y2, settings) {
		
		settings = jQuery.extend({stroke: 1, color: 'black', opacity: 1, backgroundImage: 'none'}, settings);
		settings.xorigin = x1; settings.yorigin = y1;
		
		if (supportsvg.support && !jQuery.browser.msie)
			{
				
				var myrand = 'id'+parseInt(Math.random()*1000000);
				$(this).append("<div id ='"+myrand+"' style='position: absolute;top: 0; left: 0;'></div>");

				$("#"+myrand).css('width', $(this).css('width')).css('height', $(this).css('height')).svg(function () {
					var svg = svgManager.getSVGFor("#"+myrand);
					var g = svg.group(null, {stroke: settings.color, stroke_width: settings.stroke});
					svg.rect(null, x1, y1, x2, y2, {fill: "none", stroke: settings.color, stroke_width: settings.stroke});
				});
				
			}

		else
		{
			if (!$(this).find('canvas').get(0))
			$(this).append("<canvas  width='"+$(this).css('width')+"' height='"+$(this).css('height')+"' style='position: absolute; top: 0; left: 0;'></canvas>");
 			var canvas = $(this).find("canvas").get(0);
			

		try {
                
			var ctx = canvas.getContext("2d");
			ctx.globalAlpha = settings.opacity; if (settings.stroke == 'dotted') ctx.lineWidth = .5; else ctx.lineWidth = settings.stroke;
		  	ctx.strokeStyle = settings.color;
		  	ctx.strokeRect(x1, y1, x2, y2);
   			ctx.closePath();
			ctx.stroke();
		}
		catch (e) {
			
			
				if(settings.stroke=='dotted')
				{
					$(this)._mkRectDott(x1, y1, x2, y2, settings);
				}
				else if(settings.stroke-1 > 0)
				{
					$(this)._mkRect(x1, y1, x2, y2, settings);
				}
				else
				{
					$(this)._mkRect(x1, y1, x2, y2, settings);
				}
			
		}}
		return $(this);
	};
	
	

	

	$.fn.drawPolyline = function(x, y, settings) {
		settings = jQuery.extend({stroke: 1, color: 'black', opacity: 1, backgroundImage: 'none'}, settings);
		settings.xorigin = x[0]; settings.yorigin = y[0];
		
		
		for (var i=x.length - 1; i;)
		{--i;
			$(this).drawLine(x[i], y[i], x[i+1], y[i+1], settings);
			
		}
		return $(this);
	};

	$.fn.fillRect = function(x, y, w, h, settings) {
		settings = jQuery.extend({stroke: 1, color: 'black', opacity: 1, backgroundImage: 'none'}, settings);
		settings.xorigin = x; settings.yorigin = y;
			
		if (supportsvg.support && !jQuery.browser.msie)
			{
				var myrand = 'id'+parseInt(Math.random()*1000000);
				$(this).append("<div id ='"+myrand+"' style='position: absolute;top: 0; left: 0;'></div>");

				$("#"+myrand).css('width', $(this).css('width')).css('height', $(this).css('height')).svg(function () {
				var svg = svgManager.getSVGFor("#"+myrand);
				var g = svg.group(null, {stroke: settings.color, stroke_width: settings.stroke});
				svg.rect(null, x, y, w, h, {fill: settings.color});
				});
			}
			else
		{
			if (!$(this).find('canvas').get(0))
			$(this).append("<canvas  width='"+$(this).css('width')+"' height='"+$(this).css('height')+"' style='position: absolute; top: 0; left: 0;'></canvas>");
 			var canvas = $(this).find("canvas").get(0);
			try {
                	var ctx = canvas.getContext("2d");
			ctx.globalAlpha = settings.opacity; if (settings.stroke == 'dotted') ctx.lineWidth = .5; else ctx.lineWidth = settings.stroke;
		  	if (settings.backgroundImage != 'none')
			{
				var img = new Image();
				img.src = settings.backgroundImage;
				if (jQuery.browser.msie)
						erreur;
					else img.onload = function() {
   				 var ptrn = ctx.createPattern(img, 'repeat');
   				 ctx.fillStyle = ptrn;
				 ctx.fillRect(x, y, w, h);
				}
			}
			else 
			{
				ctx.fillStyle = settings.color;
				 ctx.fillRect(x, y, w, h);
			}
			
		}
		catch (e) {
			
				$(this)._mkDiv(x, y, w, h, settings);
		}
		}
		return $(this);
	};

	$.fn.drawPolygon = function(x, y, settings) {
		settings = jQuery.extend({stroke: 1, color: 'black', opacity: 1, backgroundImage: 'none'}, settings);
		settings.xorigin = x[0]; settings.yorigin = y[0];
		$(this).drawPolyline(x, y, settings);
		$(this).drawLine(x[x.length-1], y[x.length-1], x[0], y[0], settings);
		return $(this);
	};

	$.fn.drawEllipse = function(x, y, w, h, settings) {
		settings = jQuery.extend({stroke: 1, color: 'black', opacity: 1, backgroundImage: 'none'}, settings);
		settings.xorigin = x; settings.yorigin = y;
		if (!$(this).find('canvas').get(0))
			$(this).append("<canvas  width='"+$(this).css('width')+"' height='"+$(this).css('height')+"' style='position: absolute; top: 0; left: 0;'></canvas>");
 		var canvas = $(this).find("canvas").get(0);
			

		if (supportsvg.support && !jQuery.browser.msie)
			{
				var myrand = 'id'+parseInt(Math.random()*1000000);
				$(this).append("<div id ='"+myrand+"' style='position: absolute;top: 0; left: 0;'></div>");

				$("#"+myrand).css('width', $(this).css('width')).css('height', $(this).css('height')).svg(function () {
				var svg = svgManager.getSVGFor("#"+myrand);
				var g = svg.group(null, {stroke: settings.color, stroke_width: settings.stroke});
				svg.ellipse(null, x+w/2, y+h/2, w/2, h/2, {fill: "none", stroke: settings.color, stroke_width: settings.stroke});
				});
			}
			else
			{
		try {
                	var ctx = canvas.getContext("2d");
			var left = x, top= y;
			w += x;
			h += y;
			ctx.globalAlpha = settings.opacity;
			if (settings.stroke == 'dotted') ctx.lineWidth = .5; else ctx.lineWidth = settings.stroke;
			var KAPPA = 4 * ((Math.sqrt(2) -1) / 3);

			var rx = (w-left)/2;
			var ry = (h-top)/2;

			var cx = left+rx;
			var cy = top+ry;

			ctx.beginPath();
			ctx.strokeStyle = settings.color;
 			ctx.moveTo(cx, cy - ry);
			ctx.bezierCurveTo(cx + (KAPPA * rx), cy - ry,  cx + rx, cy - (KAPPA * ry), cx + rx, cy);
			ctx.bezierCurveTo(cx + rx, cy + (KAPPA * ry), cx + (KAPPA * rx), cy + ry, cx, cy + ry);
			ctx.bezierCurveTo(cx - (KAPPA * rx), cy + ry, cx - rx, cy + (KAPPA * ry), cx - rx, cy);
			ctx.bezierCurveTo(cx - rx, cy - (KAPPA * ry), cx - (KAPPA * rx), cy - ry, cx, cy - ry);

			ctx.closePath();
			ctx.stokeStyle = settings.color;
 			ctx.stroke();

		} catch (e) {

			
				if(settings.stroke=='dotted')
				{
					$(this)._mkOvDott(x, y, w, h, settings);
				}
				else if(settings.stroke-1 > 0)
				{
					$(this)._mkOv2D(x, y, w, h, settings);
				}
				else
				{
					$(this)._mkOv(x, y, w, h, settings);
				}
			
		}
}
		return $(this);
	};

	
	$.fn.fillEllipse = function(left, top, w, h, settings) {
		settings = jQuery.extend({stroke: 1, color: 'black', opacity: 1, backgroundImage: 'none'}, settings);
		settings.xorigin = left; settings.yorigin = top;
		if (supportsvg.support && !jQuery.browser.msie)
		{
			var myrand = 'id'+parseInt(Math.random()*1000000);
				$(this).append("<div id ='"+myrand+"' style='position: absolute;top: 0; left: 0;'></div>");

				$("#"+myrand).css('width', $(this).css('width')).css('height', $(this).css('height')).svg(function () {
				var svg = svgManager.getSVGFor("#"+myrand);
				var g = svg.group(null, {stroke: settings.color, stroke_width: settings.stroke});
				svg.ellipse(null, left+w/2, top+h/2, w/2, h/2,  {fill: settings.color});
			});
		}
		else
		{


			if (!$(this).find('canvas').get(0))
			$(this).append("<canvas  width='"+$(this).css('width')+"' height='"+$(this).css('height')+"' style='position: absolute; top: 0; left: 0;'></canvas>");
 			var canvas = $(this).find("canvas").get(0);
		
			try {
			var ctx = canvas.getContext("2d");
			w += left;
			h += top;
			ctx.globalAlpha = settings.opacity; if (settings.stroke == 'dotted') ctx.lineWidth = .5; else ctx.lineWidth = settings.stroke;
			if (settings.backgroundImage != 'none')
			{
				var img = new Image();
				img.src = settings.backgroundImage;
				$(img).ready(function() {
   				 var ptrn = ctx.createPattern(img, 'repeat');
   				 ctx.moveTo(left, top);
  				var KAPPA = 4 * ((Math.sqrt(2) -1) / 3);	

				var rx = (w-left)/2;
				var ry = (h-top)/2;

				var cx = left+rx;
				var cy = top+ry;
	
				ctx.beginPath();
				ctx.fillStyle = ptrn;
				ctx.globalAlpha = settings.opacity; if (settings.stroke == 'dotted') ctx.lineWidth = .5; else ctx.lineWidth = settings.stroke;
				ctx.moveTo(cx, cy - ry);
				ctx.bezierCurveTo(cx + (KAPPA * rx), cy - ry,  cx + rx, cy - (KAPPA * ry), cx + rx, cy);
				ctx.bezierCurveTo(cx + rx, cy + (KAPPA * ry), cx + (KAPPA * rx), cy + ry, cx, cy + ry);
				ctx.bezierCurveTo(cx - (KAPPA * rx), cy + ry, cx - rx, cy + (KAPPA * ry), cx - rx, cy);
				ctx.bezierCurveTo(cx - rx, cy - (KAPPA * ry), cx - (KAPPA * rx), cy - ry, cx, cy - ry);
				ctx.closePath();
				ctx.fill();
				
				});
			}
			else 
			{
				ctx.fillStyle = settings.color;
				ctx.globalAlpha = settings.opacity; if (settings.stroke == 'dotted') ctx.lineWidth = .5; else ctx.lineWidth = settings.stroke;
			ctx.fillStyle = settings.color;
 			ctx.beginPath();
			ctx.moveTo(left, top);
  			var KAPPA = 4 * ((Math.sqrt(2) -1) / 3);

			var rx = (w-left)/2;
			var ry = (h-top)/2;

			var cx = left+rx;
			var cy = top+ry;

			ctx.beginPath();
			ctx.moveTo(cx, cy - ry);
			ctx.bezierCurveTo(cx + (KAPPA * rx), cy - ry,  cx + rx, cy - (KAPPA * ry), cx + rx, cy);
			ctx.bezierCurveTo(cx + rx, cy + (KAPPA * ry), cx + (KAPPA * rx), cy + ry, cx, cy + ry);
			ctx.bezierCurveTo(cx - (KAPPA * rx), cy + ry, cx - rx, cy + (KAPPA * ry), cx - rx, cy);
			ctx.bezierCurveTo(cx - rx, cy - (KAPPA * ry), cx - (KAPPA * rx), cy - ry, cx, cy - ry);

			ctx.closePath();
			ctx.fill();	
			}
			

		} catch (e) {
		
			
				var a = w>>1, b = h>>1,
				wod = w&1, hod = h&1,
				cx = left+a, cy = top+b,
				x = 0, y = b, oy = b,
				aa2 = (a*a)<<1, aa4 = aa2<<1, bb2 = (b*b)<<1, bb4 = bb2<<1,
				st = (aa2>>1)*(1-(b<<1)) + bb2,
				tt = (bb2>>1) - aa2*((b<<1)-1),
				xl, dw, dh;
				if(w) while(y > 0)
				{
					if(st < 0)
					{
						st += bb2*((x<<1)+3);
						tt += bb4*(++x);
					}
					else if(tt < 0)
					{
							st += bb2*((x<<1)+3) - aa4*(y-1);
						xl = cx-x;
						dw = (x<<1)+wod;
						tt += bb4*(++x) - aa2*(((y--)<<1)-3);
						dh = oy-y;
						$(this)._mkDiv(xl, cy-oy, dw, dh, settings);
						$(this)._mkDiv(xl, cy+y+hod, dw, dh, settings);
						oy = y;
					}
					else
					{
						tt -= aa2*((y<<1)-3);
						st -= aa4*(--y);
					}
				}
				$(this)._mkDiv(cx-a, cy-oy, w, (oy<<1)+hod, settings);
			
		}
		}
		return $(this);
	};

	$.fn.fillArc = function(iL, iT, iW, fAngA, fAngZ, settings) {
		var iH = iW;
		settings = jQuery.extend({stroke: 1, color: 'black', opacity: 1, backgroundImage: 'none'}, settings);
		settings.xorigin = iL; settings.yorigin = iT;
		

		if (supportsvg.support && !jQuery.browser.msie)
		{
			var myrand = 'id'+parseInt(Math.random()*1000000);
				$(this).append("<div id ='"+myrand+"' style='position: absolute;top: 0; left: 0;'></div>");
				$("#"+myrand).css('width', $(this).css('width')).css('height', $(this).css('height')).svg(function () {
				var svg = svgManager.getSVGFor("#"+myrand);
				
				
				var g = svg.group(null, {stroke: settings.color, stroke_width: settings.stroke});
				var cx = iL+iW/2, cy = iT+iW/2, r = iW/2, startangle=Math.PI+ (((fAngA+90)%360)*Math.PI/180), endangle =Math.PI+(((fAngZ+90)%360)*Math.PI/180);  
				  var big = 0;
        				if (endangle - startangle > Math.PI) big = 1;
       				 var x1 = cx + r * Math.sin(startangle);
       				 var y1 = cy - r * Math.cos(startangle);
       				 var x2 = cx + r * Math.sin(endangle);
       				 var y2 = cy - r * Math.cos(endangle);var d = "M " + cx + "," + cy +  // Start at circle center
           				" L " + x1 + "," + y1 +     // Draw line to (x1,y1)
            				" A " + r + "," + r +       // Draw an arc of radius r
            				" 0 " + big + " 1 " +       // Arc details...
            				x2 + "," + y2 +             // Arc goes to to (x2,y2)
            				" Z";  
				svg.path(null, d, {fill: settings.color, stroke_linejoin: "round", background_fill: "none"});
				});
				
				
		}
		else
		{	if (!$(this).find('canvas').get(0))
			$(this).append("<canvas  width='"+$(this).css('width')+"' height='"+$(this).css('height')+"' style='position: absolute; top: 0; left: 0;'></canvas>");
 			var canvas = $(this).find("canvas").get(0);
			

		try {
		
			var ctx = canvas.getContext("2d");
			ctx.globalAlpha = settings.opacity; if (settings.stroke == 'dotted') ctx.lineWidth = .5; else ctx.lineWidth = settings.stroke;
			var img;
			var ptrn;
			if (settings.backgroundImage != 'none')
			{
				 
				 	var img = new Image();
					img.src = settings.backgroundImage;
					if (jQuery.browser.msie)
						erreur;
					else img.onload = function(){
						//alert('ok');
						var ptrn = ctx.createPattern(img, 'repeat');
   				 		ctx.fillStyle = ptrn;
						ctx.beginPath();
        					ctx.moveTo(iL+iW/2, iT+iW/2);
        					ctx.arc(iL+iW/2, iT+iW/2, iW/2, 
                   					2*Math.PI-(fAngA*Math.PI)/180,
							2*Math.PI-(fAngZ*Math.PI)/180, true);
        					ctx.lineTo(iL+iW/2, iT+iW/2);
        					ctx.closePath();
        					ctx.fill();
					};
					
			}
			else 
			{
				ctx.fillStyle = settings.color;
				ctx.beginPath();
        			ctx.moveTo(iL+iW/2, iT+iW/2);
        			ctx.arc(iL+iW/2, iT+iW/2, iW/2, 
                   		2*Math.PI-(fAngA*Math.PI)/180,
				2*Math.PI-(fAngZ*Math.PI)/180,
                   		
                   		true);
        			ctx.lineTo(iL+iW/2, iT+iW/2);
        			ctx.closePath();
        			ctx.fill();
			}
			
		} catch (e) {		
	
		
				var a = iW>>1, b = iH>>1,
				iOdds = (iW&1) | ((iH&1) << 16),
				cx = iL+a, cy = iT+b,
				x = 0, y = b, ox = x, oy = y,
				aa2 = (a*a)<<1, aa4 = aa2<<1, bb2 = (b*b)<<1, bb4 = bb2<<1,
				st = (aa2>>1)*(1-(b<<1)) + bb2,
				tt = (bb2>>1) - aa2*((b<<1)-1),
				// Vars for radial boundary lines
				xEndA, yEndA, xEndZ, yEndZ,
				iSects = (1 << (Math.floor((fAngA %= 360.0)/180.0) << 3))
				| (2 << (Math.floor((fAngZ %= 360.0)/180.0) << 3))
				| ((fAngA >= fAngZ) << 16),
				aBndA = new Array(b+1), aBndZ = new Array(b+1);
			
				// Set up radial boundary lines
				fAngA *= Math.PI/180.0;
				fAngZ *= Math.PI/180.0;
				xEndA = cx+Math.round(a*Math.cos(fAngA));
				yEndA = cy+Math.round(-b*Math.sin(fAngA));
				$(this)._mkLinVirt(aBndA, cx, cy, xEndA, yEndA, settings);
				xEndZ = cx+Math.round(a*Math.cos(fAngZ));
				yEndZ = cy+Math.round(-b*Math.sin(fAngZ));
				$(this)._mkLinVirt(aBndZ, cx, cy, xEndZ, yEndZ, settings);

				while(y > 0)
				{
					if(st < 0) // Advance x
					{
						st += bb2*((x<<1)+3);
						tt += bb4*(++x);
					}
					else if(tt < 0) // Advance x and y
					{
						st += bb2*((x<<1)+3) - aa4*(y-1);
						ox = x;
						tt += bb4*(++x) - aa2*(((y--)<<1)-3);
						$(this)._mkArcDiv(ox, y, oy, cx, cy, iOdds, aBndA, aBndZ, iSects, settings);
						oy = y;
					}
					else // Advance y
					{
						tt -= aa2*((y<<1)-3);
						st -= aa4*(--y);
						if(y && (aBndA[y] != aBndA[y-1] || aBndZ[y] != aBndZ[y-1]))
						{
							$(this)._mkArcDiv(x, y, oy, cx, cy, iOdds, aBndA, aBndZ, iSects, settings);
							ox = x;
							oy = y;
						}
				}
			}
		}
		$(this)._mkArcDiv(x, 0, oy, cx, cy, iOdds, aBndA, aBndZ, iSects, settings);
		if(iOdds >> 16) // Odd height
		{
			if(iSects >> 16) // Start-angle > end-angle
			{
				var xl = (yEndA <= cy || yEndZ > cy)? (cx - x) : cx;
				$(this)._mkDiv(xl, cy, x + cx - xl + (iOdds & 0xffff), 1, settings);
			}
			else if((iSects & 0x01) && yEndZ > cy)
				$(this)._mkDiv(cx - x, cy, x, 1, settings);
		}
		}
		return $(this);
	};

/* fillPolygon method, implemented by Matthieu Haller.
this javascript function is an adaptation of the gdImageFilledPolygon for Walter Zorn lib.
C source of GD 1.8.4 found at http://www.boutell.com/gd/

THANKS to Kirsten Schulz for the polygon fixes!

The intersection finding technique of $(this) code could be improved
by remembering the previous intertersection, and by using the slope.
That could help to adjust intersections to produce a nice
interior_extrema. */
	

$.fn.fillPolygon = function(array_x, array_y, settings) {
	
	settings = jQuery.extend({stroke: 1, color: 'black', opacity: 1, backgroundImage: 'none'}, settings);
	settings.xorigin = array_x[0]; settings.yorigin = array_y[0];
	
	if (supportsvg.support && !jQuery.browser.msie)
			{
				var myrand = 'id'+parseInt(Math.random()*1000000);
				$(this).append("<div id ='"+myrand+"' style='position: absolute;top: 0; left: 0;'></div>");

				$("#"+myrand).css('width', $(this).css('width')).css('height', $(this).css('height')).svg(function () {
				var svg = svgManager.getSVGFor("#"+myrand);
				var g = svg.group(null, {stroke: settings.color, stroke_width: settings.stroke});
				var points = new Array;
				for (var i=0; i<array_x.length; i++)
				{
					points[i] = new Array;
					points[i][0] = array_x[i];points[i][1] = array_y[i];
				}
				svg.polygon(null, points, {fill: settings.color});
				});
			}
			else
		{

		if (!$(this).find('canvas').get(0))
			$(this).append("<canvas  width='"+$(this).css('width')+"' height='"+$(this).css('height')+"' style='position: absolute; top: 0; left: 0;'></canvas>");
 			var canvas = $(this).find("canvas").get(0);
			

		try {
			var ctx = canvas.getContext("2d");
			var n = array_x.length;
			ctx.globalAlpha = settings.opacity; if (settings.stroke == 'dotted') ctx.lineWidth = .5; else ctx.lineWidth = settings.stroke;
			ctx.beginPath();
	  		var img;
			 var ptrn;
			if (settings.backgroundImage != 'none')
			{
				img = new Image();
				img.src = settings.backgroundImage;
				if (jQuery.browser.msie)
						erreur;
					else img.onload = function() {
   				ptrn = ctx.createPattern(img, 'repeat');
   				 ctx.fillStyle = ptrn;

				ctx.moveTo(array_x[0], array_y[0]);
   	
				for (var i=1; i<n; i++)
				{
					ctx.lineTo(array_x[i], array_y[i]);
		   			
				}
				ctx.lineTo(array_x[0], array_y[0]);
				ctx.closePath();
				ctx.fill();}
			}
			else 
			{
				ctx.fillStyle = settings.color;
	 			ctx.moveTo(array_x[0], array_y[0]);
   	
				for (var i=1; i<n; i++)
				{
					ctx.lineTo(array_x[i], array_y[i]);
		   	
				}
				ctx.lineTo(array_x[0], array_y[0]);
				ctx.closePath();
				ctx.fill();
			}		
	} catch (e) {
		var i;
		var y;
		var miny, maxy;
		var x1, y1;
		var x2, y2;
		var ind1, ind2;
		var ints;

		var n = array_x.length;
		if(!n) return;

		miny = array_y[0];
		maxy = array_y[0];
		for(i = 1; i < n; i++)
		{
			if(array_y[i] < miny)
				miny = array_y[i];

			if(array_y[i] > maxy)
				maxy = array_y[i];
		}
		for(y = miny; y <= maxy; y++)
		{
			var polyInts = new Array();
			ints = 0;
			for(i = 0; i < n; i++)
			{
				if(!i)
				{
					ind1 = n-1;
					ind2 = 0;
				}
				else
				{
					ind1 = i-1;
					ind2 = i;
				}
				y1 = array_y[ind1];
				y2 = array_y[ind2];
				if(y1 < y2)
				{
					x1 = array_x[ind1];
					x2 = array_x[ind2];
				}
				else if(y1 > y2)
				{
					y2 = array_y[ind1];
					y1 = array_y[ind2];
					x2 = array_x[ind1];
					x1 = array_x[ind2];
				}
				else continue;

				 //  Modified 11. 2. 2004 Walter Zorn
				if((y >= y1) && (y < y2))
					polyInts[ints++] = Math.round((y-y1) * (x2-x1) / (y2-y1) + x1);

				else if((y == maxy) && (y > y1) && (y <= y2))
					polyInts[ints++] = Math.round((y-y1) * (x2-x1) / (y2-y1) + x1);
			}
			polyInts.sort(function CompInt(x, y) {
	return(x - y);
	
});
			for(i = 0; i < ints; i+=2)
				$(this)._mkDiv(polyInts[i], y, polyInts[i+1]-polyInts[i]+1, 1, settings);
		}

	}
	}
		return $(this);
	};

	
	

	$.fn._mkOvQds = function(cx, cy, x, y, w, h, wod, hod, settings) {
		var xl = cx - x, xr = cx + x + wod - w, yt = cy - y, yb = cy + y + hod - h;
		if(xr > xl+w)
		{
			$(this)._mkDiv(xr, yt, w, h, settings);
			$(this)._mkDiv(xr, yb, w, h, settings);
		}
		else
			w = xr - xl + w;
		$(this)._mkDiv(xl, yt, w, h, settings);
		$(this)._mkDiv(xl, yb, w, h, settings);
		return $(this);
	};
	
	$.fn._mkArcDiv = function(x, y, oy, cx, cy, iOdds, aBndA, aBndZ, iSects, settings) {
		var xrDef = cx + x + (iOdds & 0xffff), y2, h = oy - y, xl, xr, w;

		if(!h) h = 1;
		x = cx - x;

		if(iSects & 0xff0000) // Start-angle > end-angle
		{
			y2 = cy - y - h;
			if(iSects & 0x00ff)
			{
				if(iSects & 0x02)
				{
					xl = Math.max(x, aBndZ[y]);
					w = xrDef - xl;
					if(w > 0) $(this)._mkDiv(xl, y2, w, h, settings);
				}
				if(iSects & 0x01)
				{
					xr = Math.min(xrDef, aBndA[y]);
					w = xr - x;
					if(w > 0) $(this)._mkDiv(x, y2, w, h, settings);
				}
			}
			else
				$(this)._mkDiv(x, y2, xrDef - x, h, settings);
			y2 = cy + y + (iOdds >> 16);
			if(iSects & 0xff00)
			{
				if(iSects & 0x0100)
				{
					xl = Math.max(x, aBndA[y]);
					w = xrDef - xl;
					if(w > 0) $(this)._mkDiv(xl, y2, w, h, settings);
				}
				if(iSects & 0x0200)
				{
					xr = Math.min(xrDef, aBndZ[y]);
					w = xr - x;
					if(w > 0) $(this)._mkDiv(x, y2, w, h, settings);
				}
			}
			else
				$(this)._mkDiv(x, y2, xrDef - x, h, settings);
		}
		else
		{
			if(iSects & 0x00ff)
			{
				if(iSects & 0x02)
					xl = Math.max(x, aBndZ[y]);
				else
					xl = x;
				if(iSects & 0x01)
					xr = Math.min(xrDef, aBndA[y]);
				else
					xr = xrDef;
				y2 = cy - y - h;
				w = xr - xl;
				if(w > 0) $(this)._mkDiv(xl, y2, w, h, settings);
			}
			if(iSects & 0xff00)
			{
				if(iSects & 0x0100)
					xl = Math.max(x, aBndA[y]);
				else
					xl = x;
				if(iSects & 0x0200)
					xr = Math.min(xrDef, aBndZ[y]);
				else
					xr = xrDef;
				y2 = cy + y + (iOdds >> 16);
				w = xr - xl;
				if(w > 0) $(this)._mkDiv(xl, y2, w, h, settings);
			}
		}
		return $(this);
	};

	
	


$.fn._mkLinVirt = function(aLin, x1, y1, x2, y2, settings) {
	var dx = Math.abs(x2-x1), dy = Math.abs(y2-y1),
	x = x1, y = y1,
	xIncr = (x1 > x2)? -1 : 1,
	yIncr = (y1 > y2)? -1 : 1,
	p,
	i = 0;
	if(dx >= dy)
	{
		var pr = dy<<1,
		pru = pr - (dx<<1);
		p = pr-dx;
		while(dx > 0)
		{--dx;
			if(p > 0)    //  Increment y
			{
				aLin[i++] = x;
				y += yIncr;
				p += pru;
			}
			else p += pr;
			x += xIncr;
		}
	}
	else
	{
		var pr = dx<<1,
		pru = pr - (dy<<1);
		p = pr-dy;
		while(dy > 0)
		{--dy;
			y += yIncr;
			aLin[i++] = x;
			if(p > 0)    //  Increment x
			{
				x += xIncr;
				p += pru;
			}
			else p += pr;
		}
	}
	for(var len = aLin.length, i = len-i; i;)
		aLin[len-(i--)] = x;
	
};






})(jQuery);

//from http://thomas.tanreisoftware.com/?p=79
function detectSVG()
{
	var results = { support:null, plugin:null, builtin:null };
	var obj = null;
	if ( navigator && navigator.mimeTypes && navigator.mimeTypes.length )
	{
		for ( var mime in { "image/svg+xml":null, "image/svg":null, "image/svg-xml":null } )
		{
			if ( navigator.mimeTypes[ mime ] && ( obj = navigator.mimeTypes[ mime ].enabledPlugin ) && obj )
				results = { plugin:( obj = obj.name.toLowerCase()) && obj.indexOf( "adobe" ) >= 0 ? "Adobe" : ( obj.indexOf( "renesis" ) >= 0 ? "Renesis" : "Unknown" ) };
		}
	}
	else if ( ( obj = document.createElement( "object" )) && obj && typeof obj.setAttribute( "type", "image/svg+xml" ))
	{
		if ( typeof obj.USE_SVGZ == "string" )
			results = { plugin:"Adobe", IID:"Adobe.SVGCtl", pluginVersion:obj.window && obj.window._window_impl ? ( obj.window.evalScript ? 6 : 3 ) : 2 };
		else if ( obj.window && obj.window.getSVGViewerVersion().indexOf( "enesis" ) > 0 )
			results = { plugin:"Renesis", IID:"RenesisX.RenesisCtrl.1" };
	}
	results.IID = ( results.plugin == "Adobe" ? "Adobe.SVGCtl" : ( results.plugin == "Renesis" ? "renesisX.RenesisCtrl.1" : null ));

	// Does the browser support SVG natively? Gecko claims no support if a plugin is active, but still gives back an NSI inteface
	var claimed = document && document.implementation && document.implementation.hasFeature( "org.w3c.dom.svg", "1.0" );
	var nsi = window.Components && window.Components.interfaces && !!Components.interfaces.nsIDOMGetSVGDocument;
	results.builtin = claimed ? ( !!window.opera ? "Opera" : ( nsi ? "Gecko" : "Safari" )) : ( !!window.opera && window.opera.version ? "Opera" : ( nsi ? "Gecko" : null ));
	results.builtinVersion = results.builtin && !!window.opera ? parseFloat( window.opera.version()) : ( nsi ? ( typeof Iterator == "function" ? ( Array.reduce ? 3.0 : 2.0 ) : 1.5 ) : null );

	// Which is active, the plugin or native support? Opera 9 makes it hard to tell..
	if ( !!window.opera && results.builtinVersion >= 9 && ( obj = document.createElement( "object" )) && obj && typeof obj.setAttribute( "type", "image/svg+xml" ) && document.appendChild( obj ))
	{
		results.support = obj.offsetWidth ? "Plugin" : "Builtin";
		document.removeChild( obj );
	}
	else	results.support = results.plugin && !claimed ? "Plugin" : ( results.builtin && claimed ? "Builtin" : null );

	return results;
}
	
