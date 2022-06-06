/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Token, TokenType } from '../../token';
import { Handler, getHandler } from '../../handler';
import { escapeEntities } from '../../handler/utils';
import { formatString } from '../../utils';

export function convertBBCodeToHTML(tokens: Token[], isRoot: boolean) {
    let bbcode;
    let content;
    let html;
    let blockWrapOpen;
    let ret = '';

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

                bbcode = getHandler(token.name);
                content = convertBBCodeToHTML([...token.children], false);

                if (bbcode && bbcode.html) {
                    // Only add a line break to the end if this is
                    // blocklevel and the last child wasn't block-level
                    if (
                        !isInline(bbcode) &&
                        isInline(getHandler(lastChild.name)) &&
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
                        html = bbcode.html(
                            token,
                            token.attrs,
                            content,
                        );
                    }
                } else {
                    html = token.value + content + (token.closing ? token.closing.value : '');
                }
                break;
            }
            case TokenType.NEWLINE: {
                if (!isRoot) {
                    ret += '<br />';
                    // eslint-disable-next-line no-continue
                    continue;
                }

                // If not already in a block wrap then start a new block
                if (!blockWrapOpen) {
                    ret += '<div>';
                }

                ret += '<br />';

                // Normally the div acts as a line-break with by moving
                // whatever comes after onto a new line.
                // If this is the last token, add an extra line-break so it
                // shows as there will be nothing after it.
                if (!tokens.length) {
                    ret += '<br />';
                }

                ret += '</div>\n';
                blockWrapOpen = false;
                // eslint-disable-next-line no-continue
                continue;
            }
            default: {
                html = escapeEntities(token.value, true);
                break;
            }
        }

        ret += html;
    }

    if (blockWrapOpen) {
        ret += '</div>\n';
    }

    return ret;
}
