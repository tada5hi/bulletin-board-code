/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Handlers } from '../handler';
import type { ParserOptions } from '../parser';
import type { Token } from './module';

export type TokenAttributes = {
    default?: string,
    class?: string[],
    style?: Record<string, any>
} & {
    [key: string]: any
};

export type TokenParseContext = {
    items: Token[],
    fixInvalidChildren: boolean,
    handlers: Handlers
};

export type ChildAllowedCheckContext = {
    parent?: Token,
    child: Token,
    handlers: Handlers,
    fixInvalidChildren?: boolean
};

export type NestingTokenFixContext = {
    children: Token[],
    parents?: Token[],
    insideInlineElement?: boolean,
    rootArr?: Token[],
    handlers: Handlers,
    fixInvalidChildren?: boolean
};

export type TokenNewLinesNormaliseContext = {
    handlers: Handlers,
    children: Token[],
    parent?: Token,
    options: ParserOptions,
    onlyRemoveBreakAfter?: boolean
};
