/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Token, TokenType } from '../../token';
import { ParserOptions } from '../type';
import { QuoteType } from '../../constants';
import { Handler, getHandler } from '../../handler';

function quote(str: string, quoteType: `${QuoteType}` | ((str: string, name: string) => string), name: string) {
    const needsQuotes = /\s|=/.test(str);

    if (typeof quoteType === 'function') {
        return quoteType(str, name);
    }

    if (quoteType === QuoteType.never || (quoteType === QuoteType.auto && !needsQuotes)) {
        return str;
    }

    return `"${str.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
}

export function cleanupBBCode(tokens: Token[], options: ParserOptions) {
    let bbcode : Handler | undefined;

    let isBlock : boolean;
    let isSelfClosing : boolean;
    let breakBefore : boolean;
    let breakStart : boolean;
    let breakEnd : boolean;
    let breakAfter : boolean;

    let quoteType : `${QuoteType}`;

    let ret = '';

    while (tokens.length > 0) {
        const token = tokens.shift();
        // eslint-disable-next-line no-cond-assign
        if (!token) {
            // eslint-disable-next-line no-continue
            continue;
        }

        bbcode = getHandler(token.name);
        if (bbcode) {
            isBlock = !(typeof bbcode.isHtmlInline !== undefined ? bbcode.isHtmlInline : bbcode.isInline);
            isSelfClosing = !!bbcode.isSelfClosing;

            breakBefore = (isBlock && options.breakBeforeBlock && bbcode.breakBefore !== false) || !!bbcode.breakBefore;
            breakStart = (isBlock && !isSelfClosing && options.breakStartBlock && bbcode.breakStart !== false) || !!bbcode.breakStart;
            breakEnd = (isBlock && options.breakEndBlock && bbcode.breakEnd !== false) || !!bbcode.breakEnd;
            breakAfter = (isBlock && options.breakAfterBlock && bbcode.breakAfter !== false) || !!bbcode.breakAfter;
        } else {
            isBlock = false;
            isSelfClosing = false;

            breakBefore = false;
            breakStart = false;
            breakEnd = false;
            breakAfter = false;
        }

        quoteType = bbcode?.quoteType || options.quoteType || QuoteType.auto;

        if (!bbcode && token.type === TokenType.OPEN) {
            ret += token.value;

            if (token.children) {
                ret += cleanupBBCode(token.children, options);
            }

            if (token.closing) {
                ret += token.closing.value;
            }
        } else if (token.type === TokenType.OPEN) {
            if (breakBefore) {
                ret += '\n';
            }

            // Convert the tag and it's attributes to BBCode
            ret += `[${token.name}`;
            if (token.attrs) {
                if (token.attrs.default) {
                    ret += `=${quote(token.attrs.default, quoteType, 'default')}`;

                    delete token.attrs.default;
                }

                const keys = Object.keys(token.attrs);
                for (let i = 0; i < keys.length; i++) {
                    if (Object.prototype.hasOwnProperty.call(token.attrs, keys[i])) {
                        ret += ` ${keys[i]}=${quote(token.attrs[keys[i]], quoteType, keys[i])}`;
                    }
                }
            }
            ret += ']';

            if (breakStart) {
                ret += '\n';
            }

            // Convert the tags children to BBCode
            if (token.children) {
                ret += cleanupBBCode(token.children, options);
            }

            // add closing tag if not self-closing
            if (!isSelfClosing && (bbcode && !bbcode.excludeClosing)) {
                if (breakEnd) {
                    ret += '\n';
                }

                ret += `[/${token.name}]`;
            }

            if (breakAfter) {
                ret += '\n';
            }

            // preserve whatever was recognized as the
            // closing tag if it is a self-closing tag
            if (token.closing && isSelfClosing) {
                ret += token.closing.value;
            }
        } else {
            ret += token.value;
        }
    }

    return ret;
}
