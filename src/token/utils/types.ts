/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Handlers } from '../../handler';
import type { Token } from '../module';
import type { TokenPipelineOptions } from '../pipeline/types';

export type TokenParseContext = {
    items: Token[],
    handlers: Handlers,
    fixInvalidChildren: boolean
};

export type ChildAllowedCheckContext = {
    parent?: Token,
    child: Token,
    handlers: Handlers,
    fixInvalidChildren: boolean
};

export type NestingTokenFixContext = {
    children: Token[],
    handlers: Handlers,
    fixInvalidChildren: boolean
};

export type TokenNewLinesNormaliseContext = {
    children: Token[],
    handlers: Handlers,
    options: Pick<TokenPipelineOptions, 'breakBeforeBlock' | 'breakStartBlock' | 'breakEndBlock' | 'breakAfterBlock'>,
    onlyRemoveBreakAfter?: boolean
};
