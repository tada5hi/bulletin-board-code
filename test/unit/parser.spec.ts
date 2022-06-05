/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {Parser} from "../../src";
import {setHandler} from "../../src";

describe('src/parser/*.ts', () => {
    it('should convert bbcode to html string', () => {
        const parser = new Parser();

        expect(parser.toHTML('[b]foo[/b]')).toEqual('<strong>foo</strong>');
        expect(parser.toHTML('[i]foo[/i]')).toEqual('<em>foo</em>');
        expect(parser.toHTML('[u]foo[/u]')).toEqual('<u>foo</u>');
        expect(parser.toHTML('[s]foo[/s]')).toEqual('<s>foo</s>');
        expect(parser.toHTML('[sub]foo[/sub]')).toEqual('<sub>foo</sub>');
        expect(parser.toHTML('[sup]foo[/sup]')).toEqual('<sup>foo</sup>');
        expect(parser.toHTML('[font="sans-serif"]foo[/font]')).toEqual('<span style="font-family: sans-serif">foo</span>');
        expect(parser.toHTML('[size=13px]foo[/size]')).toEqual('<span style="font-size: 13px">foo</span>');
        expect(parser.toHTML('[color=rgb(0,0,0)]foo[/color]')).toEqual('<span style="color: #000000">foo</span>');
        expect(parser.toHTML('[list][li]foo[/li][li]bar[/li][/list]')).toEqual('<ul><li>foo</li><li>bar</li></ul>');
        expect(parser.toHTML('[ol][li]foo[/li][li]bar[/li][/ol]')).toEqual('<ol><li>foo</li><li>bar</li></ol>');
        expect(parser.toHTML('[img=300x300]foo[/img]')).toEqual('<img width="300" height="300" src="foo" />');
        expect(parser.toHTML('[url=bar]foo[/url]')).toEqual('<a href="bar">foo</a>');
        expect(parser.toHTML('[email=bar]foo[/email]')).toEqual('<a href="mailto:bar">foo</a>');
        expect(parser.toHTML('[quote]foo[/quote]')).toEqual('<blockquote>foo</blockquote>');
        expect(parser.toHTML('[quote=bar]foo[/quote]')).toEqual('<blockquote><cite>bar</cite>foo</blockquote>');
        expect(parser.toHTML('[code]foo[/code]')).toEqual('<code>foo</code>');
        expect(parser.toHTML('[left]foo[/left]')).toEqual('<div style="text-align: left">foo</div>');
        expect(parser.toHTML('[center]foo[/center]')).toEqual('<div style="text-align: center">foo</div>');
        expect(parser.toHTML('[right]foo[/right]')).toEqual('<div style="text-align: right">foo</div>');
        expect(parser.toHTML('[justify]foo[/justify]')).toEqual('<div style="text-align: justify">foo</div>');
        expect(parser.toHTML('[youtube]foo[/youtube]')).toEqual('<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/foo?wmode=opaque" data-youtube-id="foo" allowfullscreen></iframe>');
        expect(parser.toHTML('[rtl]foo[/rtl]')).toEqual('<div style="direction: rtl">foo</div>');
        expect(parser.toHTML('[ltr]foo[/ltr]')).toEqual('<div style="direction: ltr">foo</div>');
    });

    it('should convert new bbcode to html string', () => {
        const parser = new Parser();

        setHandler('lazy', {
            html: '<span>lazy: {0}</span>'
        });

        expect(parser.toHTML('[lazy]foo[/lazy]')).toEqual('<span>lazy: foo</span>');

        setHandler('lozy', {
            html: (token, attrs, content) => {
                return '<span data-test="'+attrs.default+'">'+content+'</span>'
            }
        })

        expect(parser.toHTML('[lozy=bar]foo[/lozy]')).toEqual('<span data-test="bar">foo</span>');
        expect(parser.toHTML('[lozy=bar test=123]foo[/lozy]')).toEqual('<span data-test="bar">foo</span>');
    })

    it('should cleanup bbcode string', () => {
        const parser = new Parser();

        expect(parser.cleanup('[b ]foo[/b]')).toEqual('[b]foo[/b]');
    });


})
