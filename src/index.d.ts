export declare function color_f(r: number, g: number, b: number): PaletteModifier;

/**
 * Applies a randomized palette to a deep copy of the given ROM data.
 * @param rom The ROM data to modify.
 * @param args A rest parameter of additional arguments to provide.
 * @returns The modified deep copy of the original ROM data.
 */
export function randomize_copy<T extends SeedValue>(rom: Uint8Array, ...args: Array<PaletteRandomizerOptions<T> | ((seed: T) => Generator<PaletteModifier>)>): Uint8Array;

/**
 * Applies a randomized palette to the given ROM data.
 * @param rom The ROM data to modify.
 * @param options An object containing information regarding the randomization
 * mode to use and what aspects of the ROM should be affected.
 * @param next_blend An optional generator function that returns a sequence of
 * color blend values.
 * @returns The modified ROM data.
 */
export function randomize<T extends SeedValue>(rom: Uint8Array, options?: PaletteRandomizerOptions<T>, next_blend?: (seed: T) => Generator<PaletteModifier>): Uint8Array;

type PaletteRandomizerOptions<T extends SeedValue> = {
    mode?: PaletteMode,
    randomize_overworld?: boolean,
    randomize_dungeon?: boolean,
    randomize_link_sprite?: boolean,
    randomize_sword?: boolean,
    randomize_shield?: boolean,
    randomize_hud?: boolean,
    seed?: T,
};

type PaletteModifier = {
    r: number,
    g: number,
    b: number,
    hue: () => number,
    chroma: () => number,
    saturation: () => number,
    luma: () => number,
    lightness: () => number,
    grayscale: () => PaletteModifier,
    invert: () => PaletteModifier,
};

type SeedValue = number | [number, number] | [number, number, number];

type PaletteMode = 'none' | 'maseya' | 'grayscale' | 'negative' | 'blackout' |
    'classic' | 'dizzy' | 'sick' | 'puke';
