/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Token, TokenType } from '../../token';
import { Handler } from '../../handler';
import { escapeEntities, findHandlerForHTMLToken } from '../../handler/utils';
import { formatString } from '../../utils';
import { ConverterOptions } from '../type';

export function convertHTMLToBBCode(tokens: Token[], options?: ConverterOptions) {
    options = options || {};

    let output = '';

    const isInline = (handler: Handler) => typeof handler === 'undefined' || (
        typeof handler.isHtmlInline !== undefined ?
            handler.isHtmlInline :
            handler.isInline
    ) !== false;

    while (tokens.length > 0) {
        const token = tokens.shift();
        if (!token) {
            // eslint-disable-next-line no-continue
            continue;
        }

        switch (token.type) {
            case TokenType.OPEN: {
                const lastChild : Token | undefined = token.children[token.children.length - 1];

                const handler = findHandlerForHTMLToken(token);
                let content = convertHTMLToBBCode([...token.children], {
                    ...options,
                    isRoot: false,
                });

                if (handler && handler.bbcode) {
                    const lastChildHandler = findHandlerForHTMLToken(lastChild);
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
                            token,
                            attributes: token.attrs,
                            content,
                            options,
                        });
                    }
                } else if (!options.lazy) {
                    output += token.value + content + (token.closing ? token.closing.value : '');
                }
                break;
            }
            /* istanbul ignore next */
            case TokenType.NEWLINE: {
                if (!options.isRoot) {
                    output += '\n';
                    // eslint-disable-next-line no-continue
                    continue;
                }

                output += '\n';

                if (!tokens.length) {
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
