/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Token } from '../module';
import type { TokenNewLinesNormaliseContext } from '../types';
import { TokenType } from '../constants';
import type { Handler } from '../../handler';

/* istanbul ignore next */
export function normalizeTokenNewLines(context: TokenNewLinesNormaliseContext) {
    const {
        children,
        parent,
        options,
        onlyRemoveBreakAfter,
    } = context;

    const childrenLength = children.length;

    let token : Token;
    let left : Token | undefined;
    let right : Token | undefined;

    let parentHandler : Handler | undefined;

    let removedBreakEnd;
    let removedBreakBefore;
    let remove;

    if (parent) {
        parentHandler = context.handlers.get(parent.name);
    }

    let i = childrenLength;

    while (i--) {
        if (!(token = children[i])) {
            continue;
        }

        if (token.type === TokenType.NEWLINE) {
            left = i > 0 ? children[i - 1] : undefined;
            right = i < childrenLength - 1 ? children[i + 1] : undefined;
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
                    if (context.handlers.breaks(parentHandler, 'start', options)) {
                        remove = true;
                    }
                    // Last child of parent so must be end line break
                    // (breakEndBlock, breakEnd)
                    // e.g. \n[/tag]
                    // remove last line break (breakEndBlock, breakEnd)
                } else if (!removedBreakEnd && !right) {
                    if (context.handlers.breaks(parentHandler, 'end', options)) {
                        remove = true;
                    }

                    removedBreakEnd = remove;
                }
            }

            if (
                left &&
                left.type === TokenType.OPEN
            ) {
                if (!onlyRemoveBreakAfter) {
                    if (context.handlers.breaks(left.name, 'after', options)) {
                        remove = true;
                    }
                } else if (!context.handlers.isInline(left.name)) {
                    remove = true;
                }
            }

            if (
                !onlyRemoveBreakAfter &&
                !removedBreakBefore &&
                right &&
                right.type === TokenType.OPEN
            ) {
                if (context.handlers.has(right.name)) {
                    if (context.handlers.breaks(right.name, 'before', options)) {
                        remove = true;
                    }

                    removedBreakBefore = remove;

                    if (remove) {
                        children.splice(i, 1);


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
                handlers: context.handlers,
                children: token.children,
                parent: token,
                options,
                onlyRemoveBreakAfter,
            });
        }
    }
}
