/**
 * Created by Janne on 10.11.2014.
 */


GridNode = function () {
    this.north = null;
    this.south = null;
    this.east  = null;
    this.west  = null;

    this.nextSprite = null;

    this.dupe = {
        horizontal: null,
        vertical:   null
    };

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

    this.isEmpty = function (collidables) {
        var empty = true;
        var ref = this;
        while (ref.nextSprite) {
            ref = ref.nextSprite;
            empty = !ref.visible || collidables.indexOf(ref.name) == -1
            if (!empty) break;
        }
        return empty;
    };
};