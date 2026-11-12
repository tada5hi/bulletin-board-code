/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ConverterOptions, Handler, Handlers } from '../../handler';
import type { Token } from '../../token';

export type WalkUnmatchedContext = {
    token: Token,
    content: string,
    next: Token | undefined,
    options: ConverterOptions
};

export type WalkDirection = {
    /**
     * Resolve the handlers for a token; the first one is the outermost.
     */
    resolve: (token: Token) => Handler[],
    /**
     * The handler output to render.
     */
    output: 'html' | 'bbcode',
    /**
     * The line-break string of the target format.
     */
    lineBreak: string,
    /**
     * If empty block level elements get a trailing line break.
     */
    breakEmptyBlock: boolean,
    /**
     * Render a text token value.
     */
    renderText: (value: string) => string,
    /**
     * Render an element without any matching handler.
     */
    renderUnmatched: (context: WalkUnmatchedContext) => string
};

export type WalkContext = {
    tokens: Token[],
    options?: ConverterOptions,
    handlers: Handlers
};
