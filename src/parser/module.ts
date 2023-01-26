/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    Token,
    fixNestingTokens,
    normalizeTokenNewLines,
    parseTokens,
    removeEmptyTokens,
    tokenizeBBCode, tokenizeHTML,
} from '../token';
import { ParserInterface, ParserOptions } from './type';
import { cleanupBBCode } from './utils';
import { ParserDefaultOptions } from './constants';
import { convertBBCodeToHTML, convertHTMLToBBCode } from '../converter';

export class Parser implements ParserInterface {
    protected options: ParserOptions;

    // --------------------------------------------------

    constructor(options?: Partial<ParserOptions>) {
        this.options = { ...ParserDefaultOptions, ...(options || {}) };
    }

    // --------------------------------------------------

    /**
     * Tokenize bbcode input string.
     *
     * @param input
     * @param preserveNewLines
     */
    parseBBCode(input: string, preserveNewLines?: boolean) : Token[] {
        const tokens = parseTokens(tokenizeBBCode(input), this.options.fixInvalidChildren);

        if (this.options.fixInvalidNesting) {
            fixNestingTokens({
                children: tokens,
                fixInvalidChildren: this.options.fixInvalidChildren,
            });
        }

        normalizeTokenNewLines({
            children: tokens,
            parent: undefined,
            options: this.options,
            onlyRemoveBreakAfter: preserveNewLines,
        });

        if (this.options.removeEmptyTags) {
            removeEmptyTokens(tokens);
        }

        return tokens;
    }

    /**
     * Tokenize html input string.
     *
     * @param input
     */
    parseHTML(input: string) {
        return tokenizeHTML(input);
    }

    // ----------------------------------------------------------

    /**
     * Convert a bbcode string to a html string.
     *
     * @param input
     * @param preserveNewLines
     */
    toHTML(input: string, preserveNewLines?: boolean) : string {
        return convertBBCodeToHTML(this.parseBBCode(input, preserveNewLines), {
            isRoot: true,
            lazy: this.options.lazyTransformation,
        });
    }

    /**
     * Alias for toHTML.
     *
     * @alias toHTML
     * @param input
     * @param preserveNewLines
     */
    fromBBCode(input: string, preserveNewLines?: boolean) : string {
        return this.toHTML(input, preserveNewLines);
    }

    // ----------------------------------------------------------

    /**
     * Clean up bbcode ( remove unnecessary ident, ... )
     *
     * @param input
     * @param preserveNewLines
     */
    cleanupBBCode(input: string, preserveNewLines?: boolean) : string {
        return cleanupBBCode(this.parseBBCode(input, preserveNewLines), this.options);
    }

    // ----------------------------------------------------------

    /**
     * Convert a html string to a bbcode string.
     *
     * @param input
     * @param preserveNewLines
     */
    toBBCode(input: string, preserveNewLines?: boolean) : string {
        return convertHTMLToBBCode(this.parseHTML(input), {
            isRoot: true,
            lazy: this.options.lazyTransformation,
        });
    }

    /**
     * Alias for toBBCode.
     *
     * @alias toBBCode
     * @param input
     */
    fromHTML(input: string) {
        return this.toBBCode(input);
    }
}
