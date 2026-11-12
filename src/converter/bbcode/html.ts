/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { escapeCharacters } from '../../utils';
import type { BBCodeToHTMLConvertContext } from '../types';
import { walkTokens } from '../walk';

export function convertBBCodeToHTML(context: BBCodeToHTMLConvertContext) : string {
    return walkTokens(context, {
        resolve: (token) => {
            const handler = context.handlers.get(token.name);

            return handler ? [handler] : [];
        },
        output: 'html',
        lineBreak: '<br />',
        // Add a placeholder br to empty block level elements as well.
        breakEmptyBlock: true,
        renderText: (value) => escapeCharacters(value, true),
        renderUnmatched: ({
            token,
            content,
            options,
        }) => {
            if (options.lazy) {
                return '';
            }

            return token.value + content + (token.closing ? token.closing.value : '');
        },
    });
}
