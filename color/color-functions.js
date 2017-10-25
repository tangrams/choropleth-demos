function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(rgb) {
    return "#" + componentToHex(parseInt(rgb[0])) + componentToHex(parseInt(rgb[1])) + componentToHex(parseInt(rgb[2]));
}

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16)
    ] : null;
}

function rgbToHsl(r, g, b){
    r /= 255, g /= 255, b /= 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2;

    if(max == min){
        h = s = 0; // achromatic
    }else{
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch(max){
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return [h, Math.min(s, 1), Math.min(l, 1)];
}

function hslToRgb(hsl){
    var h = hsl[0], s = hsl[1], l = hsl[2];
    var r, g, b;

    if(s == 0){
        r = g = b = l; // achromatic
    }else{
        function hue2rgb(p, q, t){
            if(t < 0) t += 1;
            if(t > 1) t -= 1;
            if(t < 1/6) return p + (q - p) * 6 * t;
            if(t < 1/2) return q;
            if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        }

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }
    return [r * 255, g * 255, b * 255];
}

// perform adjustments
function rgbAdjust(rgb, hue, sat, lum) {
    // Convert to hsl and make adjustments
    var hsl = rgbToHsl(rgb[0], rgb[1], rgb[2]);
    hsl = [hsl[0] + hue, hsl[1] + hsl[1] * sat, hsl[2] + hsl[2] * lum];

    // normalize
    hsl[0] = (1 + hsl[0]) % 1; // keep between [0..360]
    hsl[1] = Math.min(hsl[1], 1);
    hsl[2] = Math.min(hsl[2], 1);

    var val = hslToRgb(hsl);
    return [Math.min(val[0], 255), Math.min(val[1], 255), Math.min(val[2], 255)];
}

function randomHex() {
	var r = Math.random()*255;
	var g = Math.random()*255;
	var b = Math.random()*255;
	return rgbToHex([r, g, b]);
}