/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { escapeCharacters } from '../../utils';

/**
 * Characters and functions which could end the declaration,
 * open a block, escape a character or load a resource.
 */
const unsafeStyleValueRegex = /[;:{}\\/]|url\(|expression\(/i;

/**
 * Escape a CSS value for a double-quoted style attribute,
 * if it is a single plain value.
 *
 * @param value
 */
export function renderStyleValue(value: string | undefined) : string | undefined {
    if (
        typeof value !== 'string' ||
        value.trim().length === 0 ||
        unsafeStyleValueRegex.test(value)
    ) {
        return undefined;
    }

    return escapeCharacters(value, true);
}
