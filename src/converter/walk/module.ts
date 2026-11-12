/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Handler } from '../../handler';
import type { Token } from '../../token';
import { TokenType } from '../../token';
import { formatString } from '../../utils';
import type {
    WalkContext,
    WalkDirection,
    WalkFrame,
    WalkRendered,
} from './types';

function toRendered(input: string | WalkRendered) : WalkRendered {
    return typeof input === 'string' ? { content: input } : input;
}

/**
 * Append output to a frame, emitting a due line break first.
 *
 * @param frame
 * @param value
 * @param lineBreak
 */
function append(frame: WalkFrame, value: string, lineBreak: string) : void {
    if (value.length === 0) {
        return;
    }

    if (frame.pendingBreak) {
        frame.output += lineBreak;
        frame.pendingBreak = false;
    }

    frame.output += value;
}

/**
 * Walk a token tree and render it in the given direction.
 * The input tokens are not mutated.
 *
 * @param context
 * @param direction
 */
export function walkTokens(context: WalkContext, direction: WalkDirection) : string {
    const { handlers } = context;
    const options = context.options || {};

    const isInlineHandled = (token: Token) : boolean => {
        const [handler] = direction.resolve(token);

        return !!handler && handlers.isHtmlInline(handler);
    };

    // The tree is walked with an explicit stack, so deeply nested
    // input cannot exhaust the call stack.
    const convert = (input: Token[]) : string => {
        const stack : WalkFrame[] = [{
            tokens: input,
            index: 0,
            output: '',
            pendingBreak: false,
        }];

        while (stack.length > 0) {
            const frame = stack[stack.length - 1];

            if (frame.index < frame.tokens.length) {
                const token = frame.tokens[frame.index++];

                switch (token.type) {
                    case TokenType.OPEN: {
                        stack.push({
                            tokens: token.children,
                            index: 0,
                            output: '',
                            owner: token,
                            pendingBreak: false,
                        });

                        break;
                    }
                    case TokenType.NEWLINE: {
                        append(frame, direction.lineBreak, direction.lineBreak);

                        break;
                    }
                    default: {
                        append(frame, direction.renderText(token.value), direction.lineBreak);

                        break;
                    }
                }

                continue;
            }

            stack.pop();

            // A line break still due at the end of the input is dropped.
            if (!frame.owner) {
                return frame.output;
            }

            const rendered = renderElement(frame.owner, frame.output);
            const parent = stack[stack.length - 1];

            append(parent, rendered.content, direction.lineBreak);

            if (rendered.breakAfter || (rendered.transparent && frame.pendingBreak)) {
                parent.pendingBreak = true;
            }
        }

        return '';
    };

    /**
     * Apply the handlers from the given index inwards to the content of a token,
     * nested: the handler at the lowest index is the outermost.
     *
     * @param token
     * @param matches
     * @param children
     * @param content
     * @param from
     */
    const applyHandlers = (
        token: Token,
        matches: Handler[],
        children: Token[],
        content: string,
        from: number,
    ) : string => {
        let output = content;

        const [outermost] = matches;
        const lastChild : Token | undefined = children[children.length - 1];

        // Only add a line break to the end if this is block level
        // and the last child is inline (or, if allowed, empty).
        if (
            !handlers.isHtmlInline(outermost) &&
            !outermost.skipLastLineBreak &&
            (lastChild ? isInlineHandled(lastChild) : direction.breakEmptyBlock)
        ) {
            output += direction.lineBreak;
        }

        for (let i = matches.length - 1; i >= from; i--) {
            const render = matches[i][direction.output];

            if (typeof render === 'string') {
                output = formatString(render, { ...token.attrs, 0: output });
            } else if (render) {
                const inner = i + 1;

                output = render({
                    handlers,
                    token,
                    attributes: token.attrs,
                    content: output,
                    options,
                    convert: (tokens) => applyHandlers(token, matches, tokens, convert(tokens), inner),
                });
            }
        }

        return output;
    };

    const renderElement = (token: Token, children: string) : WalkRendered => {
        const matches = direction.resolve(token)
            .filter((handler) => !!handler[direction.output]);

        if (matches.length === 0) {
            return toRendered(direction.renderUnmatched({
                token,
                content: children,
                options,
            }));
        }

        const content = applyHandlers(token, matches, token.children, children, 0);

        if (direction.finishMatched) {
            return toRendered(direction.finishMatched({
                token,
                content,
                options,
                matches,
            }));
        }

        return { content };
    };

    return convert(context.tokens);
}
