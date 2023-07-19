/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Token } from '../../token';
import { TokenType } from '../../token';
import type { Handler } from '../../handler';
import { escapeEntities, findHandlerForHTMLToken } from '../../handler/utils';
import { formatString } from '../../utils';
import type { HTMLToBBCodeConvertContext } from '../type';

export function convertHTMLToBBCode(context: HTMLToBBCodeConvertContext) {
    context.options = context.options || {};

    let output = '';

    const isInline = (handler: Handler) : boolean => typeof handler === 'undefined' || (
        typeof handler.isHtmlInline !== 'undefined' ?
            handler.isHtmlInline :
            handler.isInline
    ) !== false;

    while (context.tokens.length > 0) {
        const token = context.tokens.shift();
        if (!token) {
            // eslint-disable-next-line no-continue
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
                        !isInline(handler) &&
                        isInline(lastChildHandler) &&
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
                    // eslint-disable-next-line no-continue
                    continue;
                }

                output += '\n';

                if (!context.tokens.length) {
                    output += '\n';
                }

                break;
            }
            default: {
                output += escapeEntities(token.value, true);
                break;
            }
        }
    }

    return output;
}
