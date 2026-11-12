/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Token } from '../../token';
import { TokenType } from '../../token';
import { formatString } from '../../utils';
import type { WalkContext, WalkDirection, WalkFrame } from './types';

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
                            next: frame.tokens[frame.index],
                        });

                        break;
                    }
                    case TokenType.NEWLINE: {
                        frame.output += direction.lineBreak;

                        break;
                    }
                    default: {
                        frame.output += direction.renderText(token.value);

                        break;
                    }
                }

                continue;
            }

            stack.pop();

            if (!frame.owner) {
                return frame.output;
            }

            stack[stack.length - 1].output += renderElement(frame.owner, frame.output, frame.next);
        }

        return '';
    };

    const renderElement = (token: Token, children: string, next: Token | undefined) : string => {
        let content = children;

        const matches = direction.resolve(token)
            .filter((handler) => !!handler[direction.output]);

        if (matches.length === 0) {
            return direction.renderUnmatched({
                token,
                content,
                next,
                options,
            });
        }

        const [outermost] = matches;
        const lastChild : Token | undefined = token.children[token.children.length - 1];

        // Only add a line break to the end if this is block level
        // and the last child is inline (or, if allowed, empty).
        if (
            !handlers.isHtmlInline(outermost) &&
            !outermost.skipLastLineBreak &&
            (lastChild ? isInlineHandled(lastChild) : direction.breakEmptyBlock)
        ) {
            content += direction.lineBreak;
        }

        // Apply the matches nested: the first match is the outermost.
        for (let i = matches.length - 1; i >= 0; i--) {
            const render = matches[i][direction.output];

            if (typeof render === 'string') {
                content = formatString(render, { ...token.attrs, 0: content });
            } else if (render) {
                content = render({
                    handlers,
                    token,
                    attributes: token.attrs,
                    content,
                    options,
                    convert,
                });
            }
        }

        if (direction.finishMatched) {
            return direction.finishMatched({
                token,
                content,
                next,
                options,
                matches,
            });
        }

        return content;
    };

    return convert(context.tokens);
}
