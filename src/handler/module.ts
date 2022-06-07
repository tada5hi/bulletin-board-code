/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Handlers } from './constants';
import { Handler } from './type';
import { extendHandler } from './utils';
import { hasOwnProperty } from '../utils';

let instance : Record<string, Handler>;

export function useHandlers() : Record<string, Handler> {
    if (typeof instance !== 'undefined') {
        return instance;
    }

    instance = {};

    const keys = Object.keys(Handlers);
    for (let i = 0; i < keys.length; i++) {
        instance[keys[i]] = extendHandler(Handlers[keys[i]]);
    }

    return instance;
}

export function getHandler(key: string) : Handler | undefined {
    useHandlers();

    return instance[key];
}

export function setHandler(key: string, value: Handler) {
    useHandlers();

    instance[key] = value;
}

export function unsetHandler(key: string | string[]) {
    useHandlers();

    const keys = Array.isArray(key) ? key : [key];

    for (let i = 0; i < keys.length; i++) {
        if (hasOwnProperty(instance, keys[i])) {
            delete instance[keys[i]];
        }
    }
}
