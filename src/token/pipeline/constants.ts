/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { TokenBreakDefaults } from './types';

/**
 * The default line-break policy of block level tags.
 */
export const TokenBreakDefaultOptions : TokenBreakDefaults = {
    breakBeforeBlock: false,
    breakStartBlock: false,
    breakEndBlock: false,
    breakAfterBlock: true,
};
