/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Handlers } from '../../handler';

export type TokenPipelineOptions = {
    breakBeforeBlock: boolean,
    breakStartBlock: boolean,
    breakEndBlock: boolean,
    breakAfterBlock: boolean,
    removeEmptyTags: boolean,
    fixInvalidNesting: boolean,
    fixInvalidChildren: boolean
};

export type TokenPipelineContext = {
    input: string,
    handlers: Handlers,
    options: TokenPipelineOptions,
    preserveNewLines?: boolean
};
