/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Token } from '../../token';
import { isTagMatch } from '../../handler/utils';
import { HTMLBlockTags, TokenBreakDefaultOptions } from '../../token/pipeline';
import type { HTMLToBBCodeConvertContext } from '../types';
import { walkTokens } from '../walk';

/**
 * Elements whose content is not document text.
 */
const droppedTags : string[] = [
    'head',
    'noscript',
    'script',
    'style',
    'template',
    'title',
];

/**
 * Check if a block level element separates its output from what follows.
 *
 * @param token
 * @param content
 */
function isSeparated(token: Token, content: string) : boolean {
    return HTMLBlockTags.includes(token.name.toLowerCase()) &&
        content.length > 0 &&
        !content.endsWith('\n');
}

export function convertHTMLToBBCode(context: HTMLToBBCodeConvertContext) : string {
    const options = context.options || {};
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

        return name === 'br' || (!!options.lazy && droppedTags.includes(name));
    };

    return walkTokens(context, {
        resolve: (token) => (isIntrinsic(token) ? [] : context.handlers.match(token)),
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

            if (droppedTags.includes(name)) {
                return '';
            }

            // Unmatched elements are transparent; block level elements
            // still separate their content from what follows.
            return {
                content,
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
            if (context.handlers.breaks(matches[0], 'after', breakOptions)) {
                return { content, breakAfter: true };
            }

            // An element rendered only by attribute handlers keeps
            // the separation of its own block level.
            const tagMatched = matches.some((handler) => isTagMatch(handler, token));

            return {
                content,
                breakAfter: !tagMatched && isSeparated(token, content),
            };
        },
    });
}
