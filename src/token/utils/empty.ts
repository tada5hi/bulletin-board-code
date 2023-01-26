/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Token } from '../module';
import { Handler, getHandler } from '../../handler';
import { TokenType } from '../constants';

export function removeEmptyTokens(tokens: Token[]) {
    let token : Token;
    let bbcode : Handler | undefined;

    /**
     * Checks if all children are whitespace or not
     * @private
     */
    const isTokenWhiteSpace = (children: Token[]) => {
        let j = children.length;

        while (j--) {
            const { type } = children[j];

            if (type === TokenType.OPEN || type === TokenType.CLOSE) {
                return false;
            }

            if (type === TokenType.CONTENT && /\S|\u00A0/.test(children[j].value)) {
                return false;
            }
        }

        return true;
    };

    let i = tokens.length;
    while (i--) {
        // So skip anything that isn't a tag since only tags can be
        // empty, content can't
        token = tokens[i];

        if (!token || token.type !== TokenType.OPEN) {
            // eslint-disable-next-line no-continue
            continue;
        }

        bbcode = getHandler(token.name);

        // Remove any empty children of this tag first so that if they
        // are all removed this one doesn't think it's not empty.
        removeEmptyTokens(token.children);

        if (
            isTokenWhiteSpace(token.children) &&
            bbcode &&
            !bbcode.isSelfClosing &&
            !bbcode.allowsEmpty
        ) {
            tokens.splice(i, 1);
        }
    }
}
