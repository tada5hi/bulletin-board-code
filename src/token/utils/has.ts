/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */
import { TokenType } from '../constants';
import { Token } from '../module';

export function hasToken(arr: Token[], name: string, type: `${TokenType}`) {
    let i = arr.length;

    while (i--) {
        if (arr[i].type === type && arr[i].name === name) {
            return true;
        }
    }

    return false;
}
