import map from 'lodash/map.js';
import groupBy from 'lodash/groupBy.js';
import findIndex from 'lodash/findIndex.js';
import _max from 'lodash/max.js';
import _min from 'lodash/min.js';

// Creates an array composed of value-group pairs, where each value is a
// representative element from`collection` and its group is an array of
// elements determined from the results of running`comparison` between elements
// of `collection`. The order of the pairs, and the grouped values within, are
// determined by the order they occur in `collection`. The `comparison` is
// invoked with two arguments: (objValue, othValue).
//
// 1. `collection` (Array|Object): The collection to iterate over.
// 2. `comparison` (Function): The predicate that determine if two values should be considered equal. (objValue, othValue)
export function group_values_ordered(collection, comparison) {
    let n = -1, values = [];

    function value_index(value) {
        const i = findIndex(values, v => comparison(v, value));
        if (i < 0) {
            values = [...values, value];
            return n += 1;
        }
        return i;
    }

    const keys_by_index = groupBy(collection, value_index);
    return map(values, (value, i) => [value, keys_by_index[i]]);
}

export function max(...args) {
    return _max(args);
}

export function min(...args) {
    return _min(args);
}

export function le_dw_value(bytes, i) {
    return bytes[i + 0] | (bytes[i + 1] << 8);
}

export function le_dw_bytes(value, d, i) {
    d[i + 0] = value & 0xFF;
    d[i + 1] = (value >>> 8) & 0xFF;
    return d;
}
