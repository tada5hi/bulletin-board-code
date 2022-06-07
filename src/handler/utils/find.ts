/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Token } from '../../token';
import { Condition, Handler } from '../type';
import { hasOwnProperty } from '../../utils';
import { useHandlers } from '../module';

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

    if (typeof one !== 'object' && typeof two !== 'object') {
        return false;
    }

    const keys = Object.keys(one);
    for (let i = 0; i < keys.length; i++) {
        if (!hasOwnProperty(one, keys[i]) || !hasOwnProperty(two, keys[i])) {
            return false;
        }

        if (!one[keys[i]]) {
            // eslint-disable-next-line no-continue
            continue;
        }

        if (!isMatch(one[keys[i]], two[keys[i]])) {
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

export function findHandlerForHTMLToken(token: Token) : Handler | undefined {
    const handlers = useHandlers();
    const keys = Object.keys(handlers);

    for (let i = 0; i < keys.length; i++) {
        if (isHandlerMatch(handlers[keys[i]], token)) {
            return handlers[keys[i]];
        }
    }

    return undefined;
}
