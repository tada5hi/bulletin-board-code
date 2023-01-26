/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { TokenType } from './constants';
import { TokenAttributes } from './type';

export class Token {
    public type : `${TokenType}`;

    public name: string;

    public value: string;

    public attrs: TokenAttributes;

    public children: Token[];

    public closing: Token | null;

    constructor(
        type: `${TokenType}`,
        name: string,
        value: string,
        attrs?: TokenAttributes,
        children?: Token[],
        closing?: Token,
    ) {
        this.type = type;
        this.name = name;
        this.value = value;

        this.attrs = attrs || [];
        this.children = children || [];
        this.closing = closing || null;
    }

    clone() : Token {
        return new Token(
            this.type,
            this.name,
            this.value,
            { ...this.attrs },
            [],
            this.closing ? this.closing.clone() : undefined,
        );
    }

    splitAt(splitAt: Token) {
        let offsetLength;
        const clone = this.clone();
        const offset = this.children.indexOf(splitAt);

        if (offset > -1) {
            // Work out how many items are on the right side of the split
            // to pass to splice()
            offsetLength = this.children.length - offset;
            clone.children = this.children.splice(offset, offsetLength);
        }

        return clone;
    }
}
