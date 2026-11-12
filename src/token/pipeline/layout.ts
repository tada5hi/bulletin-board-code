/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Handler, Handlers } from '../../handler';
import { isTagMatch } from '../../handler/utils';
import type { Token } from '../module';

/**
 * Block level HTML elements, which separate their content
 * from what follows when no handler renders them.
 */
export const HTMLBlockTags : string[] = [
    'address',
    'article',
    'aside',
    'div',
    'dl',
    'dd',
    'dt',
    'fieldset',
    'figcaption',
    'figure',
    'footer',
    'form',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'header',
    'hr',
    'main',
    'nav',
    'p',
    'pre',
    'section',
];

/**
 * Structural HTML elements, which lay out as blocks
 * whatever their handlers say.
 */
export const HTMLStructuralTags : string[] = [
    'li',
    'ul',
    'ol',
    'table',
    'thead',
    'tbody',
    'tfoot',
    'tr',
    'td',
    'th',
    'blockquote',
    'dl',
    'dt',
    'dd',
];

/**
 * Elements whose text is kept exactly as written.
 */
export const HTMLPreservedTags : string[] = [
    'pre',
    'textarea',
];

/**
 * Elements whose content is not document text.
 * They take no part in the layout.
 */
export const HTMLNonRenderedTags : string[] = [
    'head',
    'noscript',
    'script',
    'style',
    'template',
    'title',
];

/**
 * Find the handlers rendering an HTML element as BBCode;
 * the first one is the outermost.
 *
 * @param handlers
 * @param token
 */
export function matchBBCodeHandlers(handlers: Handlers, token: Token) : Handler[] {
    return handlers.match(token).filter((handler) => !!handler.bbcode);
}

/**
 * Check if an HTML element lays out as a block:
 * a structural element, an element whose outermost handler
 * is not HTML inline, or a block level element without a
 * tag matched handler (unmatched or attribute handlers only).
 * A non rendered element is never a block.
 *
 * @param handlers
 * @param token
 */
export function isHTMLLayoutBlock(handlers: Handlers, token: Token) : boolean {
    const name = token.name.toLowerCase();

    if (HTMLNonRenderedTags.includes(name)) {
        return false;
    }

    if (HTMLStructuralTags.includes(name)) {
        return true;
    }

    const matches = matchBBCodeHandlers(handlers, token);

    if (matches.length > 0 && !handlers.isHtmlInline(matches[0])) {
        return true;
    }

    return HTMLBlockTags.includes(name) &&
        matches.every((handler) => !isTagMatch(handler, token));
}
