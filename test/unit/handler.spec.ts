import { describe, expect, it } from 'vitest';
/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Condition, TokenAttributes } from '../../src';
import {
    Handlers, 
    Parser, 
    Token, 
    TokenType,
} from '../../src';

function createToken(name: string, attrs: TokenAttributes = {}) {
    return new Token(TokenType.OPEN, name, `<${name}>`, attrs);
}

describe('src/handler/module.ts (match)', () => {
    it('should match html elements through Parser.toBBCode', () => {
        const parser = new Parser();

        expect(parser.toBBCode('<ul><li style="font-weight: bold">x</li></ul>'))
            .toEqual('[ul][li][b]x[/b][/li][/ul]');
        expect(parser.toBBCode('<span style="font-weight: bold; color: red">x</span>'))
            .toEqual('[b][color=red]x[/color][/b]');
        expect(parser.toBBCode('<span style="font-style: italic">x</span>')).toEqual('[i]x[/i]');
        expect(parser.toBBCode('<span style="font-style: oblique">x</span>')).toEqual('[i]x[/i]');
    });

    it('should keep existing round-trips', () => {
        const parser = new Parser();

        const inputs = [
            '[table][tr][th]a[/th][/tr][tr][td]b[/td][/tr][/table]',
            '[quote=bar]foo[/quote]',
            '[ul][li]foo[/li][li]bar[/li][/ul]',
            '[ol][li]foo[/li][li]bar[/li][/ol]',
        ];

        for (const input of inputs) {
            expect(parser.toBBCode(parser.toHTML(input))).toEqual(input);
        }
    });

    it('should return matches in stated order', () => {
        const handlers = new Handlers();

        const token = createToken('SPAN', { style: { fontWeight: 'bold', color: 'red' }, class: [] });

        expect(handlers.match(token)).toEqual([handlers.get('b'), handlers.get('color')]);

        const li = createToken('li', { style: { fontWeight: 'bold' }, class: [] });

        expect(handlers.match(li)).toEqual([handlers.get('li'), handlers.get('b')]);

        const strong = createToken('strong', { style: { fontWeight: 'bold' }, class: [] });

        expect(handlers.match(strong)).toEqual([handlers.get('b')]);

        expect(handlers.match(createToken('span', { class: [] }))).toEqual([]);
    });

    it('should prefer tag+attribute over tag-only conditions', () => {
        const handlers = new Handlers({
            plain: {
                html: '', 
                bbcode: '[plain]{0}[/plain]', 
                conditions: [{ tag: 'x-el' }], 
            },
            special: {
                html: '',
                bbcode: '[special]{0}[/special]',
                conditions: [{ tag: 'x-el', attribute: { 'data-special': null } }],
            },
        });

        expect(handlers.match(createToken('x-el', { 'data-special': '' })))
            .toEqual([handlers.get('special')]);
        expect(handlers.match(createToken('x-el'))).toEqual([handlers.get('plain')]);

        const parser = new Parser({ handlers: handlers.get() });

        expect(parser.toBBCode('<x-el data-special>x</x-el>')).toEqual('[special]x[/special]');
        expect(parser.toBBCode('<x-el>x</x-el>')).toEqual('[plain]x[/plain]');
    });

    it('should match class conditions', () => {
        const parser = new Parser({
            handlers: {
                one: {
                    html: '', 
                    bbcode: '[one]{0}[/one]', 
                    conditions: [{ attribute: { class: 'one' } }], 
                },
                any: {
                    html: '', 
                    bbcode: '[any]{0}[/any]', 
                    conditions: [{ attribute: { class: ['x', 'any'] } }], 
                },
            },
        });

        expect(parser.toBBCode('<span class="foo one">x</span>')).toEqual('[one]x[/one]');
        expect(parser.toBBCode('<span class="any">x</span>')).toEqual('[any]x[/any]');
        expect(parser.toBBCode('<span class="one any">x</span>')).toEqual('[one][any]x[/any][/one]');
    });

    it('should apply all matches nested and skip handlers without bbcode', () => {
        const parser = new Parser({
            handlers: {
                outer: {
                    html: '', 
                    bbcode: '[outer]{0}[/outer]', 
                    conditions: [{ tag: 'x-el' }], 
                },
                silent: { html: '', conditions: [{ attribute: { 'data-a': null } }] },
                inner: {
                    html: '',
                    bbcode: (context) => `[inner=${context.attributes['data-b']}]${context.content}[/inner]`,
                    conditions: [{ attribute: { 'data-b': null } }],
                },
            },
        });

        expect(parser.toBBCode('<x-el data-a data-b="v">x</x-el>')).toEqual('[outer][inner=v]x[/inner][/outer]');
    });

    // condition, token attributes, expected
    const matrix : [Condition['attribute'], TokenAttributes, boolean][] = [
        [{ 'data-a': null }, { 'data-a': '' }, true],
        [{ 'data-a': null }, {}, false],
        [{ class: null }, { class: ['foo'] }, true],
        [{ class: null }, { class: [] }, false],
        [{ 'data-a': 'x' }, { 'data-a': ' x ' }, true],
        [{ 'data-a': 'x' }, { 'data-a': 'y' }, false],
        [{ 'data-a': 5 }, { 'data-a': '5' }, true],
        [{ 'data-a': ['x', 'y'] }, { 'data-a': 'y' }, true],
        [{ 'data-a': ['x', 'y'] }, { 'data-a': 'z' }, false],
        [{ 'data-a': ['x'] }, {}, false],
        [{ class: 'foo' }, { class: ['bar', 'foo'] }, true],
        [{ class: 'foo' }, { class: ['bar'] }, false],
        [{ class: ['foo', 'baz'] }, { class: ['baz'] }, true],
        [{ class: ['foo', 'baz'] }, { class: [] }, false],
        [{ style: { fontWeight: null } }, { style: { fontWeight: 'bold' } }, true],
        [{ style: { fontWeight: null } }, { style: {} }, false],
        [{ style: { fontWeight: null } }, {}, false],
        [{ style: { fontWeight: ['bold'], color: 'red' } }, { style: { fontWeight: 'bold', color: 'red' } }, true],
        [{ style: { fontWeight: ['bold'], color: 'red' } }, { style: { fontWeight: 'bold' } }, false],
        [{ 'data-a': 'x', 'data-b': null }, { 'data-a': 'x' }, false],
        [{ 'data-a': 'x', 'data-b': null }, { 'data-a': 'x', 'data-b': '1' }, true],
    ];

    it.each(matrix)('should compare condition %j with attributes %j -> %s', (attribute, attrs, expected) => {
        const handlers = new Handlers({
            probe: { html: '', conditions: [{ attribute }] },
            tagged: { html: '', conditions: [{ tag: 'X-Probe', attribute }] },
        });

        const result = handlers.match(createToken('x-probe', attrs));

        expect(result.includes(handlers.get('tagged')!)).toEqual(expected);
        expect(result.includes(handlers.get('probe')!)).toEqual(expected);
    });

    it('should never match conditions without tag and attribute', () => {
        const handlers = new Handlers({ probe: { html: '', conditions: [{}] } });

        expect(handlers.match(createToken('x-probe'))).toEqual([]);
    });

    it('should never match attribute conditions without keys', () => {
        const handlers = new Handlers({
            plain: { html: '', conditions: [{ tag: 'x-probe' }] },
            empty: { html: '', conditions: [{ tag: 'x-probe', attribute: {} }] },
            loose: { html: '', conditions: [{ attribute: {} }] },
        });

        expect(handlers.match(createToken('x-probe', { 'data-a': '1' }))).toEqual([handlers.get('plain')]);
    });
});
