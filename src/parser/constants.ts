/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ParserOptions } from './types';
import { QuoteType } from '../constants';
import { TokenBreakDefaultOptions } from '../token/pipeline/constants';

export const ParserDefaultOptions : ParserOptions = {
    /**
     * Add a set of handlers to the already predefined ones.
     *
     * @type {Object}
     */
    handlers: {},

    /**
     * If to add a new line before block level elements
     *
     * @type {Boolean}
     */
    breakBeforeBlock: TokenBreakDefaultOptions.breakBeforeBlock,

    /**
     * If to add a new line after the start of block level elements
     *
     * @type {Boolean}
     */
    breakStartBlock: TokenBreakDefaultOptions.breakStartBlock,

    /**
     * If to add a new line before the end of block level elements
     *
     * @type {Boolean}
     */
    breakEndBlock: TokenBreakDefaultOptions.breakEndBlock,

    /**
     * If to add a new line after block level elements
     *
     * @type {Boolean}
     */
    breakAfterBlock: TokenBreakDefaultOptions.breakAfterBlock,

    /**
     * If to remove empty tags
     *
     * @type {Boolean}
     */
    removeEmptyTags: true,

    /**
     * If to fix invalid nesting,
     * i.e. block level elements inside inline elements.
     *
     * @type {Boolean}
     */
    fixInvalidNesting: true,

    /**
     * If to fix invalid children.
     * i.e. A tag which is inside a parent that doesn't
     * allow that type of tag.
     *
     * @type {Boolean}
     */
    fixInvalidChildren: true,

    /**
     * Attribute quote type
     */
    quoteType: QuoteType.auto,

    /**
     * Strict handler match.
     * Otherwise, library will attempt to construct html or bbcode without handler.
     */
    lazyTransformation: true,
};
