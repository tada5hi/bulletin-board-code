/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { HTMLToBBCodeConvertContext } from '../types';
import { walkTokens } from '../walk';

const blockTags : string[] = [
    'address',
    'article',
    'aside',
    'div',
    'dl',
    'dd',
    'dt',
    'fieldset',
    'figcaption',
    'figure',
    'footer',
    'form',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'header',
    'hr',
    'main',
    'nav',
    'p',
    'pre',
    'section',
];

export function convertHTMLToBBCode(context: HTMLToBBCodeConvertContext) : string {
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

            // Unmatched elements are transparent; block level elements
            // still separate their content from what follows.
            if (
                blockTags.includes(token.name) &&
                content.length > 0 &&
                !content.endsWith('\n') &&
                next
            ) {
                return `${content}\n`;
            }

            return content;
        },
    });
}
