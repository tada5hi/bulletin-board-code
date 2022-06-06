/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Token, TokenType } from '../../token';
import { ParserOptions } from '../type';
import { QuoteType } from '../../constants';
import { getHandler } from '../../handler';

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
    let attr;
    let bbcode;
    let isBlock;
    let isSelfClosing;
    let quoteType;
    let breakBefore;
    let breakStart;
    let breakEnd;
    let breakAfter;
    let ret = '';

    while (tokens.length > 0) {
        const token = tokens.shift();
        // eslint-disable-next-line no-cond-assign
        if (!token) {
            // eslint-disable-next-line no-continue
            continue;
        }

        bbcode = getHandler(token.name);

        isBlock = !!bbcode && !(typeof bbcode.isHtmlInline !== undefined ? bbcode.isHtmlInline : bbcode.isInline);
        isSelfClosing = bbcode && bbcode.isSelfClosing;

        breakBefore = (isBlock && options.breakBeforeBlock && bbcode.breakBefore !== false) || (bbcode && bbcode.breakBefore);
        breakStart = (isBlock && !isSelfClosing && options.breakStartBlock && bbcode.breakStart !== false) || (bbcode && bbcode.breakStart);
        breakEnd = (isBlock && options.breakEndBlock && bbcode.breakEnd !== false) || (bbcode && bbcode.breakEnd);
        breakAfter = (isBlock && options.breakAfterBlock && bbcode.breakAfter !== false) || (bbcode && bbcode.breakAfter);

        quoteType = (bbcode ? bbcode.quoteType : null) || options.quoteType || QuoteType.auto;

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
                    if (Object.prototype.hasOwnProperty.call(token.attrs, attr)) {
                        ret += ` ${attr}=${quote(token.attrs[keys[i]], quoteType, attr)}`;
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
            if (!isSelfClosing && !bbcode.excludeClosing) {
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
