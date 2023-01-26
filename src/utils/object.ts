/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { hasOwnProperty } from './has-own-property';

export function getObjectPathValue<T extends Record<string, any>>(data: T, path: string) : string | undefined {
    const parts = path.split('.');

    const key = parts.shift();

    if (!key || !hasOwnProperty(data, key)) {
        return undefined;
    }

    if (parts.length === 0) {
        if (
            typeof data[key] === 'string' ||
            typeof data[key] === 'number'
        ) {
            return `${data[key]}`;
        }

        return undefined;
    }

    return getObjectPathValue(data[key], parts.join('.'));
}

export function isObject(item: unknown) : item is Record<string, any> {
    return (
        !!item &&
        typeof item === 'object' &&
        !Array.isArray(item)
    );
}
