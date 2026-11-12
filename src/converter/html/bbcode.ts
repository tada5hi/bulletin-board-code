/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Token } from '../../token';
import { TokenType } from '../../token';
import { findHandlerForHTMLToken } from '../../handler/utils';
import { escapeCharacters, formatString } from '../../utils';
import type { HTMLToBBCodeConvertContext } from '../types';

export function convertHTMLToBBCode(context: HTMLToBBCodeConvertContext) {
    context.options = context.options || {};

    let output = '';

    while (context.tokens.length > 0) {
        const token = context.tokens.shift();

        if (!token) {
            continue;
        }

        switch (token.type) {
            case TokenType.OPEN: {
                const lastChild : Token | undefined = token.children[token.children.length - 1];

                const handler = findHandlerForHTMLToken(context.handlers, token);
                let content = convertHTMLToBBCode({
                    tokens: [...token.children],
                    options: {
                        ...context.options,
                        isRoot: false,
                    },
                    handlers: context.handlers,
                });

                if (handler && handler.bbcode) {
                    const lastChildHandler = findHandlerForHTMLToken(context.handlers, lastChild);

                    if (
                        lastChildHandler &&
                        !context.handlers.isHtmlInline(handler) &&
                        context.handlers.isHtmlInline(lastChildHandler) &&
                        !handler.skipLastLineBreak
                    ) {
                        // Add placeholder br to end of block level
                        // elements
                        content += '\n';
                    }

                    if (typeof handler.bbcode !== 'function') {
                        token.attrs['0'] = content;
                        output += formatString(handler.bbcode, token.attrs);
                    } else {
                        output += handler.bbcode({
                            handlers: context.handlers,
                            token,
                            attributes: token.attrs,
                            content,
                            options: context.options,
                        });
                    }
                } else if (!context.options.lazy) {
                    output += token.value + content + (token.closing ? token.closing.value : '');
                }

                break;
            }
            /* istanbul ignore next */
            case TokenType.NEWLINE: {
                if (!context.options.isRoot) {
                    output += '\n';


                    continue;
                }

                output += '\n';

                if (!context.tokens.length) {
                    output += '\n';
                }

                break;
            }
            default: {
                output += escapeCharacters(token.value, true);

                break;
            }
        }
    }

    return output;
}
