/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Token, TokenType } from '../index';
import { Handler, getHandler } from '../../handler';
import { ParserOptions } from '../../parser';

type NewLinesNormaliseContext = {
    children: Token[],
    parent?: Token,
    options: ParserOptions,
    onlyRemoveBreakAfter?: boolean
};

/* istanbul ignore next */
export function normalizeTokenNewLines(context: NewLinesNormaliseContext) {
    const {
        children, parent, options, onlyRemoveBreakAfter,
    } = context;

    const childrenLength = children.length;

    let token : Token;
    let left : Token | undefined;
    let right : Token | undefined;

    let parentHandler : Handler | undefined;
    let handler : Handler;

    let removedBreakEnd;
    let removedBreakBefore;
    let remove;

    if (parent) {
        parentHandler = getHandler(parent.name);
    }

    let i = childrenLength;
    while (i--) {
        // eslint-disable-next-line no-cond-assign
        if (!(token = children[i])) {
            // eslint-disable-next-line no-continue
            continue;
        }

        if (token.type === TokenType.NEWLINE) {
            left = i > 0 ? children[i - 1] : null;
            right = i < childrenLength - 1 ? children[i + 1] : null;
            remove = false;

            // Handle the start and end new lines
            // e.g. [tag]\n and \n[/tag]
            if (
                !onlyRemoveBreakAfter &&
                parentHandler &&
                parentHandler.isSelfClosing !== true
            ) {
                // First child of parent so must be opening line break
                // (breakStartBlock, breakStart) e.g. [tag]\n
                if (!left) {
                    if (
                        parentHandler.isInline === false &&
                        options.breakStartBlock &&
                        parentHandler.breakStart !== false
                    ) {
                        remove = true;
                    }

                    if (parentHandler.breakStart) {
                        remove = true;
                    }
                    // Last child of parent so must be end line break
                    // (breakEndBlock, breakEnd)
                    // e.g. \n[/tag]
                    // remove last line break (breakEndBlock, breakEnd)
                } else if (!removedBreakEnd && !right) {
                    if (
                        parentHandler.isInline === false &&
                        options.breakEndBlock &&
                        parentHandler.breakEnd !== false
                    ) {
                        remove = true;
                    }

                    if (parentHandler.breakEnd) {
                        remove = true;
                    }

                    removedBreakEnd = remove;
                }
            }

            if (
                left &&
                left.type === TokenType.OPEN
            ) {
                handler = getHandler(left.name);

                if (handler) {
                    if (!onlyRemoveBreakAfter) {
                        if (handler.isInline === false &&
                            options.breakAfterBlock &&
                            handler.breakAfter !== false) {
                            remove = true;
                        }

                        if (handler.breakAfter) {
                            remove = true;
                        }
                    } else if (handler.isInline === false) {
                        remove = true;
                    }
                }
            }

            if (
                !onlyRemoveBreakAfter &&
                !removedBreakBefore &&
                right &&
                right.type === TokenType.OPEN
            ) {
                handler = getHandler(right.name);
                if (handler) {
                    if (
                        handler.isInline === false &&
                        options.breakBeforeBlock &&
                        handler.breakBefore !== false
                    ) {
                        remove = true;
                    }

                    if (handler.breakBefore) {
                        remove = true;
                    }

                    removedBreakBefore = remove;

                    if (remove) {
                        children.splice(i, 1);
                        // eslint-disable-next-line no-continue
                        continue;
                    }
                }
            }

            if (remove) {
                children.splice(i, 1);
            }

            // reset double removedBreakBefore removal protection.
            // This is needed for cases like \n\n[\tag] where
            // only 1 \n should be removed but without this they both
            // would be.
            removedBreakBefore = false;
        } else if (token.type === TokenType.OPEN) {
            normalizeTokenNewLines({
                children: token.children,
                parent: token,
                options,
                onlyRemoveBreakAfter,
            });
        }
    }
}
