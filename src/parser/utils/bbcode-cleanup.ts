/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { TokenType } from '../../token';
import type { BBCodeCleanupContext } from '../types';
import { QuoteType } from '../../constants';
import type { Handler } from '../../handler';

const NO_BLOCK_BREAKS = {
    breakBeforeBlock: false,
    breakStartBlock: false,
    breakEndBlock: false,
    breakAfterBlock: false,
};

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

export function cleanupBBCode(context: BBCodeCleanupContext) {
    let bbcode : Handler | undefined;

    let isSelfClosing : boolean;
    let breakBefore : boolean;
    let breakStart : boolean;
    let breakEnd : boolean;
    let breakAfter : boolean;

    let quoteType : `${QuoteType}`;

    let ret = '';

    while (context.tokens.length > 0) {
        const token = context.tokens.shift();


        if (!token) {
            continue;
        }

        bbcode = context.handlers.get(token.name);

        if (bbcode) {
            isSelfClosing = !!bbcode.isSelfClosing;

            breakBefore = context.handlers.breaks(bbcode, 'before', context.options);
            // The block option does not apply after the start of a self-closing tag,
            // only the handler's own flag does.
            breakStart = context.handlers.breaks(bbcode, 'start', isSelfClosing ? NO_BLOCK_BREAKS : context.options);
            breakEnd = context.handlers.breaks(bbcode, 'end', context.options);
            breakAfter = context.handlers.breaks(bbcode, 'after', context.options);
        } else {
            isSelfClosing = false;

            breakBefore = false;
            breakStart = false;
            breakEnd = false;
            breakAfter = false;
        }

        quoteType = bbcode?.quoteType || context.options.quoteType || QuoteType.auto;

        if (!bbcode && token.type === TokenType.OPEN) {
            ret += token.value;

            if (token.children) {
                ret += cleanupBBCode({
                    tokens: token.children,
                    options: context.options,
                    handlers: context.handlers,
                });
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

                for (const key of keys) {
                    if (Object.prototype.hasOwnProperty.call(token.attrs, key)) {
                        ret += ` ${key}=${quote(token.attrs[key], quoteType, key)}`;
                    }
                }
            }

            ret += ']';

            if (breakStart) {
                ret += '\n';
            }

            // Convert the tags children to BBCode
            if (token.children) {
                ret += cleanupBBCode({
                    tokens: token.children,
                    options: context.options,
                    handlers: context.handlers,
                });
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
