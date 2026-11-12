/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */
import type { TokenType } from '../constants';
import type { Token } from '../module';

export function hasToken(arr: Token[], name: string, type: `${TokenType}`, start = 0) {
    let i = arr.length;

    while (i-- > start) {
        if (arr[i].type === type && arr[i].name === name) {
            return true;
        }
    }

    return false;
}
