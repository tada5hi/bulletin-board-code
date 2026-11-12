/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { TokenType } from '../constants';
import type { Token } from '../module';
import type { NestingTokenFixContext } from './types';
import { isChildAllowed } from './parse';
import { lastArrayElement } from '../../utils';

/**
 * Fixes any invalid nesting.
 *
 * If it is a block level element inside 1 or more inline elements
 * than those inline elements will be split at the point where the
 * block level is and the block level element placed between the split
 * parts. i.e.
 *     [inline]A[blocklevel]B[/blocklevel]C[/inline]
 * Will become:
 *     [inline]A[/inline][blocklevel]B[/blocklevel][inline]C[/inline]
 *
 */
export function fixNestingTokens(context: NestingTokenFixContext) {
    const isInline = (token: Token) => context.handlers.isInline(token.name);

    const rootArr = context.children;
    const parents : Token[] = [];

    const fix = (children: Token[], insideInlineElement: boolean) => {
        let token: Token;
        let parent : Token | undefined;
        let parentIndex : number;

        let parentParentChildren : Token[];
        let right : Token;

        // This must check the length each time as it can change when
        // tokens are moved to fix the nesting.
        // eslint-disable-next-line unicorn/no-for-loop -- the array is spliced while iterating
        for (let i = 0; i < children.length; i++) {
            if (!(token = children[i]) || token.type !== TokenType.OPEN) {
                continue;
            }

            if (insideInlineElement && !isInline(token)) {
                // if this is a blocklevel element inside an inline one then
                // split the parent at the block level element
                parent = lastArrayElement(parents);

                if (!parent) {
                    continue;
                }

                right = parent.splitAt(token);

                parentParentChildren = parents.length > 1 ?
                    parents[parents.length - 2].children : rootArr;

                // If parent inline is allowed inside this tag, clone it and
                // wrap this tags children in it.
                if (isChildAllowed({
                    handlers: context.handlers,
                    parent: token,
                    child: parent,
                    fixInvalidChildren: context.fixInvalidChildren,
                })) {
                    const clone = parent.clone();

                    clone.children = token.children;
                    token.children = [clone];
                }

                parentIndex = parentParentChildren.indexOf(parent);

                if (parentIndex > -1) {
                    // remove the block level token from the right side of
                    // the split inline element
                    right.children.shift();

                    // insert the block level token and the right side after
                    // the left side of the inline token
                    parentParentChildren.splice(parentIndex + 1, 0, token, right);

                    // If token is a block and is followed by a newline,
                    // then move the newline along with it to the new parent
                    const next = right.children[0];

                    if (next && next.type === TokenType.NEWLINE) {
                        if (!isInline(token)) {
                            right.children.shift();
                            parentParentChildren.splice(parentIndex + 2, 0, next);
                        }
                    }

                    // return to parents loop as the
                    // children have now increased
                    return;
                }
            }

            parents.push(token);

            fix(token.children, insideInlineElement || isInline(token));

            parents.pop();
        }
    };

    fix(context.children, false);
}
