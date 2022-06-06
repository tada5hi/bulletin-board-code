/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export type Attribute = {
    style?: {
        [T in keyof CSSStyleDeclaration]?: string[] | null
    },
    class?: string[],
    [key: string]: any
};

export type Condition = {
    tag?: string,
    attribute?: Partial<Attribute>
};
