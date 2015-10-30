/**
 * Created by Janne on 10.11.2014.
 */



// borrowed from typeface-0.14.js
// http://typeface.neocracy.org
Text = {
    renderGlyph: function (ctx, face, char) {

        var glyph = face.glyphs[char];

        if (glyph.o) {

            var outline;
            if (glyph.cached_outline) {
                outline = glyph.cached_outline;
            } else {
                outline = glyph.o.split(' ');
                glyph.cached_outline = outline;
            }

            var outlineLength = outline.length;
            for (var i = 0; i < outlineLength; ) {

                var action = outline[i++];

                switch(action) {
                    case 'm':
                        ctx.moveTo(outline[i++], outline[i++]);
                        break;
                    case 'l':
                        ctx.lineTo(outline[i++], outline[i++]);
                        break;

                    case 'q':
                        var cpx = outline[i++];
                        var cpy = outline[i++];
                        ctx.quadraticCurveTo(outline[i++], outline[i++], cpx, cpy);
                        break;

                    case 'b':
                        var x = outline[i++];
                        var y = outline[i++];
                        ctx.bezierCurveTo(outline[i++], outline[i++], outline[i++], outline[i++], x, y);
                        break;
                }
            }
        }
        if (glyph.ha) {
            ctx.translate(glyph.ha, 0);
        }
    },

    renderText: function(text, size, x, y) {
        this.context.save();

        this.context.translate(x, y);

        var pixels = size * 72 / (this.face.resolution * 100);
        this.context.scale(pixels, -1 * pixels);
        this.context.beginPath();
        var chars = text.split('');
        var charsLength = chars.length;
        for (var i = 0; i < charsLength; i++) {
            this.renderGlyph(this.context, this.face, chars[i]);
        }
        this.context.fill();

        this.context.restore();
    },

    context: null,
    face: null
};

SFX = {
    laser:     new Audio('39459__THE_bizniss__laser.wav'),
    explosion: new Audio('51467__smcameron__missile_explosion.wav')
};

// preload audio
for (var sfx in SFX) {
    (function () {
        var audio = SFX[sfx];
        audio.muted = true;
        audio.play();

        SFX[sfx] = function () {
            if (!this.muted) {
                if (audio.duration == 0) {
                    // somehow dropped out
                    audio.load();
                    audio.play();
                } else {
                    audio.muted = false;
                    audio.currentTime = 0;
                }
            }
            return audio;
        }
    })();
}
// pre-mute audio
SFX.muted = true;