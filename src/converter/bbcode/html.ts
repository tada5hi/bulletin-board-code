/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Token } from '../../token';
import { TokenType } from '../../token';
import type { Handler } from '../../handler';
import { formatString } from '../../utils';
import { escapeEntities } from '../../handler/utils';
import type { BBCodeToHTMLConvertContext } from '../type';

export function convertBBCodeToHTML(context: BBCodeToHTMLConvertContext) {
    let bbcode : Handler | undefined;
    let content : string;
    let html : string;
    let ret = '';

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

        html = '';

        switch (token.type) {
            case TokenType.OPEN: {
                const lastChild = token.children[token.children.length - 1] || {} as Token;

                bbcode = context.handlers.get(token.name);
                content = convertBBCodeToHTML({
                    tokens: [...token.children],
                    options: {
                        ...context.options,
                        isRoot: false,
                    },
                    handlers: context.handlers,
                });

                if (bbcode && bbcode.html) {
                    const lastChildHandler = context.handlers.get(lastChild.name);
                    // Only add a line break to the end if this is
                    // blocklevel and the last child wasn't block-level
                    if (
                        lastChildHandler &&
                        !isInline(bbcode) &&
                        isInline(lastChildHandler) &&
                        !bbcode.skipLastLineBreak
                    ) {
                        // Add placeholder br to end of block level
                        // elements
                        content += '<br />';
                    }

                    if (typeof bbcode.html !== 'function') {
                        token.attrs['0'] = content;
                        html = formatString(
                            bbcode.html,
                            token.attrs,
                        );
                    } else {
                        html = bbcode.html({
                            handlers: context.handlers,
                            token,
                            attributes: token.attrs,
                            content,
                            options: context.options,
                        });
                    }
                } else if (!context.options.lazy) {
                    html = token.value + content + (token.closing ? token.closing.value : '');
                }
                break;
            }
            /* istanbul ignore next */
            case TokenType.NEWLINE: {
                if (!context.options.isRoot) {
                    ret += '<br />';
                    // eslint-disable-next-line no-continue
                    continue;
                }

                ret += '<br />';

                // Normally the div acts as a line-break with by moving
                // whatever comes after onto a new line.
                // If this is the last token, add an extra line-break so it
                // shows as there will be nothing after it.
                if (!context.tokens.length) {
                    ret += '<br />';
                }

                ret += '</div>\n';
                continue;
            }
            default: {
                html = escapeEntities(token.value, true);
                break;
            }
        }

        ret += html;
    }

    return ret;
}
