/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { QuoteType } from '../constants';
import type { Handler, Handlers } from '../handler';
import type { Token } from '../token';

export interface ParserInterface {
    parseBBCode(input: string, preserveNewLines: boolean) : Token[],

    toHTML(input: string, preserveNewLines: boolean) : string;
    fromBBCode(input: string, preserveNewLines: boolean) : string;

    cleanupBBCode(input: string, preserveNewLines: boolean) : string;
}

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

export type BBCodeCleanupContext = {
    tokens: Token[],
    options: ParserOptions,
    handlers: Handlers
};
