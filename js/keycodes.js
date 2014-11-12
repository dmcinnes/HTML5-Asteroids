/**
 * Created by Janne on 10.11.2014.
 */


KEY_CODES = {
    32: 'space',
    37: 'left',
    38: 'up',
    39: 'right',
    40: 'down',
    70: 'f',
    71: 'g',
    72: 'h',
    77: 'm',
    80: 'p'
};

KEY_STATUS = { keyDown:false };
for (code in KEY_CODES) {
    KEY_STATUS[KEY_CODES[code]] = false;
}

$(window).keydown(function (e) {
    KEY_STATUS.keyDown = true;
    if (KEY_CODES[e.keyCode]) {
        //e.preventDefault();
        KEY_STATUS[KEY_CODES[e.keyCode]] = true;
    }
}).keyup(function (e) {
    KEY_STATUS.keyDown = false;
    if (KEY_CODES[e.keyCode]) {
        //e.preventDefault();
        KEY_STATUS[KEY_CODES[e.keyCode]] = false;
    }
});