import { describe, expect, it } from 'vitest';
/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    Handlers,
    Parser,
    Token,
    TokenType,
    convertBBCodeToHTML,
    convertHTMLToBBCode,
} from '../../src';

describe('src/converter/*.ts', () => {
    it('should emit <br /> for every bbcode newline', () => {
        const parser = new Parser();

        const html = parser.toHTML('foo\nbar');

        expect(html).toEqual('foo<br />bar');
        expect(html).not.toContain('</div>');

        expect(parser.toHTML('foo\n')).toEqual('foo<br />');
    });

    it('should emit \\n for html newline tokens', () => {
        const output = convertHTMLToBBCode({
            tokens: [
                new Token(TokenType.CONTENT, '#', 'a'),
                new Token(TokenType.NEWLINE, '#newline', '\n'),
                new Token(TokenType.CONTENT, '#', 'b'),
            ],
            options: { lazy: true },
            handlers: new Handlers(),
        });

        expect(output).toEqual('a\nb');
    });

    it('should emit html text decoded and unescaped', () => {
        const parser = new Parser();

        expect(parser.toBBCode('a &amp; b')).toEqual('a & b');
        expect(parser.toBBCode('&lt;x&gt; "q"')).toEqual('<x> "q"');
        expect(parser.toBBCode('a\nb')).toEqual('a b');
        expect(parser.toBBCode('<b>a\nb</b>')).toEqual('[b]a b[/b]');
    });

    it('should convert unmatched html elements', () => {
        const parser = new Parser();

        expect(parser.toBBCode('<p>foo</p>')).toEqual('foo');
        expect(parser.toBBCode('<p>a</p><p>b</p>')).toEqual('a\nb');
        expect(parser.toBBCode('<div>a\n</div><p>b</p>')).toEqual('a\nb');
        expect(parser.toBBCode('<p></p><p>b</p>')).toEqual('b');
        expect(parser.toBBCode('foo<br>bar')).toEqual('foo\nbar');
        expect(parser.toBBCode('<span>x</span>')).toEqual('x');
        expect(parser.toBBCode('<span>a</span><span>b</span>')).toEqual('ab');

        const strict = new Parser({ lazyTransformation: false });

        expect(strict.toBBCode('<span>x</span>')).toEqual('<span>x</span>');
        expect(strict.toBBCode('foo<br>bar')).toEqual('foo\nbar');
    });

    it('should drop script-like html elements with their content', () => {
        const parser = new Parser();

        expect(parser.toBBCode('<script>alert(1)</script>')).toEqual('');
        expect(parser.toBBCode('<style>a{}</style>x')).toEqual('x');
        expect(parser.toBBCode('<noscript><b>x</b></noscript>')).toEqual('');
        expect(parser.toBBCode('<template><b>x</b></template>y')).toEqual('y');
        expect(parser.toBBCode('<title>t</title>y')).toEqual('y');
        expect(parser.toBBCode('<head><title>t</title></head>y')).toEqual('y');
        expect(parser.toBBCode('a<SCRIPT>alert(1)</SCRIPT>b')).toEqual('ab');
        expect(parser.toBBCode('<pre>x</pre>')).toEqual('x');

        const strict = new Parser({ lazyTransformation: false });

        expect(strict.toBBCode('<script>alert(1)</script>')).toEqual('<script>alert(1)</script>');
    });

    it('should separate block elements rendered by attribute handlers', () => {
        const parser = new Parser();

        expect(parser.toBBCode('<p style="color:red">a</p><p style="color:red">b</p>'))
            .toEqual('[color=red]a[/color]\n[color=red]b[/color]');
        expect(parser.toBBCode('<p style="font-weight:bold">a</p><p>b</p>')).toEqual('[b]a[/b]\nb');
        expect(parser.toBBCode('<div style="font-weight:bold">a\n</div><p>b</p>')).toEqual('[b]a[/b]\nb');
        expect(parser.toBBCode('<p style="color:red">a</p>')).toEqual('[color=red]a[/color]');
        expect(parser.toBBCode('<span style="color:red">a</span><span>b</span>')).toEqual('[color=red]a[/color]b');
        expect(parser.toBBCode('<blockquote>a</blockquote><blockquote>b</blockquote>'))
            .toEqual('[quote]a[/quote]\n[quote]b[/quote]');
        expect(parser.toBBCode('<ul><li style="color:red">a</li><li>b</li></ul>'))
            .toEqual('[ul][li][color=red]a[/color][/li][li]b[/li][/ul]');
        expect(parser.toHTML('[color=red]a[/color]\n[color=red]b[/color]'))
            .toEqual('<span style="color: red">a</span><br /><span style="color: red">b</span>');
    });

    it('should append a line break to block elements ending inline', () => {
        const parser = new Parser();
        const handlers = new Handlers();

        expect(parser.toHTML('[quote][b]x[/b][/quote]')).toEqual('<blockquote><strong>x</strong><br /></blockquote>');
        expect(parser.toBBCode('<blockquote><strong>x</strong></blockquote>')).toEqual('[quote][b]x[/b]\n[/quote]');

        const quote = () => new Token(TokenType.OPEN, 'quote', '[quote]', {});

        // empty block elements get a placeholder <br /> in html only
        expect(convertBBCodeToHTML({
            tokens: [quote()],
            options: {},
            handlers,
        }))
            .toEqual('<blockquote><br /></blockquote>');
        expect(convertHTMLToBBCode({
            tokens: [new Token(TokenType.OPEN, 'blockquote', '<blockquote>', {})],
            options: {},
            handlers,
        }))
            .toEqual('[quote][/quote]');
    });

    it('should convert unmatched bbcode elements', () => {
        const handlers = new Handlers();
        const token = new Token(TokenType.OPEN, 'x', '[x]', {}, [
            new Token(TokenType.CONTENT, '#', 'a'),
        ], new Token(TokenType.CLOSE, 'x', '[/x]'));

        expect(convertBBCodeToHTML({
            tokens: [token],
            options: { lazy: true },
            handlers,
        })).toEqual('');
        expect(convertBBCodeToHTML({
            tokens: [token],
            options: {},
            handlers,
        })).toEqual('[x]a[/x]');
    });

    it('should not consume the input tokens', () => {
        const parser = new Parser();

        const bbcode = parser.parseBBCode('[b]foo[/b] bar');
        const bbcodeLength = bbcode.length;

        convertBBCodeToHTML({
            tokens: bbcode,
            options: {},
            handlers: new Handlers(),
        });

        expect(bbcode.length).toEqual(bbcodeLength);
        expect(bbcode[0].attrs).not.toHaveProperty('0');

        const html = parser.parseHTML('<strong>foo</strong> bar<p>x</p>');
        const htmlLength = html.length;

        convertHTMLToBBCode({
            tokens: html,
            options: { lazy: true },
            handlers: new Handlers(),
        });

        expect(html.length).toEqual(htmlLength);
        expect(html[0].attrs).not.toHaveProperty('0');
    });

    it('should not mutate token attributes of string handlers', () => {
        const token = new Token(TokenType.OPEN, 'url', '[url=bar]', { default: 'bar' }, [
            new Token(TokenType.CONTENT, '#', 'foo'),
        ]);

        const html = convertBBCodeToHTML({
            tokens: [token],
            options: {},
            handlers: new Handlers(),
        });

        expect(html).toEqual('<a href="bar">foo</a>');
        expect(token.attrs).toEqual({ default: 'bar' });
        expect(token.children).toHaveLength(1);
    });

    it('should pass a convert function bound to the direction', () => {
        const parser = new Parser({
            handlers: {
                twice: {
                    conditions: [{ tag: 'x-twice' }],
                    html: (context) => `<x-twice>${context.convert(context.token.children)}</x-twice>`,
                    bbcode: (context) => `[twice]${context.content}|${context.convert(context.token.children)}[/twice]`,
                },
            },
        });

        expect(parser.toHTML('[twice]a & b[/twice]')).toEqual('<x-twice>a &amp; b</x-twice>');
        expect(parser.toBBCode('<x-twice>a &amp; b</x-twice>')).toEqual('[twice]a & b|a & b[/twice]');
    });

    it('should round-trip a quote with author', () => {
        const parser = new Parser();

        const tokens = parser.parseHTML('<blockquote><cite>bar</cite>foo</blockquote>');

        expect(convertHTMLToBBCode({
            tokens,
            options: { lazy: true },
            handlers: new Handlers(),
        }))
            .toEqual('[quote=bar]foo[/quote]');
        expect(tokens[0].children).toHaveLength(2);

        expect(parser.toBBCode(parser.toHTML('[quote=bar]foo[/quote]'))).toEqual('[quote=bar]foo[/quote]');
    });

    it('should round-trip multi-line text with bold and a list', () => {
        const parser = new Parser();

        const input = 'foo [b]bar[/b]\nbaz\n[ul][li]a[/li][li]b[/li][/ul]';

        expect(parser.toBBCode(parser.toHTML(input))).toEqual(input);
    });

    it('should convert a token tree of any depth', () => {
        const depth = 20000;
        const handlers = new Handlers();

        let bbcode = new Token(TokenType.CONTENT, '#', 'x');
        let html = new Token(TokenType.CONTENT, '#', 'x');

        for (let i = 0; i < depth; i++) {
            bbcode = new Token(TokenType.OPEN, 'b', '[b]', {}, [bbcode]);
            html = new Token(TokenType.OPEN, 'strong', '<strong>', { class: [] }, [html]);
        }

        expect(convertBBCodeToHTML({ tokens: [bbcode], handlers }))
            .toEqual(`${'<strong>'.repeat(depth)}x${'</strong>'.repeat(depth)}`);
        expect(convertHTMLToBBCode({ tokens: [html], handlers }))
            .toEqual(`${'[b]'.repeat(depth)}x${'[/b]'.repeat(depth)}`);
    });
});
