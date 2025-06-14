import color_f from './color_f.js';

import map from 'lodash/map.js';
import at from 'lodash/at.js';

const { max, sqrt } = Math;

const sqr = x => x * x;

export function maseya_blend(base, blend) {
    // Ensure at least a 2.5% change in hue.
    const hue = (blend.r * .95) + .025 + base.hue();

    const chroma_shift = blend.g - .5;
    const base_chroma = base.chroma();
    let chroma = base_chroma;
    if (chroma_shift > 0) {
        // Put heavy limitations on oversaturating colors.
        chroma *= 1 + ((1 - base_chroma) * chroma_shift * .5);
    }
    else {
        // Put no limitation on desaturating colors. However, make it more
        // likely that only a little desaturation will occur.
        chroma *= sqrt(1 - sqr(chroma_shift * 2));
    }

    const luma_shift = blend.b - .5;
    const base_luma = base.luma();
    let luma = base_luma;
    if (luma_shift > 0) {
        // Do not heavily brighten colors. However, if we removed a lot of
        // saturation, then we can allow for some brighter colors.
        const chroma_diff = max(base_chroma - chroma, 0);
        luma *= 1 + ((1 - base_luma) * luma_shift * (1 + chroma_diff));
    }
    else {
        // Do not let colors get too dark.
        luma *= 1 + (luma_shift / 2);
    }

    return color_f.from_hcy(hue, chroma, luma);
}

// Change a color value but allow it to occassionally look ugly
export function classic_blend(base, blend) {
    const constrict = (value) => (value * (240.0 - 60.0) / 255.0) + (60.0 / 255.0);

    blend = color_f(...map(at(blend, 'r', 'g', 'b'), constrict));

    return color_f.from_hsl(
        base.hue() + blend.hue(),
        (base.saturation() + blend.saturation()) / 2,
        base.lightness() * (1.25 - blend.lightness()),
    );
}
