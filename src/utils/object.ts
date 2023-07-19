/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export function getObjectPathValue(data: Record<string, any>, key: string) : any {
    const index = key.indexOf('.');
    const currentKey = index === -1 ?
        key :
        key.substring(0, index);

    if (index === -1) {
        return data[currentKey];
    }

    if (!isObject(data[currentKey])) {
        return undefined;
    }

    const nextKey = key.substring(currentKey.length + 1);
    return getObjectPathValue(data[currentKey], nextKey);
}

export function isObject(item: unknown) : item is Record<string, any> {
    return (
        !!item &&
        typeof item === 'object' &&
        !Array.isArray(item)
    );
}
