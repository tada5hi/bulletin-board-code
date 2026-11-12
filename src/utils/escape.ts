/*
 * Copyright (c) 2022-2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export function escapeCharacters(str: string, noQuotes?: boolean) {
    if (!str) {
        return str;
    }

    const replacements : Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '  ': '&nbsp; ',
        '\r\n': '<br />',
        '\r': '<br />',
        '\n': '<br />',
    };

    if (noQuotes !== false) {
        replacements['"'] = '&#34;';
        replacements['\''] = '&#39;';
        replacements['`'] = '&#96;';
    }

    str = str.replace(/ {2}|\r\n|[&<>\r\n'"`]/g, (match) => replacements[match] || match);

    return str;
}
