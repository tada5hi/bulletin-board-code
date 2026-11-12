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
    options: ConverterOptions
};

export type WalkMatchedContext = WalkUnmatchedContext & {
    /**
     * The applied handlers; the first one is the outermost.
     */
    matches: Handler[]
};

export type WalkRendered = {
    content: string,
    /**
     * Separate the output from what follows with one line break,
     * if any output follows.
     */
    breakAfter?: boolean,
    /**
     * Separate the output from what precedes it with one line break,
     * if any output precedes it on the same line.
     */
    breakBefore?: boolean,
    /**
     * Line breaks due at the start and the end of the element's content
     * carry over to what surrounds the element.
     */
    transparent?: boolean
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
    renderUnmatched: (context: WalkUnmatchedContext) => string | WalkRendered,
    /**
     * Post-process the output of an element rendered by handlers.
     */
    finishMatched?: (context: WalkMatchedContext) => string | WalkRendered
};

export type WalkContext = {
    tokens: Token[],
    options?: ConverterOptions,
    handlers: Handlers
};

export type WalkFrame = {
    tokens: Token[],
    index: number,
    output: string,
    /**
     * The element whose children are walked; undefined for the root.
     */
    owner?: Token,
    /**
     * A line break is due before the next non-empty output.
     */
    pendingBreak: boolean,
    /**
     * The first output of the frame asked for a line break before it.
     */
    leadingBreak: boolean
};
