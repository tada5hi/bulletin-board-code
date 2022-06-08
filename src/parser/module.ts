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

    constructor(options?: Partial<ParserOptions>) {
        this.options = { ...ParserDefaultOptions, ...(options || {}) };
    }

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
            parent: null,
            options: this.options,
            onlyRemoveBreakAfter: preserveNewLines,
        });

        if (this.options.removeEmptyTags) {
            removeEmptyTokens(tokens);
        }

        return tokens;
    }

    parseHTML(input: string) {
        return tokenizeHTML(input);
    }

    // ----------------------------------------------------------

    toHTML(input: string, preserveNewLines?: boolean) : string {
        return convertBBCodeToHTML(this.parseBBCode(input, preserveNewLines), {
            isRoot: true,
            lazy: this.options.lazyTransformation,
        });
    }

    fromBBCode(input: string, preserveNewLines?: boolean) : string {
        return this.toHTML(input, preserveNewLines);
    }

    cleanup(input: string, preserveNewLines?: boolean) : string {
        return cleanupBBCode(this.parseBBCode(input, preserveNewLines), this.options);
    }

    // ----------------------------------------------------------

    toBBCode(input: string, preserveNewLines?: boolean) : string {
        return convertHTMLToBBCode(this.parseHTML(input), {
            isRoot: true,
            lazy: this.options.lazyTransformation,
        });
    }

    fromHTML(input: string) {
        return this.toBBCode(input);
    }
}
