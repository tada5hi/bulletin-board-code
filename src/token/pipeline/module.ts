/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Token } from '../module';
import { tokenizeBBCode } from '../tokenize';
import {
    fixNestingTokens,
    normalizeTokenNewLines,
    parseTokens,
    removeEmptyTokens,
} from '../utils';
import type { TokenPipelineContext } from './types';

/**
 * Turn BBCode text into a token tree:
 * tokenize -> build tree -> fix nesting -> normalise newlines -> remove empties.
 *
 * @param context
 */
export function parseBBCodeTokens(context: TokenPipelineContext) : Token[] {
    const { handlers, options } = context;

    const tokens = parseTokens({
        items: tokenizeBBCode(context.input, handlers),
        handlers,
        fixInvalidChildren: options.fixInvalidChildren,
    });

    if (options.fixInvalidNesting) {
        fixNestingTokens({
            children: tokens,
            handlers,
            fixInvalidChildren: options.fixInvalidChildren,
        });
    }

    normalizeTokenNewLines({
        children: tokens,
        handlers,
        options,
        onlyRemoveBreakAfter: context.preserveNewLines,
    });

    if (options.removeEmptyTags) {
        removeEmptyTokens(tokens, handlers);
    }

    return tokens;
}
