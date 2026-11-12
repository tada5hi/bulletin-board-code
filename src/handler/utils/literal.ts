/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ConverterContext } from '../types';
import { escapeCharacters } from '../../utils';

/**
 * Render a tag as visible text: escaped opening tag, converted content and escaped closing tag.
 *
 * @param context
 */
export function renderLiteralTag(context: ConverterContext) : string {
    const closing = context.token.closing ?
        escapeCharacters(context.token.closing.value, true) :
        '';

    return escapeCharacters(context.token.value, true) + context.content + closing;
}
