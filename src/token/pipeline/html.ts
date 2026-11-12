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
import { HTMLPreservedTags, isHTMLLayoutBlock } from './layout';
import type { HTMLTokenPipelineContext } from './types';

const WHITESPACE = /[ \t\n\r\f]+/g;

/**
 * Check if an element keeps its text exactly as written.
 *
 * @param handlers
 * @param token
 */
function isPreserved(handlers: Handlers, token: Token) : boolean {
    if (HTMLPreservedTags.includes(token.name.toLowerCase())) {
        return true;
    }

    const code = handlers.get('code');

    return !!code && handlers.match(token).includes(code);
}

/**
 * Check if whitespace next to a token is removed:
 * block level elements and line breaks.
 *
 * @param handlers
 * @param token
 */
function isBoundary(handlers: Handlers, token: Token) : boolean {
    if (token.type === TokenType.NEWLINE) {
        return true;
    }

    if (token.type !== TokenType.OPEN) {
        return false;
    }

    return token.name.toLowerCase() === 'br' || isHTMLLayoutBlock(handlers, token);
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
 */
export function normalizeHTMLWhitespace(tokens: Token[], handlers: Handlers) : void {
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
                        block: isHTMLLayoutBlock(handlers, token),
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

            const previous = output[output.length - 1];

            if (
                previous ?
                    isBoundary(handlers, previous) ||
                    (previous.type === TokenType.CONTENT && previous.value.endsWith(' ')) :
                    block
            ) {
                value = value.replace(/^ /, '');
            }

            const next = children[i + 1];

            if (next ? isBoundary(handlers, next) : block) {
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

    normalizeHTMLWhitespace(tokens, context.handlers);

    return tokens;
}
