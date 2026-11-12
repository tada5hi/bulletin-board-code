/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { QuoteType } from '../constants';
import type { Handler, Handlers } from '../handler';
import type { Token } from '../token';

export interface IParser {
    readonly handlers: Handlers;

    setHandler(items: Record<string, Handler>) : void;
    setHandler(id: string, handler: Handler) : void;
    unsetHandler(id: string | string[]) : void;

    parseBBCode(input: string, options?: BBCodeParseOptions) : Token[];
    parseHTML(input: string) : Token[];

    toHTML(input: string, options?: BBCodeParseOptions) : string;

    cleanupBBCode(input: string, options?: BBCodeParseOptions) : string;

    toBBCode(input: string) : string;
}

/**
 * Per-call options of parseBBCode, toHTML and cleanupBBCode.
 */
export type BBCodeParseOptions = {
    /**
     * Keep newlines before tags and at the start and end of their content;
     * only the newline after a block tag is treated as formatting.
     *
     * default: false
     */
    preserveNewLines?: boolean
};

export type ParserOptions = {
    /**
     * Add a set of handlers to the already predefined ones.
     *
     * default: {}
     */
    handlers: Record<string, Handler>,

    /**
     * If to add a new line before block level elements
     *
     * default: false
     */
    breakBeforeBlock: boolean,

    /**
     * If to add a new line after the start of block level elements
     *
     * default: false
     */
    breakStartBlock: boolean,

    /**
     * If to add a new line before the end of block level elements
     *
     * default: false
     */
    breakEndBlock: boolean,

    /**
     * If to add a new line after block level elements.
     *
     * default: true
     */
    breakAfterBlock: boolean,

    /**
     * If to remove empty tags.
     *
     * default: true
     */
    removeEmptyTags: boolean,

    /**
     * If to fix invalid nesting, like block level elements inside inline elements.
     *
     * default: true
     */
    fixInvalidNesting: boolean,

    /**
     * If to fix invalid children. i.e. A tag which is inside a parent that doesn’t allow that type of tag as a child.
     *
     * default: true
     */
    fixInvalidChildren: boolean,

    /**
     * The default attribute quote type.
     *
     * default: QuoteType.auto
     */
    quoteType: `${QuoteType}`,

    /**
     * Lazy transformation without handler.
     * Otherwise, library will attempt to construct html or bbcode without handler.
     *
     * default: true
     */
    lazyTransformation: boolean
};

export type ParserOptionsInput = Partial<ParserOptions>;
