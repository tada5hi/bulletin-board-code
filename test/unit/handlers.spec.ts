import { describe, expect, it } from 'vitest';
/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Handlers, Parser } from '../../src';

type Position = 'before' | 'start' | 'end' | 'after';
type Breaks = [boolean, boolean, boolean, boolean];

const positions : Position[] = ['before', 'start', 'end', 'after'];

const optionsOff = {
    breakBeforeBlock: false,
    breakStartBlock: false,
    breakEndBlock: false,
    breakAfterBlock: false,
};

const optionsOn = {
    breakBeforeBlock: true,
    breakStartBlock: true,
    breakEndBlock: true,
    breakAfterBlock: true,
};

describe('src/handler/module.ts', () => {
    const handlers = new Handlers({
        block: {
            html: '<div>{0}</div>',
            isInline: false,
            breakAfter: false,
        },
        eager: { html: '<span>{0}</span>', breakBefore: true },
    });

    // id, isInline, isHtmlInline, breaks with options off, breaks with options on
    const table : [string, boolean, boolean, Breaks, Breaks][] = [
        ['b', true, true, [false, false, false, false], [false, false, false, false]],
        ['quote', false, false, [false, false, false, false], [true, true, true, true]],
        ['code', false, false, [false, false, false, false], [true, true, true, true]],
        ['ul', false, false, [false, true, false, false], [true, true, true, true]],
        ['li', true, true, [false, false, false, false], [false, false, false, false]],
        ['table', false, true, [false, false, false, false], [true, true, true, true]],
        ['unknown', true, true, [false, false, false, false], [false, false, false, false]],
        ['block', false, false, [false, false, false, false], [true, true, true, false]],
        ['eager', true, true, [true, false, false, false], [true, false, false, false]],
    ];

    it.each(table)('should resolve tag policy for %s', (id, isInline, isHtmlInline, off, on) => {
        expect(handlers.has(id)).toEqual(id !== 'unknown');
        expect(handlers.isInline(id)).toEqual(isInline);
        expect(handlers.isHtmlInline(id)).toEqual(isHtmlInline);

        expect(positions.map((position) => handlers.breaks(id, position, optionsOff))).toEqual(off);
        expect(positions.map((position) => handlers.breaks(id, position, optionsOn))).toEqual(on);
    });

    it('should resolve tag policy for a handler object', () => {
        const handler = handlers.get('table');

        expect(handler).toBeDefined();
        expect(handlers.isInline(handler!)).toEqual(false);
        expect(handlers.isHtmlInline(handler!)).toEqual(true);
        expect(handlers.breaks(handler!, 'after', optionsOn)).toEqual(true);
    });

    it('should not resolve handlers from the object prototype', () => {
        for (const id of ['constructor', '__proto__', 'toString', 'hasOwnProperty']) {
            expect(handlers.has(id)).toEqual(false);
            expect(handlers.get(id)).toBeUndefined();
            expect(handlers.isInline(id)).toEqual(true);
            expect(handlers.breaks(id, 'after', optionsOn)).toEqual(false);
        }
    });

    it('should store prototype-named handlers as ordinary entries', () => {
        const registry = new Handlers();
        const proto = { html: '<p>{0}</p>' };

        registry.set('__proto__', proto);
        registry.set('constructor', { html: '<q>{0}</q>' });

        expect(Object.getPrototypeOf(registry.get())).not.toBe(proto);
        expect(registry.has('__proto__')).toEqual(true);
        expect(registry.get('__proto__')?.html).toEqual('<p>{0}</p>');
        expect(registry.get('constructor')?.html).toEqual('<q>{0}</q>');
        expect(registry.has('html')).toEqual(false);
        expect(Object.keys(registry.get())).toContain('__proto__');

        const parser = new Parser();

        parser.setHandler('__proto__', proto);

        expect(parser.toHTML('[__proto__]x[/__proto__][b]y[/b]')).toEqual('<p>x</p><strong>y</strong>');
    });

    it('should convert prototype-named tags to literal text', () => {
        const parser = new Parser();

        expect(parser.toHTML('[constructor]x[/constructor]')).toEqual('[constructor]x[/constructor]');
        expect(parser.toHTML('[__proto__]x[/__proto__]')).toEqual('[__proto__]x[/__proto__]');
        expect(parser.toHTML('[toString]x[/toString]')).toEqual('[toString]x[/toString]');
    });

    it('should apply the block line-break options of the parser', () => {
        expect(new Parser().toHTML('[quote]a[/quote]\nb')).toEqual('<blockquote>a</blockquote>b');
        expect(new Parser({ breakAfterBlock: false }).toHTML('[quote]a[/quote]\nb'))
            .toEqual('<blockquote>a</blockquote><br />b');
    });
});
