/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ConverterOptions, Handlers } from '../../handler';
import type { Token } from '../../token';
import { isTagMatch } from '../../handler/utils';
import { HTMLBlockTags, HTMLNonRenderedTags, TokenBreakDefaultOptions } from '../../token/pipeline';
import { walkTokens } from '../walk';

/**
 * Check if a token is a block level element.
 *
 * @param token
 */
function isBlock(token: Token) : boolean {
    return HTMLBlockTags.includes(token.name.toLowerCase());
}

/**
 * Check if a block level element separates its output from what follows.
 *
 * @param token
 * @param content
 */
function isSeparated(token: Token, content: string) : boolean {
    return isBlock(token) &&
        content.length > 0 &&
        !content.endsWith('\n');
}

/**
 * Render html tokens as bbcode; the input tokens are not mutated.
 *
 * @param tokens
 * @param handlers
 * @param options
 */
export function convertHTMLToBBCode(
    tokens: Token[],
    handlers: Handlers,
    options: ConverterOptions = {},
) : string {
    const breakOptions = {
        breakBeforeBlock: options.breakBeforeBlock ?? TokenBreakDefaultOptions.breakBeforeBlock,
        breakStartBlock: options.breakStartBlock ?? TokenBreakDefaultOptions.breakStartBlock,
        breakEndBlock: options.breakEndBlock ?? TokenBreakDefaultOptions.breakEndBlock,
        breakAfterBlock: options.breakAfterBlock ?? TokenBreakDefaultOptions.breakAfterBlock,
    };

    // Line breaks and, in lazy mode, dropped elements follow their
    // element rules whatever handlers their attributes match.
    const isIntrinsic = (token: Token) : boolean => {
        const name = token.name.toLowerCase();

        return name === 'br' || (!!options.lazy && HTMLNonRenderedTags.includes(name));
    };

    return walkTokens({
        tokens,
        handlers,
        options,
    }, {
        resolve: (token) => (isIntrinsic(token) ? [] : handlers.match(token)),
        output: 'bbcode',
        lineBreak: '\n',
        breakEmptyBlock: false,
        renderText: (value) => value,
        renderUnmatched: ({
            token,
            content,
            options: walkOptions,
        }) => {
            const name = token.name.toLowerCase();

            if (name === 'br') {
                return '\n';
            }

            if (!walkOptions.lazy) {
                return token.value + content + (token.closing ? token.closing.value : '');
            }

            if (HTMLNonRenderedTags.includes(name)) {
                return '';
            }

            // Unmatched elements are transparent; block level elements
            // still separate their content from what follows.
            return {
                content,
                breakBefore: isBlock(token),
                breakAfter: isSeparated(token, content),
                transparent: true,
            };
        },
        finishMatched: ({
            token,
            content,
            matches,
        }) => {
            // The bbcode parser swallows one line break after such a tag.
            if (handlers.breaks(matches[0], 'after', breakOptions)) {
                return { content, breakAfter: true };
            }

            // An element rendered only by attribute handlers keeps
            // the separation of its own block level.
            const tagMatched = matches.some((handler) => isTagMatch(handler, token));

            return {
                content,
                breakBefore: !tagMatched && isBlock(token),
                breakAfter: !tagMatched && isSeparated(token, content),
            };
        },
    });
}
