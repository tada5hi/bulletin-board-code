import { describe, expect, it } from 'vitest';
/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Parser, Token, TokenType } from '../../src';

describe('src/token/pipeline', () => {
    it('should repair misnested inline tags', () => {
        const parser = new Parser();

        expect(parser.toHTML('[b]a[i]b[/b]c[/i]')).toEqual('<strong>a<em>b</em></strong><em>c</em>');
    });

    it('should repair a block inside an inline tag', () => {
        expect(new Parser().toHTML('[b]a[quote]b[/quote]c[/b]'))
            .toEqual('<strong>a</strong><blockquote><strong>b</strong><br /></blockquote><strong>c</strong>');
        expect(new Parser({ fixInvalidNesting: false }).toHTML('[b]a[quote]b[/quote]c[/b]'))
            .toEqual('<strong>a<blockquote>b</blockquote>c</strong>');
    });

    it('should keep tags inside [code] literal', () => {
        const parser = new Parser();

        expect(parser.toHTML('[code]a [b]b[/b] c[/code]')).toEqual('<code>a [b]b[/b] c</code>');
    });

    it('should fix invalid children only when enabled', () => {
        expect(new Parser({ fixInvalidChildren: true }).toHTML('[code][b]b[/b] c[/code]'))
            .toEqual('<code>[b]b[/b] c</code>');
        expect(new Parser({ fixInvalidChildren: false }).toHTML('[code][b]b[/b] c[/code]'))
            .toEqual('<code><strong>b</strong> c</code>');
    });

    it('should remove empty tags only when enabled', () => {
        expect(new Parser().toHTML('[b][/b]x[td][/td]')).toEqual('x<td><br /></td>');
        expect(new Parser({ removeEmptyTags: false }).toHTML('[b][/b]x')).toEqual('<strong></strong>x');
    });

    it('should close [*] list items', () => {
        const parser = new Parser();

        expect(parser.toHTML('[list][*]a[*]b[/list]')).toEqual('<ul><li>a</li><li>b</li></ul>');
        expect(parser.toHTML('[list]\n[*]a\n[*]b\n[/list]')).toEqual('<ul><li>a</li><li>b</li></ul>');
    });

    it('should keep a line break inside a [*] list item when breakAfterBlock is off', () => {
        const parser = new Parser({ breakAfterBlock: false });

        expect(parser.toHTML('[list][*]a\n[*]b\n[/list]'))
            .toEqual('<ul><li>a<br /></li><li>b<br /></li></ul>');
    });

    it('should keep unclosed and stray closing tags literal', () => {
        const parser = new Parser();

        expect(parser.toHTML('[b]foo')).toEqual('[b]foo');
        expect(parser.toHTML('foo[/b]')).toEqual('foo[/b]');
        expect(parser.toHTML('[b]a[/i]b[/b]')).toEqual('<strong>a[/i]b</strong>');
    });

    it('should default token attributes to an object', () => {
        const tokens = new Parser().parseBBCode('[b]a[/b]');

        expect(tokens).toHaveLength(1);
        expect(tokens[0].children[0].attrs).toEqual({});
        expect(new Token(TokenType.CONTENT, '#', 'x').attrs).toEqual({});
    });

    it('should clean up a nested block for each break option', () => {
        const input = '[quote][quote]a[/quote][/quote]';
        const off = {
            breakBeforeBlock: false,
            breakStartBlock: false,
            breakEndBlock: false,
            breakAfterBlock: false,
        };

        expect(new Parser(off).cleanupBBCode(input))
            .toEqual('[quote][quote]a[/quote][/quote]');
        expect(new Parser({ ...off, breakBeforeBlock: true }).cleanupBBCode(input))
            .toEqual('\n[quote]\n[quote]a[/quote][/quote]');
        expect(new Parser({ ...off, breakStartBlock: true }).cleanupBBCode(input))
            .toEqual('[quote]\n[quote]\na[/quote][/quote]');
        expect(new Parser({ ...off, breakEndBlock: true }).cleanupBBCode(input))
            .toEqual('[quote][quote]a\n[/quote]\n[/quote]');
        expect(new Parser({ ...off, breakAfterBlock: true }).cleanupBBCode(input))
            .toEqual('[quote][quote]a[/quote]\n[/quote]\n');
    });
});

describe('src/index.ts', () => {
    it('should export exactly the public runtime surface', async () => {
        const keys = Object.keys(await import('../../src')).sort();

        expect(keys).toEqual([
            'HandlerPreset',
            'Handlers',
            'Parser',
            'ParserDefaultOptions',
            'QuoteType',
            'Token',
            'TokenType',
            'convertBBCodeToHTML',
            'convertHTMLToBBCode',
            'tokenizeBBCode',
            'tokenizeHTML',
        ]);
    });
});
