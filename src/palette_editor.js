import color_f from './color_f.js';

import { group_values_ordered } from './util.js';
import { le_dw_value, le_dw_bytes } from './util.js';

import each from 'lodash/each.js';
import mapValues from 'lodash/mapValues.js';
import transform from 'lodash/transform.js';
import clamp from 'lodash/clamp.js';
import parseInt from 'lodash/parseInt.js';

export default function (rom, offsets) {
    const methods = {};

    let items = transform(offsets,
        (items, offset) => {
            const [r, g, b] = offset >= 0 ? raw(offset) : oam(-offset);
            items[offset] = color_f(r / 0xFF, g / 0xFF, b / 0xFF);
        },
        {});
    const by_color = group_values_ordered(offsets, (a, b) => color_f.equals(items[a], items[b]))

    function raw(offset) {
        const color = le_dw_value(rom, offset);
        const r = (color >>> 0) & 0x1F;
        const g = (color >>> 5) & 0x1F;
        const b = (color >>> 10) & 0x1F;
        return [r << 3, g << 3, b << 3];
    }

    function oam(offset) {
        const r = rom[offset + 0] & 0x1F;
        const g = rom[offset + 1] & 0x1F;
        const b = rom[offset + 4] & 0x1F;
        return [r << 3, g << 3, b << 3];
    }

    methods.blend_uniformly = blend_uniformly;
    function blend_uniformly(blend_fn, blend_iter) {
        const blend = blend_iter.next();
        if (blend.done)
            throw new Error("Reached the end of blend iterator");
        items = mapValues(items, color => blend_fn(color, blend.value));
    };

    methods.blend_per_color = blend_per_color;
    function blend_per_color(blend_fn, blend_iter) {
        for (const [offset, offsets] of by_color) {
            const base = items[offset];
            const blend = blend_iter.next();
            if (blend.done)
                throw new Error("Reached the end of blend iterator");
            const color = blend_fn(base, blend.value);
            each(offsets, offset => items[offset] = color);
        }
    }

    methods.write_to_rom = write_to_rom;
    function write_to_rom(rom) {
        each(items, (color, offset) => {
            offset = parseInt(offset);
            offset >= 0 ? raw(color, offset) : oam(color, -offset)
        });

        function raw(color, offset) {
            const [r, g, b] = snes_5bit_channels(color);
            const value = snes_color_value(r, g, b);
            le_dw_bytes(value, rom, offset);
        }

        function oam(color, offset) {
            const [r, g, b] = snes_5bit_channels(color);
            rom[offset + 0] = 0x20 | r;
            rom[offset + 1] = 0x40 | g;
            rom[offset + 3] = 0x40 | g;
            rom[offset + 4] = 0x80 | b;
        }

        function snes_5bit_channels(color) {
            function convert_channel(x) {
                // Convert channel from [0,1] (float point) to [0,255] (integer).
                x = (x * 255 + .5) >>> 0;
                // Convert to 5-bit snes channel, with +4 for 8 boundary rounding.
                return clamp(x + 4, 255) >>> 3;
            }

            const r = convert_channel(color.r);
            const g = convert_channel(color.g);
            const b = convert_channel(color.b);
            return [r, g, b];
        }

        function snes_color_value(r, g, b) {
            return r | (g << 5) | (b << 10);
        }
    }

    return methods;
};
