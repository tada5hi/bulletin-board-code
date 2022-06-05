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
    tokenize,
} from '../token';
import { ParserInterface, ParserOptions } from './type';
import { convertToBBCode, convertToHTML } from './utils';
import { ParserDefaultOptions } from './constants';

export class Parser implements ParserInterface {
    protected options: ParserOptions;

    constructor(options?: Partial<ParserOptions>) {
        this.options = { ...ParserDefaultOptions, ...(options || {}) };
    }

    parse(input: string, preserveNewLines?: boolean) : Token[] {
        const tokens = parseTokens(tokenize(input), this.options.fixInvalidChildren);

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

    // ----------------------------------------------------------

    toHTML(input: string, preserveNewLines?: boolean) : string {
        return convertToHTML(this, this.parse(input, preserveNewLines), true);
    }

    fromBBCode(input: string, preserveNewLines?: boolean) : string {
        return this.toHTML(input, preserveNewLines);
    }

    // ----------------------------------------------------------

    cleanup(input: string, preserveNewLines?: boolean) : string {
        return convertToBBCode(this.parse(input, preserveNewLines), this.options);
    }
}
