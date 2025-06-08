import { max, min } from './util.js';

import at from 'lodash/at.js';
import isEqual from 'lodash/isEqual.js';
import clamp from 'lodash/clamp.js';

const { abs } = Math;

const luma_r = .299;
const luma_g = .587;
const luma_b = .114;

function color_f(r, g, b) {
    const methods = {};

    r = clamp(r, 0, 1);
    g = clamp(g, 0, 1);
    b = clamp(b, 0, 1);

    methods.hue = hue;
    function hue() {
        // When chroma is zero, there is no hue, as the color is not any more
        // red, green, or blue. Technically, NaN should be returned, but this
        // causes a lot of exceptional circumstances that need to be checked,
        // especially in blending. So we just say the hue is vacuously zero.
        // This doesn't hurt the structure in any way and lets us make
        // assumptions during other calculations.
        const _chroma = chroma();
        if (_chroma === 0)
            return 0;

        const _max = max(r, g, b);
        let hue;
        if (_max === r) {
            hue = (g - b) / _chroma;
            if (hue < 0)
                hue += 6;
        }
        else if (_max === g) {
            hue = ((b - r) / _chroma) + 2;
        }
        // _max === b
        else {
            hue = ((r - g) / _chroma) + 4;
        }

        return hue / 6;
    }

    methods.chroma = chroma;
    function chroma() {
        return max(r, g, b) - min(r, g, b);
    }

    methods.saturation = saturation;
    function saturation() {
        const lightness = this.lightness();
        if (lightness === 0 || lightness === 1)
            return 0;
        const saturation = this.chroma() / (1 - abs(lightness * 2 - 1));
        return clamp(saturation, 0, 1);
    }

    methods.luma = luma;
    function luma() {
        return (luma_r * r) + (luma_g * g) + (luma_b * b);
    }

    methods.lightness = lightness;
    function lightness() {
        return (max(r, g, b) + min(r, g, b)) / 2;
    }

    methods.grayscale = () => color_f.from_hcy(0, 0, luma());

    methods.invert = () => color_f(1 - r, 1 - g, 1 - b);

    return { ...methods, r, g, b };
}

color_f.hue_blend = (a, b) => color_f.from_hcy(b.hue(), a.chroma(), a.luma());

color_f.luma_blend = (a, b) => color_f.from_hcy(a.hue(), a.chroma(), b.luma());

color_f.from_hcy = (hue, chroma, luma) => {
    chroma = clamp(chroma, 0, 1);
    luma = clamp(luma, 0, 1);

    const base = color_from_hc(hue, chroma);
    const min = max(luma - base.luma(), 0);
    return color_f(min + base.r, min + base.g, min + base.b);
};

color_f.from_hsl = (hue, saturation, lightness) => {
    saturation = clamp(saturation, 0, 1);
    lightness = clamp(lightness, 0, 1);

    const chroma = (1 - abs(lightness * 2 - 1)) * saturation;
    const base = color_from_hc(hue, chroma);
    const match = lightness - (chroma / 2);
    return color_f(match + base.r, match + base.g, match + base.b);
};

function color_from_hc(hue, chroma) {
    if (chroma === 0)
        return color_f(0, 0, 0);

    while (hue < 0) hue += 1;
    while (hue >= 1) hue -= 1;

    hue *= 6;
    const x = chroma * (1 - abs((hue % 2) - 1));
    const values =
          hue <= 1 ? [chroma, x, 0]
        : hue <= 2 ? [x, chroma, 0]
        : hue <= 3 ? [0, chroma, x]
        : hue <= 4 ? [0, x, chroma]
        : hue <= 5 ? [x, 0, chroma]
                   : [chroma, 0, x];

    return color_f(...values);
}

color_f.equals = (a, b) => isEqual(
    at(a, 'r', 'g', 'b'),
    at(b, 'r', 'g', 'b')
);

color_f.black = color_f(0, 0, 0);

export default color_f;
