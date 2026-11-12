/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { applyUrlPolicy, escapeCharacters } from '../../utils';

/**
 * Apply the URL policy and escape the result for a double-quoted attribute.
 *
 * A URL built from converted content is already HTML-escaped,
 * except for the markup of nested handlers, so only its quotes are escaped.
 *
 * @param url
 * @param isContent
 */
export function renderUrlAttribute(url: string, isContent: boolean) : string | undefined {
    const allowed = applyUrlPolicy(url);

    if (typeof allowed === 'undefined') {
        return undefined;
    }

    return isContent ?
        allowed.replace(/"/g, '&#34;') :
        escapeCharacters(allowed, true);
}
