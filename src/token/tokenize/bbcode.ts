/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { stripQuotes } from '../../handler/utils';
import { TokenType } from '../constants';
import { getHandler } from '../../handler';
import { Token } from '../module';
import { TokenAttributes } from '../type';

export function tokenizeAttrs(attrs: string) : Record<string, any> {
    let matches : string[] | null = [];
    /**
     * ([^\s=]+)                Anything that's not a space or equals
     *         =                        Equals sign =
     *         (?:
     *             (?:
     *                 (["'])                    The opening quote
     *                 (
     *                     (?:\\\2|[^\2])*?    Anything that isn't the
     *                                         unescaped opening quote
     *                 )
     *                 \2                        The opening quote again which
     *                                         will close the string
     *             )
     *                 |                If not a quoted string then match
     *             (
     *                 (?:.(?!\s\S+=))*.?        Anything that isn't part of
     *                                         [space][non-space][=] which
     *                                         would be a new attribute
     *             )
     *         )
     */
    const attrRegex = /([^\s=]+)=(?:(?:(["'])((?:\\\2|[^\2])*?)\2)|((?:.(?!\s\S+=))*.))/g;
    const ret : TokenAttributes = {};

    // if only one attribute then remove the = from the start and
    // strip any quotes
    if (attrs.charAt(0) === '=' && attrs.indexOf('=', 1) < 0) {
        ret.default = stripQuotes(attrs.substring(1));
    } else {
        if (attrs.charAt(0) === '=') {
            attrs = `default${attrs}`;
        }

        // No need to strip quotes here, the regex will do that.
        // eslint-disable-next-line no-cond-assign
        while ((matches = attrRegex.exec(attrs))) {
            ret[matches[1].toLowerCase()] = stripQuotes(matches[3]) || matches[4];
        }
    }

    return ret;
}

export function tokenizeTag(type: `${TokenType}`, input: string) {
    let matches : string[] | null = [];
    let attrs;
    let name;

    // Extract the name and attributes from opening tags and
    // just the name from closing tags.
    matches = input.match(/\[([^\]\s=]+)(?:([^\]]+))?\]/);

    if (type === TokenType.OPEN && matches) {
        name = matches[1].toLowerCase();

        if (matches[2]) {
            matches[2] = matches[2].trim();
            attrs = tokenizeAttrs(matches[2]);
        }
    }

    matches = input.match(/\[\/([^[\]]+)\]/);

    if (type === TokenType.CLOSE && matches) {
        name = matches[1].toLowerCase();
    }

    if (type === TokenType.NEWLINE) {
        name = '#newline';
    }

    // Treat all tokens without a name and
    // all unknown BBCodes as content
    if (!name || ((type === TokenType.OPEN || type === TokenType.CLOSE) && !getHandler(name))) {
        type = TokenType.CONTENT;
        name = '#';
    }

    return new Token(type, name, input, attrs);
}

export function tokenizeBBCode(input: string) : Token[] {
    // The token types in reverse order of precedence
    const tokenTypes : {type: `${TokenType}`, regex: RegExp}[] = [
        { type: TokenType.CONTENT, regex: /^([^[\r\n]+|\[)/ },
        { type: TokenType.NEWLINE, regex: /^(\r\n|\r|\n)/ },
        { type: TokenType.OPEN, regex: /^\[[^[\]]+\]/ },
        { type: TokenType.CLOSE, regex: /^\[\/[^[\]]+\]/ },
    ];

    let matches : string[] | null = [];
    let type : `${TokenType}`;
    let i : number;
    const tokens = [];

    // eslint-disable-next-line no-labels,no-restricted-syntax
    inputLoop:
    while (input.length) {
        i = tokenTypes.length;
        while (i--) {
            type = tokenTypes[i].type;

            // Check if the string matches any of the tokens
            matches = input.match(tokenTypes[i].regex);
            if (!matches || !matches[0]) {
                // eslint-disable-next-line no-continue
                continue;
            }

            // Add the match to the tokens list
            tokens.push(tokenizeTag(type, matches[0]));

            // Remove the match from the string
            input = input.substring(matches[0].length);

            // The token has been added so start again
            // eslint-disable-next-line no-continue,no-labels
            continue inputLoop;
        }

        // If there is anything left in the string which doesn't match
        // any of the tokens then just assume it's content and add it.
        if (input.length) {
            tokens.push(tokenizeTag(TokenType.CONTENT, input));
        }

        input = '';
    }

    return tokens;
}
