/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Handler } from '../handler';
import { Handlers } from '../handler';
import type { Token } from '../token';
import { parseBBCodeTokens, parseHTMLTokens } from '../token/pipeline';
import { isObject } from '../utils';
import type { ParserInterface, ParserOptions } from './types';
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

    unsetHandler(id: string | string[]) : void {
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
        return parseBBCodeTokens({
            input,
            handlers: this.handlers,
            options: this.options,
            preserveNewLines,
        });
    }

    /**
     * Tokenize html input string and collapse its source whitespace.
     *
     * @param input
     */
    parseHTML(input: string) : Token[] {
        return parseHTMLTokens({
            input,
            handlers: this.handlers,
        });
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
            options: { lazy: this.options.lazyTransformation },
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
     */
    toBBCode(input: string) : string {
        return convertHTMLToBBCode({
            tokens: this.parseHTML(input),
            options: {
                lazy: this.options.lazyTransformation,
                breakBeforeBlock: this.options.breakBeforeBlock,
                breakStartBlock: this.options.breakStartBlock,
                breakEndBlock: this.options.breakEndBlock,
                breakAfterBlock: this.options.breakAfterBlock,
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
    fromHTML(input: string) : string {
        return this.toBBCode(input);
    }
}
