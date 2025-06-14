import dungeon from './dungeon.json' with { type: 'json' };
import hud from './hud.json' with { type: 'json' };
import link_sprite from './link_sprite.json' with { type: 'json' };
import shield from './shield.json' with { type: 'json' };
import sword from './sword.json' with { type: 'json' };
import overworld from './overworld.json' with { type: 'json' };

import compact from 'lodash/compact.js';
import flatten from 'lodash/flatten.js';

export default function(options) {
    return flatten(
        compact([
            options.randomize_dungeon && dungeon,
            options.randomize_hud && hud,
            options.randomize_link_sprite && link_sprite,
            options.randomize_sword && sword,
            options.randomize_shield && shield,
            options.randomize_overworld && overworld,
        ])
    );
}
