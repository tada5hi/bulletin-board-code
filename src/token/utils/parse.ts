/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Token, TokenType, hasToken } from '../index';
import { Handler, getHandler } from '../../handler';
import { lastArrayElement } from '../../utils';

export function isChildAllowed(parent: Token, child: Token, fixInvalidChildren?: boolean) {
    const parentBBCode = parent ? getHandler(parent.name) : {} as Handler;
    const { allowedChildren } = parentBBCode;

    if (fixInvalidChildren && allowedChildren) {
        return allowedChildren.indexOf(child.name || '#') > -1;
    }

    return true;
}

export function parseTokens(items: Token[], fixInvalidChildren: boolean) {
    let token : Token;
    let handler : Handler;
    let curTok : Token;
    let clone : Token;
    let i;
    let next;

    const cloned : Token[] = [];
    const output : Token[] = [];
    const openTags : Token[] = [];

    const currentTag = () : Token => lastArrayElement(openTags);
    const addTag = (token: Token) => {
        if (currentTag()) {
            currentTag().children.push(token);
        } else {
            output.push(token);
        }
    };

    const closesCurrentTag = (name: string) => {
        currentTag();

        const tag = currentTag();
        if (!tag) {
            return false;
        }

        const bbcode = getHandler(tag.name);

        return bbcode.closedBy && bbcode.closedBy.indexOf(name) > -1;
    };

    // eslint-disable-next-line no-cond-assign
    while ((token = items.shift())) {
        // eslint-disable-next-line prefer-destructuring
        next = items[0];

        /*
         * Fixes any invalid children.
         *
         * If it is an element which isn't allowed as a child of it's
         * parent then it will be converted to content of the parent
         * element. i.e.
         *     [code]Code [b]only[/b] allows text.[/code]
         * Will become:
         *     <code>Code [b]only[/b] allows text.</code>
         * Instead of:
         *     <code>Code <b>only</b> allows text.</code>
         */
        // Ignore tags that can't be children
        if (!isChildAllowed(currentTag(), token, fixInvalidChildren)) {
            // exclude closing tags of current tag
            if (token.type !== TokenType.CLOSE || !currentTag() || token.name !== currentTag().name) {
                token.name = '#';
                token.type = TokenType.CONTENT;
            }
        }

        switch (token.type) {
            case TokenType.OPEN:
                // Check it this closes a parent,
                // e.g. for lists [*]one [*]two
                if (closesCurrentTag(token.name)) {
                    openTags.pop();
                }

                addTag(token);
                handler = getHandler(token.name);

                // If this tag is not self-closing and it has a closing
                // tag then it is open and has children so add it to the
                // list of open tags. If has the closedBy property then
                // it is closed by other tags so include everything as
                // it's children until one of those tags is reached.
                if (
                    handler &&
                    !handler.isSelfClosing &&
                    (
                        handler.closedBy ||
                        hasToken(items, token.name, TokenType.CLOSE)
                    )
                ) {
                    openTags.push(token);
                } else if (!handler || !handler.isSelfClosing) {
                    token.type = TokenType.CONTENT;
                }
                break;

            case TokenType.CLOSE:
                // check if this closes the current tag,
                // e.g. [/list] would close an open [*]
                if (currentTag() && token.name !== currentTag().name &&
                    closesCurrentTag(`/${token.name}`)) {
                    openTags.pop();
                }

                // If this is closing the currently open tag just pop
                // the close tag off the open tags array
                if (currentTag() && token.name === currentTag().name) {
                    currentTag().closing = token;
                    openTags.pop();

                    // If this is closing an open tag that is the parent of
                    // the current tag then clone all the tags including the
                    // current one until reaching the parent that is being
                    // closed. Close the parent and then add the clones back
                    // in.
                } else if (hasToken(openTags, token.name, TokenType.OPEN)) {
                    // Remove the tag from the open tags
                    // eslint-disable-next-line no-cond-assign
                    while ((curTok = openTags.pop())) {
                        // If it's the tag that is being closed then
                        // discard it and break the loop.
                        if (curTok.name === token.name) {
                            curTok.closing = token;
                            break;
                        }

                        // Otherwise clone this tag and then add any
                        // previously cloned tags as it's children
                        clone = curTok.clone();

                        if (cloned.length) {
                            clone.children.push(lastArrayElement(cloned));
                        }

                        cloned.push(clone);
                    }

                    // Place block linebreak before cloned tags
                    if (next && next.type === TokenType.NEWLINE) {
                        handler = getHandler(token.name);
                        if (handler && handler.isInline === false) {
                            addTag(next);
                            items.shift();
                        }
                    }

                    // Add the last cloned child to the now current tag
                    // (the parent of the tag which was being closed)
                    addTag(lastArrayElement(cloned));

                    // Add all the cloned tags to the open tags list
                    i = cloned.length;
                    while (i--) {
                        openTags.push(cloned[i]);
                    }

                    cloned.length = 0;

                    // This tag is closing nothing so treat it as content
                } else {
                    token.type = TokenType.CONTENT;
                    addTag(token);
                }
                break;

            case TokenType.NEWLINE:
                // handle things like
                //     [*]list\nitem\n[*]list1
                // where it should come out as
                //     [*]list\nitem[/*]\n[*]list1[/*]
                // instead of
                //     [*]list\nitem\n[/*][*]list1[/*]
                if (
                    currentTag() &&
                    next &&
                    closesCurrentTag((next.type === TokenType.CLOSE ? '/' : '') + next.name)
                ) {
                    // skip if the next tag is the closing tag for
                    // the option tag, i.e. [/*]
                    if (!(next.type === TokenType.CLOSE && next.name === currentTag().name)) {
                        handler = getHandler(currentTag().name);

                        if (handler && handler.breakAfter) {
                            openTags.pop();
                        } else if (handler && handler.isInline === false && handler.breakAfter !== false) {
                            openTags.pop();
                        }
                    }
                }

                addTag(token);
                break;
            default:
                addTag(token);
                break;
        }
    }

    return output;
}
