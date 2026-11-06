/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Token } from '../../token';
import type { Handlers } from '../module';
import type { Condition, Handler } from '../types';
import { hasOwnProperty, isObject } from '../../utils';

/**
 *
 * @param one
 * @param two
 */
function isMatch(one: unknown, two: unknown) {
    if (!one) {
        return true;
    }

    if (Array.isArray(one)) {
        if (
            typeof two !== 'string' &&
            typeof two !== 'number'
        ) {
            return false;
        }

        return one.some((item) => typeof item === 'string' && item.trim() === `${two}`.trim());
    }

    if (!isObject(one) || !isObject(two)) {
        return false;
    }

    const keys = Object.keys(one);

    for (const key of keys) {
        if (!hasOwnProperty(one, key) || !hasOwnProperty(two, key)) {
            return false;
        }

        if (!one[key]) {
            continue;
        }

        if (!isMatch(one[key], two[key])) {
            return false;
        }
    }

    return true;
}

function isHTMLConditionMatch(condition: Condition, token: Token) : boolean {
    if (
        !condition.tag &&
        !condition.attribute
    ) {
        return false;
    }

    if (
        condition.tag
    ) {
        if (condition.tag !== token.name.toLowerCase()) {
            return false;
        }
    }

    if (
        condition.attribute
    ) {
        const keys = Object.keys(condition.attribute);

        for (let i = 0; i < keys.length; i++) {
            if (!isMatch(condition.attribute, token.attrs)) {
                return false;
            }
        }
    }

    return true;
}

function isHandlerMatch(handler: Handler, token: Token) : boolean {
    if (typeof handler.conditions === 'undefined') {
        return false;
    }

    for (let i = 0; i < handler.conditions.length; i++) {
        if (isHTMLConditionMatch(handler.conditions[i], token)) {
            return true;
        }
    }

    return false;
}

export function findHandlerForHTMLToken(handlers: Handlers, token?: Token) : Handler | undefined {
    if (typeof token === 'undefined') {
        return undefined;
    }

    const items = handlers.get();
    const keys = Object.keys(items);

    for (const key of keys) {
        if (isHandlerMatch(items[key], token)) {
            return items[key];
        }
    }

    return undefined;
}
