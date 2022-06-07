/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Token, TokenType } from '../../token';
import { escapeEntities, findHandlerForHTMLToken } from '../../handler/utils';
import { Handler } from '../../handler';
import { formatString } from '../../utils';

export function convertHTMLToBBCode(tokens: Token[], isRoot?: boolean, strict?: boolean) {
    let output = '';

    const isInline = (bbcode: Handler) => typeof bbcode === 'undefined' || (
        typeof bbcode.isHtmlInline !== undefined ?
            bbcode.isHtmlInline :
            bbcode.isInline
    ) !== false;

    while (tokens.length > 0) {
        const token = tokens.shift();
        if (!token) {
            // eslint-disable-next-line no-continue
            continue;
        }

        switch (token.type) {
            case TokenType.OPEN: {
                const lastChild = token.children[token.children.length - 1] || {} as Token;

                const handler = findHandlerForHTMLToken(token);
                let content = convertHTMLToBBCode([...token.children], false, strict);

                if (handler && handler.bbcode) {
                    if (
                        !isInline(handler) &&
                        isInline(findHandlerForHTMLToken(lastChild)) &&
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
                        });
                    }
                } else if (!strict) {
                    output += token.value + content + (token.closing ? token.closing.value : '');
                }
                break;
            }
            case TokenType.NEWLINE: {
                if (!isRoot) {
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
