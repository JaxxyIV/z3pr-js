import chai from 'chai';
chai.should();

import times from 'lodash/times.js';
import random from 'lodash/random.js';

const { abs, min } = Math;

import color_f from '../src/color_f.js';

import { maseya_blend } from '../src/blends.js';

const delta = 10e-9;
const repeats = 500;

describe('Maseya blend function', () => {

    context('hue', () => {

        it('is changed by at least +/- 2.5% when color is chromatic', () => {
            times(repeats, () => {
                const x = some_color();
                if (is_grayscale(x)) return;

                // Here we pick a chroma and luma that give a minimal change
                const y1 = color_f(0, .5, 0);
                const y2 = color_f(1, .5, 0);

                const z1 = maseya_blend(x, y1);
                const z2 = maseya_blend(x, y2);

                hue_diff(x.hue(), z1.hue()).should.be.at.least(.025 - delta, 'changing clockwise');
                hue_diff(x.hue(), z2.hue()).should.be.at.least(.025 - delta, 'changing counterclockwise');
            });
        });

        function hue_diff(a, b) {
            const rotate = (x) => (x + 2 / 6) % 1;
            return min(abs(a - b), abs(rotate(a) - rotate(b)));
        }

    });

    context('saturation', () => {

        it('increases by an inverse scaled proportion', () => {
            times(repeats, () => {
                const x = some_color();
                const y = color_f(0, random(.5 + delta, 1), .5);

                const z = maseya_blend(x, y);
                if (probably_clamped(z)) return;

                const scale = .5;
                const lower = x.chroma();
                const upper = lower * (1 + (1 - lower) * .5 * scale);
                z.chroma().should.be.within(lower, upper);
            });
        });

        it('can decrease to any degree', () => {
            times(repeats, () => {
                const x = some_color();
                const y = color_f(0, random(0, .5), .5);

                const z = maseya_blend(x, y);

                const lower = 0;
                const upper = x.chroma();
                z.chroma().should.be.within(lower, upper);
            });
        });

        it('does not decrease when blended with medium chroma', () => {
            times(repeats, () => {
                const x = some_color();
                const y = color_f(0, .5, .5);

                const z = maseya_blend(x, y);

                const x_chroma = with_minimal_hue_shift(x).chroma();
                z.chroma().should.equal(x_chroma);
            });
        });

        it('decreases to grayscale when blended with zero chroma', () => {
            times(repeats, () => {
                const x = some_color();
                const y = color_f(0, 0, .5);

                const z = maseya_blend(x, y);

                z.chroma().should.equal(0);
            });
        });

    });

    context('brightness', () => {

        it('increases by an inverse proportion', () => {
            times(repeats, () => {
                const x = some_color();
                // Here we pick a chroma that gives a minimal change
                const y = color_f(0, .5, random(.5 + delta, 1));

                const z = maseya_blend(x, y);

                const lower = with_minimal_hue_shift(x).luma();
                const upper = lower * (1 + (1 - lower) * .5);
                z.luma().should.be.within(lower, upper);
            });
        });

        it('can decrease by a fraction', () => {
            times(repeats, () => {
                const x = some_color();
                // Here we pick a chroma that gives a minimal change
                const y = color_f(0, .5, random(0, .5));

                const z = maseya_blend(x, y);

                const upper = with_minimal_hue_shift(x).luma();
                const lower = upper * .75;
                z.luma().should.be.within(lower, upper);
            });
        });

        it('increases more if decreasing saturation a lot', () => {
            times(repeats, () => {
                const x = some_color();
                // Here we pick a chroma that gives a big decrease but not to grayscale
                const y1 = color_f(0, 1 / 16, .75);
                const y2 = color_f(0, 2 / 16, .75);

                const z1 = maseya_blend(x, y1);
                const z2 = maseya_blend(x, y2);

                z1.luma().should.be.above(z2.luma());
            });
        });

        it('does not change when blended with medium luma', () => {
            times(repeats, () => {
                const x = some_color();
                const y = color_f(0, .5, .5);

                const z = maseya_blend(x, y);

                const x_luma = with_minimal_hue_shift(x).luma();
                z.luma().should.equal(x_luma);
            });
        });

    });

    function is_grayscale(c) {
        return c.chroma() <= 0;
    }

    function probably_clamped(c) {
        return c.r >= 1 || c.g >= 1 || c.b >= 1;
    }

    function with_minimal_hue_shift(c) {
        return color_f.from_hcy(c.hue() + .025, c.chroma(), c.luma());
    }

    function some_color() {
        return color_f(unit(), unit(), unit());
    }

    function unit() {
        return random(1, true);
    }

});
