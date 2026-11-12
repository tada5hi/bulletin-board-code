/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Handlers } from '../../handler';
import { TokenType } from '../constants';
import type { Token } from '../module';
import { tokenizeHTML } from '../tokenize';
import { HTMLNonRenderedTags, HTMLPreservedTags, isHTMLLayoutBlock } from './layout';
import type { HTMLTokenPipelineContext } from './types';

const WHITESPACE = /[ \t\n\r\f]+/g;

/**
 * Check if an element keeps its text exactly as written.
 *
 * @param handlers
 * @param token
 */
function isPreserved(handlers: Handlers, token: Token) : boolean {
    const name = token.name.toLowerCase();

    if (HTMLPreservedTags.includes(name) || HTMLNonRenderedTags.includes(name)) {
        return true;
    }

    const code = handlers.get('code');

    return !!code && handlers.match(token).includes(code);
}

type WhitespaceFrame = {
    children: Token[],
    block: boolean
};

/**
 * Collapse HTML source whitespace like a browser lays it out.
 * The token tree is changed in place.
 *
 * @param tokens
 * @param handlers
 * @param lazy
 */
export function normalizeHTMLWhitespace(tokens: Token[], handlers: Handlers, lazy = true) : void {
    // In lazy mode, elements which are not rendered are dropped
    // by the converter and take no part in the layout.
    const isDropped = (token: Token) : boolean => lazy &&
        token.type === TokenType.OPEN &&
        HTMLNonRenderedTags.includes(token.name.toLowerCase());

    const isBlock = (token: Token) : boolean => !isDropped(token) &&
        isHTMLLayoutBlock(handlers, token);

    // Whitespace next to block level elements and line breaks is removed.
    const isBoundary = (token: Token) : boolean => {
        if (token.type === TokenType.NEWLINE) {
            return true;
        }

        if (token.type !== TokenType.OPEN) {
            return false;
        }

        return token.name.toLowerCase() === 'br' || isBlock(token);
    };

    // Find the closest token which takes part in the layout.
    const findRendered = (items: Token[], index: number, step: 1 | -1) : Token | undefined => {
        let i = index;

        while (items[i] && isDropped(items[i])) {
            i += step;
        }

        return items[i];
    };

    const stack : WhitespaceFrame[] = [{ children: tokens, block: true }];

    while (stack.length > 0) {
        const { children, block } = stack.pop() as WhitespaceFrame;
        const output : Token[] = [];

        for (let i = 0; i < children.length; i++) {
            const token = children[i];

            if (token.type === TokenType.OPEN) {
                if (!isPreserved(handlers, token)) {
                    stack.push({
                        children: token.children,
                        block: isBlock(token),
                    });
                }

                output.push(token);

                continue;
            }

            if (token.type !== TokenType.CONTENT) {
                output.push(token);

                continue;
            }

            let value = token.value.replace(WHITESPACE, ' ');

            const previous = findRendered(output, output.length - 1, -1);

            if (
                previous ?
                    isBoundary(previous) ||
                    (previous.type === TokenType.CONTENT && previous.value.endsWith(' ')) :
                    block
            ) {
                value = value.replace(/^ /, '');
            }

            const next = findRendered(children, i + 1, 1);

            if (next ? isBoundary(next) : block) {
                value = value.replace(/ $/, '');
            }

            if (value.length > 0) {
                token.value = value;
                output.push(token);
            }
        }

        children.splice(0, children.length, ...output);
    }
}

/**
 * Turn HTML text into a token tree:
 * tokenize -> collapse whitespace.
 *
 * @param context
 */
export function parseHTMLTokens(context: HTMLTokenPipelineContext) : Token[] {
    const tokens = tokenizeHTML(context.input);

    normalizeHTMLWhitespace(tokens, context.handlers, context.lazy);

    return tokens;
}
