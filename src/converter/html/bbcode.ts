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
 * Separate the output of a block level element from what follows.
 *
 * @param token
 * @param content
 * @param next
 */
function separateBlock(token: Token, content: string, next: Token | undefined) : string {
    if (
        HTMLBlockTags.includes(token.name.toLowerCase()) &&
        content.length > 0 &&
        !content.endsWith('\n') &&
        next
    ) {
        return `${content}\n`;
    }

    return content;
}

export function convertHTMLToBBCode(context: HTMLToBBCodeConvertContext) : string {
    const options = context.options || {};
    const breakOptions = {
        breakBeforeBlock: options.breakBeforeBlock ?? TokenBreakDefaultOptions.breakBeforeBlock,
        breakStartBlock: options.breakStartBlock ?? TokenBreakDefaultOptions.breakStartBlock,
        breakEndBlock: options.breakEndBlock ?? TokenBreakDefaultOptions.breakEndBlock,
        breakAfterBlock: options.breakAfterBlock ?? TokenBreakDefaultOptions.breakAfterBlock,
    };

    return walkTokens(context, {
        resolve: (token) => context.handlers.match(token),
        output: 'bbcode',
        lineBreak: '\n',
        breakEmptyBlock: false,
        renderText: (value) => value,
        renderUnmatched: ({
            token,
            content,
            next,
            options,
        }) => {
            if (token.name === 'br') {
                return '\n';
            }

            if (!options.lazy) {
                return token.value + content + (token.closing ? token.closing.value : '');
            }

            if (droppedTags.includes(token.name.toLowerCase())) {
                return '';
            }

            // Unmatched elements are transparent; block level elements
            // still separate their content from what follows.
            return separateBlock(token, content, next);
        },
        finishMatched: ({
            token,
            content,
            next,
            matches,
        }) => {
            let output = content;

            // The bbcode parser swallows one line break after such a tag.
            if (next && context.handlers.breaks(matches[0], 'after', breakOptions)) {
                output += '\n';
            }

            // An element rendered only by attribute handlers keeps
            // the separation of its own block level.
            const tagMatched = matches.some((handler) => isTagMatch(handler, token));

            if (tagMatched) {
                return output;
            }

            return separateBlock(token, output, next);
        },
    });
}
