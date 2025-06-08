import sfc32 from './sfc32.js';

import times from 'lodash/times.js';
import isEmpty from 'lodash/isEmpty.js';

const inclusive_max = 0xFFFFFFFF;
const exclusive_max = 0x100000000;

export default function random(...seed) {
    seed = isEmpty(seed) ? times(3, native_random_32) : seed;
    const _sfc = sfc32(...seed);
    return () => _sfc.next32() / inclusive_max;
}

function native_random_32() {
    return Math.floor(Math.random() * exclusive_max);
}
