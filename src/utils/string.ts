/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */
import { escapeCharacters } from './escape';

export function formatString(str: string, obj: Record<string, any>) {
    return str.replace(/\{([^}]+)\}/g, (match, group) => {
        let escape = true;

        if (group.charAt(0) === '!') {
            escape = false;
            group = group.substring(1);
        }

        if (group === '0') {
            escape = false;
        }

        if (typeof obj[group] === 'undefined') {
            return match;
        }

        return escape ? escapeCharacters(obj[group], true) : obj[group];
    });
}
