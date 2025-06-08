import with_cases from './with_cases.js';
import chai from 'chai';
chai.should();

import map from 'lodash/map.js';

import color_f from '../src/color_f.js';

const delta = 10e-9;

const _1 = 23 / 255;
const _2 = 59 / 255;
const _3 = 97 / 255;
const _4 = 137 / 255;
const _5 = 179 / 255;
const _6 = 251 / 255;

const rep = (n) => `${n.toPrecision(4)}..`;

describe('color_f', () => {

    context('trait', () => {

        context('hue', () => {

            with_cases(
            [0, [0, 0, 0]],
            [0, [1, 1, 1]],
            [.94590643, [_6, _1, _3]],
            [.05409357, [_6, _3, _1]],
            [.27923977, [_3, _6, _1]],
            [.38742690, [_1, _6, _3]],
            [.61257310, [_1, _3, _6]],
            [.72076023, [_3, _1, _6]],
            (hue, rgb) => it(`is ${rep(hue)} for rgb values (${map(rgb, rep)})`, () => {
                color_f(...rgb).hue().should.be.closeTo(hue, delta);
            }));

        });

        context('chroma', () => {

            with_cases(
            [0, [0, 0, 0]],
            [0, [1, 1, 1]],
            [_1, [_1, 0, 0]],
            [_1, [0, _1, 0]],
            [_1, [0, 0, _1]],
            [_1, [_1, _1, 0]],
            [_3 - _1, [_1, _2, _3]],
            [_3 - _1, [_1, _3, _2]],
            [_3 - _1, [_2, _1, _3]],
            (chroma, rgb) => it(`is ${rep(chroma)} for rgb values (${map(rgb, rep)})`, () => {
                color_f(...rgb).chroma().should.equal(chroma);
            }));

        });

        context('saturation', () => {

            with_cases(
            [0, [0, 0, 0]],
            [0, [1, 1, 1]],
            [.61666667, [_1, _2, _3]], //23  97  C 0,29019607843137254901960784313725 L 0,23529411764705882352941176470588
            [.77227723, [_1, _3, _5]], //23  179 C 0,61176470588235294117647058823529 L 0,3960784313725490196078431372549
            [.39795918, [_2, _3, _4]], //59  137 C 0,30588235294117647058823529411765 L 0,38431372549019607843137254901961
            [.96000000, [_2, _4, _6]], //59  251 C 0,75294117647058823529411764705882 L 0,6078431372549019607843137254902
            [.95061728, [_3, _5, _6]], //97  251 C 0,6039215686274509803921568627451  L 0,68235294117647058823529411764706
            [.93442623, [_4, _5, _6]], //137 251 C 0,44705882352941176470588235294118 L 0,76078431372549019607843137254902
            (saturation, rgb) => it(`is ${rep(saturation)} for rgb values (${map(rgb, rep)})`, () => {
                color_f(...rgb).saturation().should.be.closeTo(saturation, delta);
            }));

        });

        context('luma', () => {

            with_cases(
            [0, [0, 0, 0]],
            [1, [1, 1, 1]],
            [.20614901, [_1, _2, _3]],
            [.35371764, [_2, _3, _4]],
            [.50912941, [_3, _4, _5]],
            [.68490196, [_4, _5, _6]],
            (luma, rgb) => it(`is ${rep(luma)} for rgb values (${map(rgb, rep)})`, () => {
                color_f(...rgb).luma().should.be.closeTo(luma, delta);
            }));

        });

        context('lightness', () => {

            with_cases(
            [0, [0, 0, 0]],
            [1, [1, 1, 1]],
            [_1 * .5 + 0, [_1, 0, 0]],
            [_1 * .5 + 0, [0, _1, 0]],
            [_1 * .5 + 0, [0, 0, _1]],
            [_1 * .5 + .5, [_1, 1, 1]],
            [_1 * .5 + .5, [1, _1, 1]],
            [_1 * .5 + .5, [1, 1, _1]],
            [(_1 + _3) * .5, [_1, _2, _3]],
            [(_1 + _3) * .5, [_1, _3, _2]],
            [(_1 + _3) * .5, [_2, _1, _3]],
            (lightness, rgb) => it(`is ${rep(lightness)} for rgb values (${map(rgb, rep)})`, () => {
                color_f(...rgb).lightness().should.be.closeTo(lightness, delta);
            }));

        });

    });

    context('create from hcy space', () => {

        with_cases(
        [[0, 0], [0, 0, 0]],
        [[_3, 0], [0, 0, 0]],
        [[_1, _2], [.23137255, .12521337, 0]],
        [[_2, _4], [.32867359, .53725490, 0]],
        [[_3, _6], [0, .98431373, .27792388]],
        [[_4, _1], [0, .07003460, .09019608]],
        [[_5, _3], [.08055363, 0, .38039216]],
        [[_6, _5], [.70196078, 0, .06606690]],
        ([h, c], rgb) => it(`hue ${rep(h)}, chroma ${rep(c)}, no luma gives rgb values (${map(rgb, rep)})`, () => {
            const [expected_r, expected_g, expected_b] = rgb;

            const { r, g, b } = color_f.from_hcy(h, c, 0);

            r.should.be.closeTo(expected_r, delta, 'R component');
            g.should.be.closeTo(expected_g, delta, 'G component');
            b.should.be.closeTo(expected_b, delta, 'B component');
        }));

        with_cases(
        [[_2, _4, _3], [.32867359, .53725490, 0]],
        [[_2, _4, _6], [.89934528, 1, .57067170]],
        [[_4, _1, _3], [.32899949, .39903409, .41919557]],
        [[_4, _1, _6], [.93292106, 1, 1]],
        ([h, c, y], rgb) => it(`hue ${rep(h)}, chroma ${rep(c)}, luma ${rep(y)} gives rgb values (${map(rgb, rep)})`, () => {
            const [expected_r, expected_g, expected_b] = rgb;

            const { r, g, b } = color_f.from_hcy(h, c, y);

            r.should.be.closeTo(expected_r, delta, 'R component');
            g.should.be.closeTo(expected_g, delta, 'G component');
            b.should.be.closeTo(expected_b, delta, 'B component');
        }));

    });

    context('create from hsl space', () => {

        with_cases(
        [[0, 0, 0], [0, 0, 0]],
        [[_3, 0, 0], [0, 0, 0]],
        [[_3, _3, 0], [0, 0, 0]],
        [[_2, _4, _3], [.42607432, .58475971, .17602461]],
        [[_2, _4, _6], [.98619753, .99274125, .97588620]],
        [[_4, _1, _3], [.34608228, .39936350, .41470204]],
        [[_4, _1, _6], [.98289889, .98509605, .98572857]],
        ([h, s, l], rgb) => it(`hue ${rep(h)}, saturation ${rep(s)}, lightness ${rep(l)} gives rgb values (${map(rgb, rep)})`, () => {
            const [expected_r, expected_g, expected_b] = rgb;

            const { r, g, b } = color_f.from_hsl(h, s, l);

            r.should.be.closeTo(expected_r, delta, 'R component');
            g.should.be.closeTo(expected_g, delta, 'G component');
            b.should.be.closeTo(expected_b, delta, 'B component');
        }));

    });

    context('operation', () => {

        with_cases(
        [0, [0, 0, 0]],
        [.20614901, [_1, _2, _3]],
        [.35371764, [_2, _3, _4]],
        [.50912941, [_3, _4, _5]],
        [.68490196, [_4, _5, _6]],
        (luma, rgb) => it(`grayscale on (${map(rgb, rep)}) gives all values ${rep(luma)}`, () => {
            const { r, g, b } = color_f(...rgb).grayscale();

            r.should.be.closeTo(luma, delta, 'R component');
            g.should.be.closeTo(luma, delta, 'G component');
            b.should.be.closeTo(luma, delta, 'B component');
        }));

        with_cases(
        [[0, 0, 0], [1, 1, 1]],
        [[1, 1, 1], [0, 0, 0]],
        [[_1, _2, _3], [.90980392, .76862745, .61960784]],
        (from, to) => it(`invert on (${map(from, rep)}) gives (${map(to, rep)})`, () => {
            const [expected_r, expected_g, expected_b] = to;

            const { r: actual_r, g: actual_g, b: actual_b } = color_f(...from).invert();

            actual_r.should.be.closeTo(expected_r, delta, 'R component');
            actual_g.should.be.closeTo(expected_g, delta, 'G component');
            actual_b.should.be.closeTo(expected_b, delta, 'B component');
        }));

    });

});
