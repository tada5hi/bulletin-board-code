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

const VALID_SCHEME_REGEX = /^(https?|s?ftp|mailto|spotify|skype|ssh|teamspeak|tel):|(\/\/)|data:image\/(png|bmp|gif|p?jpe?g);/i;

export function escapeUriScheme(url: string) {
    let path : string[] = [];
    // If there is a : before a / then it has a scheme
    const hasScheme = /^[^/]*:/i;

    // Has no scheme or a valid scheme
    if ((!url || !hasScheme.test(url)) || VALID_SCHEME_REGEX.test(url)) {
        return url;
    }

    if (
        typeof window !== 'undefined' &&
        window.location
    ) {
        const { location } = window;

        path = location.pathname.split('/');
        path.pop();

        return `${location.protocol}//${location.host}${path.join('/')}/${url}`;
    }

    return url;
}
