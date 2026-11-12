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
import type {
    BBCodeParseOptions,
    IParser,
    ParserOptions,
    ParserOptionsInput,
} from './types';
import { cleanupBBCode } from './utils';
import { ParserDefaultOptions } from './constants';
import { convertBBCodeToHTML, convertHTMLToBBCode } from '../converter';

export class Parser implements IParser {
    protected options: ParserOptions;

    public readonly handlers : Handlers;

    // --------------------------------------------------

    constructor(options?: ParserOptionsInput) {
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
     * @param options
     */
    parseBBCode(input: string, options?: BBCodeParseOptions) : Token[] {
        return parseBBCodeTokens({
            input,
            handlers: this.handlers,
            options: this.options,
            preserveNewLines: options?.preserveNewLines,
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
     * @param options
     */
    toHTML(input: string, options?: BBCodeParseOptions) : string {
        return convertBBCodeToHTML(
            this.parseBBCode(input, options),
            this.handlers,
            { lazy: this.options.lazyTransformation },
        );
    }

    // ----------------------------------------------------------

    /**
     * Clean up bbcode ( remove unnecessary ident, ... )
     *
     * @param input
     * @param options
     */
    cleanupBBCode(input: string, options?: BBCodeParseOptions) : string {
        return cleanupBBCode({
            tokens: this.parseBBCode(input, options),
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
        return convertHTMLToBBCode(
            this.parseHTML(input),
            this.handlers,
            {
                lazy: this.options.lazyTransformation,
                breakBeforeBlock: this.options.breakBeforeBlock,
                breakStartBlock: this.options.breakStartBlock,
                breakEndBlock: this.options.breakEndBlock,
                breakAfterBlock: this.options.breakAfterBlock,
            },
        );
    }
}

/**
 * Convert a bbcode string to a html string with a parser for the given options.
 *
 * @param input
 * @param options
 */
export function bbcodeToHTML(input: string, options?: ParserOptionsInput & BBCodeParseOptions) : string {
    const { preserveNewLines, ...parserOptions } = options || {};

    return new Parser(parserOptions).toHTML(input, { preserveNewLines });
}

/**
 * Convert a html string to a bbcode string with a parser for the given options.
 *
 * @param input
 * @param options
 */
export function htmlToBBCode(input: string, options?: ParserOptionsInput) : string {
    return new Parser(options).toBBCode(input);
}
