/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Handler } from '../handler';
import { Handlers } from '../handler';
import type { Token } from '../token';
import {
    fixNestingTokens,
    normalizeTokenNewLines,
    parseTokens,
    removeEmptyTokens,
    tokenizeBBCode, tokenizeHTML,
} from '../token';
import { isObject } from '../utils';
import type { ParserInterface, ParserOptions } from './type';
import { cleanupBBCode } from './utils';
import { ParserDefaultOptions } from './constants';
import { convertBBCodeToHTML, convertHTMLToBBCode } from '../converter';

export class Parser implements ParserInterface {
    protected options: ParserOptions;

    protected handlers : Handlers;

    // --------------------------------------------------

    constructor(options?: Partial<ParserOptions>) {
        this.options = { ...ParserDefaultOptions, ...(options || {}) };
        this.handlers = new Handlers(this.options.handlers);
    }

    // --------------------------------------------------

    setHandler(items: Record<string, Handler>) : void;

    setHandler(id: string, handler: Handler) : void;

    setHandler(id: string | Record<string, Handler>, handler?: Handler) : void {
        if (typeof id === 'string' && typeof handler !== 'undefined') {
            this.handlers.set(id, handler);
        }

        if (isObject(id)) {
            this.handlers.set(id);
        }
    }

    unsetHandler(id: string | string[]) {
        this.handlers.unset(id);
    }

    // --------------------------------------------------

    /**
     * Tokenize bbcode input string.
     *
     * @param input
     * @param preserveNewLines
     */
    parseBBCode(input: string, preserveNewLines?: boolean) : Token[] {
        const tokens = parseTokens({
            handlers: this.handlers,
            items: tokenizeBBCode(input, this.handlers),
            fixInvalidChildren: this.options.fixInvalidChildren,
        });

        if (this.options.fixInvalidNesting) {
            fixNestingTokens({
                handlers: this.handlers,
                children: tokens,
                fixInvalidChildren: this.options.fixInvalidChildren,
            });
        }

        normalizeTokenNewLines({
            handlers: this.handlers,
            children: tokens,
            parent: undefined,
            options: this.options,
            onlyRemoveBreakAfter: preserveNewLines,
        });

        if (this.options.removeEmptyTags) {
            removeEmptyTokens(tokens, this.handlers);
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
        return convertBBCodeToHTML({
            tokens: this.parseBBCode(input, preserveNewLines),
            options: {
                isRoot: true,
                lazy: this.options.lazyTransformation,
            },
            handlers: this.handlers,
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
        return cleanupBBCode({
            tokens: this.parseBBCode(input, preserveNewLines),
            options: this.options,
            handlers: this.handlers,
        });
    }

    // ----------------------------------------------------------

    /**
     * Convert a html string to a bbcode string.
     *
     * @param input
     * @param _preserveNewLines
     */
    toBBCode(input: string, _preserveNewLines?: boolean) : string {
        return convertHTMLToBBCode({
            tokens: this.parseHTML(input),
            options: {
                isRoot: true,
                lazy: this.options.lazyTransformation,
            },
            handlers: this.handlers,
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
