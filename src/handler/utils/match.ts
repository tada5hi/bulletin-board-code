/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Token } from '../../token';
import type { Condition, Handler } from '../types';
import { hasOwnProperty, isObject } from '../../utils';

/**
 * Compare a condition value against a token value.
 *
 * - falsy: the value must be present (an empty array counts as absent)
 * - string/number: equal after trim (array token values must contain it)
 * - array: any element matches
 * - object: every key matches recursively
 *
 * @param expected
 * @param actual
 */
function isValueMatch(expected: unknown, actual: unknown) : boolean {
    if (!expected) {
        if (Array.isArray(actual)) {
            return actual.length > 0;
        }

        return typeof actual !== 'undefined';
    }

    if (Array.isArray(expected)) {
        return expected.some((item) => isValueMatch(item, actual));
    }

    if (isObject(expected)) {
        if (!isObject(actual)) {
            return false;
        }

        const keys = Object.keys(expected);

        for (const key of keys) {
            if (!isValueMatch(expected[key], hasOwnProperty(actual, key) ? actual[key] : undefined)) {
                return false;
            }
        }

        return true;
    }

    if (typeof expected !== 'string' && typeof expected !== 'number') {
        return false;
    }

    const value = `${expected}`.trim();

    if (Array.isArray(actual)) {
        return actual.some((item) => `${item}`.trim() === value);
    }

    if (typeof actual !== 'string' && typeof actual !== 'number') {
        return false;
    }

    return `${actual}`.trim() === value;
}

enum MatchKind {
    NONE = 0,
    ATTRIBUTE = 1,
    TAG = 2,
    TAG_ATTRIBUTE = 3,
}

function matchCondition(condition: Condition, token: Token) : MatchKind {
    if (condition.attribute) {
        if (
            Object.keys(condition.attribute).length === 0 ||
            !isValueMatch(condition.attribute, token.attrs)
        ) {
            return MatchKind.NONE;
        }
    }

    if (condition.tag) {
        if (condition.tag.toLowerCase() !== token.name.toLowerCase()) {
            return MatchKind.NONE;
        }

        return condition.attribute ? MatchKind.TAG_ATTRIBUTE : MatchKind.TAG;
    }

    return condition.attribute ? MatchKind.ATTRIBUTE : MatchKind.NONE;
}

/**
 * Find all handlers matching an HTML token.
 *
 * At most one tag matched handler comes first (tag+attribute conditions
 * beat tag-only conditions, then registry order), followed by every handler
 * matched only through attribute-only conditions, in registry order.
 *
 * @param items
 * @param token
 */
export function matchHandlers(items: Record<string, Handler>, token: Token) : Handler[] {
    let tagged : Handler | undefined;
    let taggedKind = MatchKind.NONE;
    const attributed : Handler[] = [];

    const keys = Object.keys(items);

    for (const key of keys) {
        const conditions = items[key].conditions || [];

        let kind = MatchKind.NONE;

        for (const condition of conditions) {
            kind = Math.max(kind, matchCondition(condition, token));
        }

        if (kind === MatchKind.ATTRIBUTE) {
            attributed.push(items[key]);
        } else if (kind > taggedKind) {
            tagged = items[key];
            taggedKind = kind;
        }
    }

    return tagged ? [tagged, ...attributed] : attributed;
}
