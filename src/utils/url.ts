/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

const SCHEME_REGEX = /^[a-z][a-z0-9+.-]*:/i;

const ALLOWED_SCHEME_REGEX = /^(https?|s?ftp|mailto|tel|ssh|spotify|skype|teamspeak):/i;

const ALLOWED_DATA_REGEX = /^data:image\/(png|bmp|gif|jpeg|jpg|pjpeg);/i;

// eslint-disable-next-line no-control-regex
const EDGE_REGEX = /^[\u0000- \u007f]+|[\u0000- \u007f]+$/g;

const TAB_OR_NEWLINE_REGEX = /[\t\r\n]/g;

/**
 * Apply the URL policy to a raw URL.
 *
 * Returns the normalised URL to emit, or undefined when its scheme is not allowed.
 * A URL without a scheme (relative, protocol-relative or fragment) is allowed.
 *
 * @param url
 */
export function applyUrlPolicy(url: string) : string | undefined {
    const normalised = url
        .replace(TAB_OR_NEWLINE_REGEX, '')
        .replace(EDGE_REGEX, '');

    if (
        !SCHEME_REGEX.test(normalised) ||
        ALLOWED_SCHEME_REGEX.test(normalised) ||
        ALLOWED_DATA_REGEX.test(normalised)
    ) {
        return normalised;
    }

    return undefined;
}
