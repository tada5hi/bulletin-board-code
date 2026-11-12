/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ConverterOptions, Handlers } from '../../handler';
import type { Token } from '../../token';
import { escapeCharacters } from '../../utils';
import { walkTokens } from '../walk';

/**
 * Render bbcode tokens as html; the input tokens are not mutated.
 *
 * @param tokens
 * @param handlers
 * @param options
 */
export function convertBBCodeToHTML(
    tokens: Token[],
    handlers: Handlers,
    options?: ConverterOptions,
) : string {
    return walkTokens({
        tokens,
        handlers,
        options,
    }, {
        resolve: (token) => {
            const handler = handlers.get(token.name);

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
