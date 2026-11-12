/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Token } from '../../token';
import { TokenType } from '../../token';
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

                const handlers = context.handlers.match(token)
                    .filter((handler) => !!handler.bbcode);
                let content = convertHTMLToBBCode({
                    tokens: [...token.children],
                    options: {
                        ...context.options,
                        isRoot: false,
                    },
                    handlers: context.handlers,
                });

                if (handlers.length > 0) {
                    const lastChildHandler = lastChild ?
                        context.handlers.match(lastChild)[0] :
                        undefined;

                    if (
                        lastChildHandler &&
                        !context.handlers.isHtmlInline(handlers[0]) &&
                        context.handlers.isHtmlInline(lastChildHandler) &&
                        !handlers[0].skipLastLineBreak
                    ) {
                        // Add placeholder br to end of block level
                        // elements
                        content += '\n';
                    }

                    // Apply the matches nested: the first match is the outermost.
                    for (let i = handlers.length - 1; i >= 0; i--) {
                        const { bbcode } = handlers[i];

                        if (typeof bbcode === 'string') {
                            content = formatString(bbcode, { ...token.attrs, 0: content });
                        } else if (bbcode) {
                            content = bbcode({
                                handlers: context.handlers,
                                token,
                                attributes: token.attrs,
                                content,
                                options: context.options,
                            });
                        }
                    }

                    output += content;
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
