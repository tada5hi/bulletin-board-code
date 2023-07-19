/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { TokenType } from '../constants';
import type { Token } from '../module';
import type { NestingTokenFixContext } from '../type';
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
    const isInline = (token: Token) => {
        const handler = context.handlers.get(token.name);

        return !handler || handler.isInline !== false;
    };

    context.parents = context.parents || [];
    context.rootArr = context.rootArr || context.children;

    let token: Token;
    let parent : Token | undefined;
    let parentIndex : number;

    let parentParentChildren : Token[];
    let right : Token;

    // This must check the length each time as it can change when
    // tokens are moved to fix the nesting.
    for (let i = 0; i < context.children.length; i++) {
        // eslint-disable-next-line no-cond-assign
        if (!(token = context.children[i]) || token.type !== TokenType.OPEN) {
            // eslint-disable-next-line no-continue
            continue;
        }

        if (context.insideInlineElement && !isInline(token)) {
            // if this is a blocklevel element inside an inline one then
            // split the parent at the block level element
            parent = lastArrayElement(context.parents);
            if (!parent) {
                continue;
            }
            right = parent.splitAt(token);

            parentParentChildren = context.parents.length > 1 ?
                context.parents[context.parents.length - 2].children : context.rootArr;

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
                right.children.splice(0, 1);

                // insert the block level token and the right side after
                // the left side of the inline token
                parentParentChildren.splice(parentIndex + 1, 0, token, right);

                // If token is a block and is followed by a newline,
                // then move the newline along with it to the new parent
                const next = right.children[0];
                if (next && next.type === TokenType.NEWLINE) {
                    if (!isInline(token)) {
                        right.children.splice(0, 1);
                        parentParentChildren.splice(parentIndex + 2, 0, next);
                    }
                }

                // return to parents loop as the
                // children have now increased
                return;
            }
        }

        context.parents.push(token);

        fixNestingTokens({
            handlers: context.handlers,
            children: token.children,
            parents: context.parents,
            insideInlineElement: context.insideInlineElement || isInline(token),
            rootArr: context.rootArr,
            fixInvalidChildren: context.fixInvalidChildren,
        });

        context.parents.pop();
    }
}
