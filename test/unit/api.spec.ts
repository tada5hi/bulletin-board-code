import {
    describe,
    expect,
    expectTypeOf,
    it,
} from 'vitest';
/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type {
    BBCodeParseOptions,
    ConverterContext,
    IParser,
} from '../../src';
import {
    Handlers,
    Parser,
    Token,
    TokenType,
    bbcodeToHTML,
    convertBBCodeToHTML,
    convertHTMLToBBCode,
    htmlToBBCode,
} from '../../src';

import type * as PublicAPI from '../../src';

// @ts-expect-error The interface is named IParser.
type RemovedParserInterface = PublicAPI.ParserInterface;
// @ts-expect-error The converters take plain arguments.
type RemovedBBCodeContext = PublicAPI.BBCodeToHTMLConvertContext;
// @ts-expect-error The converters take plain arguments.
type RemovedHTMLContext = PublicAPI.HTMLToBBCodeConvertContext;

describe('one-call functions', () => {
    it('should convert bbcode to html like Parser.toHTML', () => {
        expect(bbcodeToHTML('[b]a[/b]')).toEqual('<strong>a</strong>');
        expect(bbcodeToHTML('[x]a[/x]')).toEqual(new Parser().toHTML('[x]a[/x]'));
        expect(bbcodeToHTML('[x]a[/x]', { lazyTransformation: false })).toEqual('[x]a[/x]');
        expect(bbcodeToHTML('x\n[quote]a[/quote]', { breakBeforeBlock: true }))
            .toEqual('x<blockquote>a</blockquote>');
        expect(bbcodeToHTML('x\n[quote]a[/quote]', { breakBeforeBlock: true, preserveNewLines: true }))
            .toEqual('x<br /><blockquote>a</blockquote>');
        expect(bbcodeToHTML('[mark]a[/mark]', { handlers: { mark: { html: '<mark>{0}</mark>' } } })).toEqual('<mark>a</mark>');
    });

    it('should convert html to bbcode like Parser.toBBCode', () => {
        expect(htmlToBBCode('<strong>a</strong>')).toEqual('[b]a[/b]');
        expect(htmlToBBCode('<blockquote>a</blockquote>b')).toEqual('[quote]a[/quote]\nb');
        expect(htmlToBBCode('<blockquote>a</blockquote>b', { breakAfterBlock: false })).toEqual('[quote]a[/quote]b');
        expect(htmlToBBCode('<span>x</span>', { lazyTransformation: false })).toEqual('<span>x</span>');
    });
});

describe('per-call bbcode options', () => {
    const input = 'x\n[quote]a[/quote]';

    it('should keep newlines before blocks with preserveNewLines', () => {
        const parser = new Parser({ breakBeforeBlock: true });

        expect(parser.toHTML(input)).toEqual('x<blockquote>a</blockquote>');
        expect(parser.toHTML(input, {})).toEqual('x<blockquote>a</blockquote>');
        expect(parser.toHTML(input, { preserveNewLines: true })).toEqual('x<br /><blockquote>a</blockquote>');

        expect(parser.parseBBCode(input)).toHaveLength(2);
        expect(parser.parseBBCode(input, { preserveNewLines: true })).toHaveLength(3);

        expect(parser.cleanupBBCode(input)).toEqual('x\n[quote]a[/quote]\n');
        expect(parser.cleanupBBCode(input, { preserveNewLines: true })).toEqual('x\n\n[quote]a[/quote]\n');
    });

    it('should reject a boolean as second argument', () => {
        const parser = new Parser();
        const options : BBCodeParseOptions = { preserveNewLines: true };

        expect(parser.toHTML('a', options)).toEqual('a');

        // @ts-expect-error The per-call options are an object.
        expect(parser.toHTML('a', true)).toEqual('a');
        // @ts-expect-error The per-call options are an object.
        expect(parser.parseBBCode('a', true)).toHaveLength(1);
        // @ts-expect-error The per-call options are an object.
        expect(parser.cleanupBBCode('a', true)).toEqual('a');
        // @ts-expect-error The per-call options are an object.
        expect(bbcodeToHTML('a', true)).toEqual('a');
    });
});

describe('Parser surface', () => {
    it('should not provide the alias methods', () => {
        const parser = new Parser();

        expect('fromBBCode' in parser).toBe(false);
        expect('fromHTML' in parser).toBe(false);

        // @ts-expect-error Use toHTML.
        expect(parser.fromBBCode).toBeUndefined();
        // @ts-expect-error Use toBBCode.
        expect(parser.fromHTML).toBeUndefined();
    });

    it('should expose its handler registry read-only', () => {
        const parser = new Parser();

        expect(parser.handlers).toBeInstanceOf(Handlers);

        parser.setHandler('mark', { html: '<mark>{0}</mark>' });
        expect(parser.handlers.has('mark')).toBe(true);

        parser.unsetHandler('mark');
        expect(parser.handlers.has('mark')).toBe(false);

        const reassign = () => {
            // @ts-expect-error The registry is read-only.
            parser.handlers = new Handlers();
        };

        expect(reassign).toBeTypeOf('function');
    });

    it('should implement IParser with exactly its public members', () => {
        const parser : IParser = new Parser();

        expect(parser.toBBCode('<strong>a</strong>')).toEqual('[b]a[/b]');

        expectTypeOf<keyof IParser>().toEqualTypeOf<keyof Parser>();
        expectTypeOf<IParser['handlers']>().toEqualTypeOf<Handlers>();
    });
});

describe('low-level converters', () => {
    it('should take tokens, handlers and options', () => {
        const handlers = new Handlers();
        const unmatched = () => new Token(TokenType.OPEN, 'x', '[x]', {}, [
            new Token(TokenType.CONTENT, '#', 'a'),
        ], new Token(TokenType.CLOSE, 'x', '[/x]'));

        expect(convertBBCodeToHTML([unmatched()], handlers)).toEqual('[x]a[/x]');
        expect(convertBBCodeToHTML([unmatched()], handlers, { lazy: true })).toEqual('');

        const span = new Token(TokenType.OPEN, 'span', '<span>', { class: [] }, [
            new Token(TokenType.CONTENT, '#', 'a'),
        ], new Token(TokenType.CLOSE, 'span', '</span>'));

        expect(convertHTMLToBBCode([span], handlers)).toEqual('<span>a</span>');
        expect(convertHTMLToBBCode([span], handlers, { lazy: true })).toEqual('a');

        const contextArgument = () => {
            // @ts-expect-error The converters take plain arguments.
            convertBBCodeToHTML({ tokens: [], handlers });
        };

        expect(contextArgument).toBeTypeOf('function');
    });
});

describe('ConverterContext', () => {
    it('should provide one convert function with content semantics', () => {
        const seen : string[][] = [];
        const parser = new Parser({
            handlers: {
                box: {
                    conditions: [{ tag: 'section' }],
                    isInline: false,
                    html: (context) => {
                        seen.push(Object.keys(context).sort());

                        return `<section>${context.convert(context.token.children)}</section>`;
                    },
                    bbcode: (context) => `[box]${context.convert(context.token.children.slice(1))}[/box]`,
                },
            },
        });

        // convert adds the block line break like the content
        expect(parser.toHTML('[box][b]a[/b][/box]')).toEqual('<section><strong>a</strong><br /></section>');
        expect(seen[0]).toEqual(['attributes', 'content', 'convert', 'handlers', 'options', 'token']);

        // convert applies the handlers nested inside the current one
        expect(parser.toBBCode('<section style="color: red"><i>x</i>a</section>'))
            .toEqual('[box][color=red]a[/color][/box]');

        expectTypeOf<keyof ConverterContext>()
            .toEqualTypeOf<'token' | 'attributes' | 'content' | 'options' | 'handlers' | 'convert'>();
    });
});
