import { describe, expect, it } from 'vitest';
/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { TokenAttributes } from '../../src';
import {
    Handlers,
    Parser,
    Token,
    TokenType,
    convertHTMLToBBCode,
    tokenizeHTML,
} from '../../src';

function createToken(name: string, attrs: TokenAttributes = {}) {
    return new Token(TokenType.OPEN, name, `<${name}>`, { class: [], ...attrs });
}

describe('html to bbcode: line breaks after blocks', () => {
    it('should emit the line break the bbcode parser swallows after a block', () => {
        const parser = new Parser();

        expect(parser.toBBCode('<blockquote>a</blockquote>b')).toEqual('[quote]a[/quote]\nb');
        expect(parser.toBBCode('<blockquote>a</blockquote><br />b')).toEqual('[quote]a[/quote]\n\nb');
        expect(parser.toBBCode('<blockquote>a</blockquote>')).toEqual('[quote]a[/quote]');
        expect(parser.toBBCode('<ul><li>a</li><li>b</li></ul>')).toEqual('[ul][li]a[/li][li]b[/li][/ul]');
        expect(parser.toBBCode('<table><tr><td>a</td><td>b</td></tr></table>'))
            .toEqual('[table][tr][td]a[/td]\n[td]b[/td][/tr][/table]');
    });

    it('should not add a second line break for attribute-only block elements', () => {
        const parser = new Parser();

        expect(parser.toBBCode('<div style="text-align: center">x</div>y')).toEqual('[center]x[/center]\ny');
        expect(parser.toBBCode('<p style="text-align: center">x</p><p>y</p>')).toEqual('[center]x[/center]\ny');
    });

    it('should follow the parser break options', () => {
        const parser = new Parser({ breakAfterBlock: false });

        expect(parser.toBBCode('<blockquote>a</blockquote>b')).toEqual('[quote]a[/quote]b');
    });

    it('should use the parser defaults for undefined converter break options', () => {
        const tokens = [
            createToken('blockquote', {}),
            new Token(TokenType.CONTENT, '#', 'b'),
        ];

        tokens[0].children.push(new Token(TokenType.CONTENT, '#', 'a'));

        expect(convertHTMLToBBCode(tokens, new Handlers()))
            .toEqual('[quote]a[/quote]\nb');
        expect(convertHTMLToBBCode(tokens, new Handlers(), { breakAfterBlock: false }))
            .toEqual('[quote]a[/quote]b');
    });

    it('should round-trip bbcode rendered html', () => {
        const parser = new Parser();

        const corpus = [
            '[quote]a[/quote]',
            '[quote]a[/quote]b',
            '[quote]a[/quote]\nb',
            '[quote]a[/quote]\n\nb',
            '[quote]a[/quote]\n\n\nb',
            'x\n[quote]a[/quote]\nb',
            '[quote=Peter]hi[/quote]\nafter',
            '[quote][quote]in[/quote]out[/quote]',
            '[quote][quote]in[/quote]\n\nout[/quote]\nend',
            '[quote]a\n\n[b]b[/b]\n[/quote]\n\nend',
            '[ul][li]a[/li][li]b[/li][/ul]\nafter',
            '[ul]\n[li]a[/li]\n[li]b[/li]\n[/ul]',
            '[ol][li]a[/li][/ol]\n\nb',
            '[list][*]a\n[*]b\n[/list]',
            '[table][tr][th]h[/th][th]h2[/th][/tr][tr][td]c[/td][td]d[/td][/tr][/table]\nb',
            '[code]x\ny z[/code]\nb',
            '[code]x\n  y[/code]\nb',
            '[code]a[/code]\n\nb',
            '[center]x[/center]\ny',
            '[center]x[/center]\n\ny',
            '[left]x[/left][right]y[/right]',
            '[b]bold[/b] [i]it[/i]\nnext',
            '[url=http://a.b]x[/url] and [color=red]y[/color]',
            'plain\nmulti\n\nline  text',
            '[hr]\nb',
            '[h1]T[/h1]\ntext',
        ];

        for (const input of corpus) {
            const html = parser.toHTML(input);

            // a decoded &nbsp; is rendered as the character itself
            const again = parser.toHTML(parser.toBBCode(html)).replace(/\u00a0/g, '&nbsp;');

            expect(again, input).toEqual(html);
        }
    });
});

describe('html to bbcode: whitespace normalisation', () => {
    it('should collapse source whitespace like a browser', () => {
        const parser = new Parser();

        expect(parser.toBBCode('<p>a</p>\n<p>b</p>')).toEqual('a\nb');
        expect(parser.toBBCode('<ul>\n<li>a</li>\n<li>b</li>\n</ul>'))
            .toEqual(parser.toBBCode('<ul><li>a</li><li>b</li></ul>'));
        expect(parser.toBBCode('<table>\n  <tr>\n    <td>a</td>\n    <td>b</td>\n  </tr>\n</table>'))
            .toEqual(parser.toBBCode('<table><tr><td>a</td><td>b</td></tr></table>'));
        expect(parser.toBBCode('<p>  a   b  </p>')).toEqual('a b');
        expect(parser.toBBCode('a<br>\n  b')).toEqual('a\nb');
        expect(parser.toBBCode('  a \t\r\n b  ')).toEqual('a b');
        expect(parser.toBBCode('<blockquote>\n  a\n</blockquote>\nb')).toEqual('[quote]a[/quote]\nb');
        expect(parser.toBBCode('a\u{A0}\u{A0}b')).toEqual('a\u{A0}\u{A0}b');
    });

    it('should keep one space between inline elements', () => {
        const parser = new Parser();

        expect(parser.toBBCode('<strong>a</strong> <em>b</em>')).toEqual('[b]a[/b] [i]b[/i]');
        expect(parser.toBBCode('<strong>a</strong>\n<em>b</em>')).toEqual('[b]a[/b] [i]b[/i]');
        expect(parser.toBBCode('<strong>a </strong> <em>b</em>')).toEqual('[b]a [/b] [i]b[/i]');
    });

    it('should leave preserved elements untouched', () => {
        const parser = new Parser();

        expect(parser.toBBCode('<pre>a\n  b</pre>')).toEqual('a\n  b');
        expect(parser.toBBCode('<code>a\n  b</code>')).toEqual('[code]a\n  b[/code]');
        expect(parser.toBBCode('<textarea>a\n  b</textarea>')).toEqual('a\n  b');
    });

    it('should keep the raw tokenizer and not mutate converter input', () => {
        const parser = new Parser();

        expect(tokenizeHTML('<p>a</p>\n<p>b</p>')[1].value).toEqual('\n');

        const tokens = tokenizeHTML('<p> a </p>\n');

        convertHTMLToBBCode(tokens, new Handlers(), { lazy: true });

        expect(tokens[0].children[0].value).toEqual(' a ');
        expect(tokens[1].value).toEqual('\n');

        expect(parser.parseHTML('<p> a </p>\n')).toHaveLength(1);
    });
});

describe('html to bbcode: match order', () => {
    it('should order block level handlers before inline ones', () => {
        const handlers = new Handlers();

        expect(handlers.match(createToken('div', { style: { textAlign: 'center', color: 'red' } })))
            .toEqual([handlers.get('center'), handlers.get('color')]);
        expect(handlers.match(createToken('strong', { style: { textAlign: 'center', color: 'red' } })))
            .toEqual([handlers.get('center'), handlers.get('b'), handlers.get('color')]);
        expect(handlers.match(createToken('blockquote', { style: { color: 'red', textAlign: 'right' } })))
            .toEqual([handlers.get('quote'), handlers.get('right'), handlers.get('color')]);
    });

    it('should not nest a block inside an inline tag', () => {
        const parser = new Parser();

        expect(parser.toBBCode('<div style="text-align: center; color: red">x</div>'))
            .toEqual('[center][color=red]x[/color][/center]');
        expect(parser.toBBCode('<ul><li style="font-weight: bold">x</li></ul>')).toEqual('[ul][li][b]x[/b][/li][/ul]');
        expect(parser.toBBCode('<strong style="color: red">x</strong>')).toEqual('[b][color=red]x[/color][/b]');
        expect(parser.toBBCode('<strong style="text-align: center">x</strong>y')).toEqual('[center][b]x[/b][/center]\ny');
    });
});

describe('html to bbcode: element rules before attribute handlers', () => {
    it('should render line breaks and dropped elements whatever their attributes', () => {
        const parser = new Parser();

        expect(parser.toBBCode('<br style="color:red">')).toEqual('\n');
        expect(parser.toBBCode('a<br style="font-weight:bold">b')).toEqual('a\nb');
        expect(parser.toBBCode('<script style="color:red">alert(1)</script>')).toEqual('');
        expect(parser.toBBCode('<style style="text-align: center">a{}</style>x')).toEqual('x');

        const strict = new Parser({ lazyTransformation: false });

        expect(strict.toBBCode('<br style="color:red">')).toEqual('\n');
        expect(strict.toBBCode('<script>alert(1)</script>')).toEqual('<script>alert(1)</script>');
        expect(strict.toBBCode('<script style="color:red">alert(1)</script>')).toEqual('[color=red]alert(1)[/color]');
    });

    it('should not treat dropped elements as whitespace boundaries', () => {
        const parser = new Parser();

        expect(parser.toBBCode('one <script style="text-align: center">ignored</script> two')).toEqual('one two');
        expect(parser.toBBCode('one <style style="text-align: center">a{}</style> two')).toEqual('one two');

        const strict = new Parser({ lazyTransformation: false });

        expect(strict.toBBCode('<script>a\n  b</script>')).toEqual('<script>a\n  b</script>');
    });

    it('should separate a block from the text before it', () => {
        const parser = new Parser();

        expect(parser.toBBCode('a<p>b</p>')).toEqual('a\nb');
        expect(parser.toBBCode('a<div>b</div>c')).toEqual('a\nb\nc');
        expect(parser.toBBCode('<strong>a</strong><p>b</p>')).toEqual('[b]a[/b]\nb');
        expect(parser.toBBCode('<p>a</p>b<p>c</p>')).toEqual('a\nb\nc');
        expect(parser.toBBCode('a<span><p>b</p></span>')).toEqual('a\nb');
        expect(parser.toBBCode('a<p style="color:red">b</p>')).toEqual('a\n[color=red]b[/color]');
        expect(parser.toBBCode('a<br><p>b</p>')).toEqual('a\nb');
        expect(parser.toBBCode('<blockquote>q</blockquote><p>b</p>')).toEqual('[quote]q[/quote]\nb');
        expect(parser.toBBCode('<p>a</p>')).toEqual('a');
        expect(parser.toBBCode('a<p></p>b')).toEqual('ab');
    });

    it('should separate a block nested in transparent elements once', () => {
        const parser = new Parser();

        expect(parser.toBBCode('<span><p>one</p></span>two')).toEqual('one\ntwo');
        expect(parser.toBBCode('<span><p style="color:red">one</p></span>two')).toEqual('[color=red]one[/color]\ntwo');
        expect(parser.toBBCode('<div><p>one</p></div>two')).toEqual('one\ntwo');
        expect(parser.toBBCode('<div><div><p>one</p></div></div>two')).toEqual('one\ntwo');
        expect(parser.toBBCode('<span><p>one</p></span>')).toEqual('one');
        expect(parser.toBBCode('<div><p>one</p></div>')).toEqual('one');
        expect(parser.toBBCode('<p>one</p><script>x</script>')).toEqual('one');
        expect(parser.toBBCode('<p>one</p><p></p>')).toEqual('one');
    });

    it('should combine the separation with the break after blocks and whitespace', () => {
        const parser = new Parser();

        expect(parser.toBBCode('<span><blockquote>a</blockquote></span>b')).toEqual('[quote]a[/quote]\nb');
        expect(parser.toBBCode('<div><blockquote>a</blockquote></div>b')).toEqual('[quote]a[/quote]\nb');
        expect(parser.toBBCode('<div>\n  <blockquote>a</blockquote>\n</div>\n<p>b</p>')).toEqual('[quote]a[/quote]\nb');
        expect(parser.toBBCode('<div><blockquote>a</blockquote></div><br>b')).toEqual('[quote]a[/quote]\n\nb');
        expect(parser.toBBCode('<div><blockquote>a</blockquote></div>')).toEqual('[quote]a[/quote]');
        expect(parser.toBBCode('<div>\n  <p>one</p>\n</div>\n<p>two</p>\n')).toEqual('one\ntwo');
        expect(parser.toBBCode('<p>a<br></p><p>b</p>')).toEqual('a\nb');

        const html = parser.toHTML('[quote]a[/quote]\nb');

        expect(parser.toHTML(parser.toBBCode(`<div>${html}</div>`))).toEqual(html);
    });
});

describe('html to bbcode: quote author', () => {
    it('should keep attribute wrappers of a quote with author', () => {
        const parser = new Parser();

        expect(parser.toBBCode('<blockquote style="color:red"><cite>A</cite>x</blockquote>'))
            .toEqual('[quote=A][color=red]x[/color][/quote]');
        expect(parser.toBBCode('<blockquote><cite>A</cite>x</blockquote>')).toEqual('[quote=A]x[/quote]');
        expect(parser.toBBCode('<blockquote><cite>A</cite><strong>x</strong></blockquote>'))
            .toEqual('[quote=A][b]x[/b]\n[/quote]');
        expect(parser.toBBCode(parser.toHTML('[quote=A]x[/quote]'))).toEqual('[quote=A]x[/quote]');
    });
});
