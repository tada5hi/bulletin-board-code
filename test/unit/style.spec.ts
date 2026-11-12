import { describe, expect, it } from 'vitest';
/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Parser } from '../../src';
import { renderStyleValue } from '../../src/handler/utils';

describe('src/handler/utils/style.ts', () => {
    const parser = new Parser();

    it.each([
        ['[size=1;position:fixed;top:0;left:0;width:100%;height:100%]x[/size]'],
        ['[font=a;background-image:url(http://evil/x)]x[/font]'],
        ['[color=red;background:url(http://evil/x)]x[/color]'],
        ['[size=1;color:red]x[/size]'],
        ['[font=a:b]x[/font]'],
        ['[font=a}b]x[/font]'],
        ['[font=a{b]x[/font]'],
        ['[font=a/b]x[/font]'],
        ['[font=url(x)]x[/font]'],
        ['[font=URL(x)]x[/font]'],
        ['[font=\\\\75rl(x)]x[/font]'],
        ['[font=expression(alert(1))]x[/font]'],
        ['[color=EXPRESSION(alert(1))]x[/color]'],
        ['[color=#:;@]x[/color]'],
        ['[color=}]x[/color]'],
        ['[size=   ]x[/size]'],
        ['[font=   ]x[/font]'],
        ['[size]x[/size]'],
        ['[font]x[/font]'],
        ['[color]x[/color]'],
    ])('should render %j as literal text', (input) => {
        const html = parser.toHTML(input);

        expect(html).not.toContain('<span');
        expect(html).not.toContain('style=');
        expect(html).toContain('x[/');
    });

    it.each([
        ['a;b'],
        ['a:b'],
        ['a{b'],
        ['}'],
        ['a\\b'],
        ['\\75rl(x)'],
        ['a/b'],
        ['url(x)'],
        ['URL(x)'],
        ['expression(x)'],
        [''],
        [' '.repeat(3)],
        [undefined],
    ])('should reject the style value %j', (value) => {
        expect(renderStyleValue(value)).toBeUndefined();
    });

    it.each([
        ['red', 'red'],
        ['rgb(1, 2, 3)', 'rgb(1, 2, 3)'],
        ['"Times New Roman", serif', '&#34;Times New Roman&#34;, serif'],
        ['a<b', 'a&lt;b'],
    ])('should escape the style value %j', (value, expected) => {
        expect(renderStyleValue(value)).toEqual(expected);
    });

    it('should escape the literal tag', () => {
        expect(parser.toHTML('[font=a;b"]x[/font]')).toEqual('[font=a;b&#34;]x[/font]');
        expect(parser.toHTML('[size=1;position:fixed]x[/size]')).toEqual('[size=1;position:fixed]x[/size]');
        expect(parser.toHTML('[color=red;background:url(http://evil/x)]x[/color]'))
            .toEqual('[color=red;background:url(http://evil/x)]x[/color]');
    });

    it.each([
        ['[color=red]x[/color]', '<span style="color: red">x</span>'],
        ['[color=#abc]x[/color]', '<span style="color: #aabbcc">x</span>'],
        ['[color=#aabbcc]x[/color]', '<span style="color: #aabbcc">x</span>'],
        ['[color=rgb(1, 2, 3)]x[/color]', '<span style="color: #010203">x</span>'],
        ['[color=#1?2]x[/color]', '<span style="color: #1?2">x</span>'],
        ['[font=Arial]x[/font]', '<span style="font-family: Arial">x</span>'],
        ['[font="Times New Roman", serif]x[/font]', '<span style="font-family: &#34;Times New Roman&#34;, serif">x</span>'],
        ['[font=Times New Roman, serif]x[/font]', '<span style="font-family: Times New Roman, serif">x</span>'],
        ['[font=\'Comic Sans MS\']x[/font]', '<span style="font-family: Comic Sans MS">x</span>'],
        ['[size=1]x[/size]', '<span style="font-size: 1">x</span>'],
        ['[size=13px]x[/size]', '<span style="font-size: 13px">x</span>'],
        ['[size=1.5em]x[/size]', '<span style="font-size: 1.5em">x</span>'],
        ['[size=small]x[/size]', '<span style="font-size: small">x</span>'],
    ])('should keep the plain value of %j', (input, expected) => {
        expect(parser.toHTML(input)).toEqual(expected);
    });

    it.each([
        ['<span style="font-family: &quot;Times New Roman&quot;, serif">x</span>', '[font="Times New Roman", serif]x[/font]'],
        ['<span style="font-family: Arial">x</span>', '[font=Arial]x[/font]'],
        ['<span style="font-size: 1.5em">x</span>', '[size=1.5em]x[/size]'],
        ['<span style="color: #aabbcc">x</span>', '[color=#aabbcc]x[/color]'],
        ['<span style="color: rgb(1, 2, 3)">x</span>', '[color=#010203]x[/color]'],
    ])('should convert %j to bbcode', (input, expected) => {
        expect(parser.toBBCode(input)).toEqual(expected);
    });

    it.each([
        ['[font="Times New Roman", serif]x[/font]'],
        ['[size=13px]x[/size]'],
        ['[color=#aabbcc]x[/color]'],
    ])('should round-trip %j', (input) => {
        expect(parser.toBBCode(parser.toHTML(input))).toEqual(input);
    });
});
