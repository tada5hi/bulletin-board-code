/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

/**
 * Convert 10base to 16base.
 *
 * @param input
 */
function toHex(input: string | number) {
    let number: number | string = parseInt(`${input}`, 10);

    if (Number.isNaN(number)) {
        return '00';
    }

    number = Math.max(0, Math.min(number, 255)).toString(16);

    return number.length < 2 ? `0${number}` : number;
}

/**
 * Convert rgb, rgba to hex code.
 *
 * @param input
 */
export function normaliseColor(input: string) : string {
    input = input || '#000';

    let match = input.match(/rgb\((\d{1,3}),\s*?(\d{1,3}),\s*?(\d{1,3})\)/i);
    // rgb(n,n,n);
    if (match) {
        return `#${toHex(match[1])}${toHex(match[2])}${toHex(match[3])}`;
    }

    match = input.match(/#([0-f])([0-f])([0-f])\s*?$/i);

    // expand shorthand
    if (match) {
        return `#${match[1]}${match[1]}${match[2]}${match[2]}${match[3]}${match[3]}`;
    }

    return input;
}
