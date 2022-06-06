/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Handler } from './type';
import { QuoteType } from '../constants';
import {
    escapeEntities,
    escapeUriScheme,
    normaliseColor,
    stripQuotes,
} from './utils';
import { getObjectPathValue } from '../utils';
import { convertHTMLToBBCode } from '../parser/utils';

/* istanbul ignore next */
export const Handlers : Record<string, Handler> = {
    // START_COMMAND: Bold
    b: {
        conditions: [
            { tag: 'b' },
            { tag: 'strong' },
            {
                attribute: {
                    style: {
                        fontWeight: ['bold', 'bolder', '401', '700', '800', '900'],
                    },
                },
            },
        ],
        bbcode: '[b]{0}[/b]',
        html: '<strong>{0}</strong>',
    },
    // END_COMMAND

    // START_COMMAND: Italic
    i: {
        conditions: [
            { tag: 'i' },
            { tag: 'em' },
            {
                attribute: {
                    style: {
                        textDecoration: ['italic', 'oblique'],
                    },
                },
            },
        ],
        bbcode: '[i]{0}[/i]',
        html: '<em>{0}</em>',
    },
    // END_COMMAND

    // START_COMMAND: Underline
    u: {
        conditions: [
            { tag: 'u' },
            {
                attribute: {
                    style: {
                        textDecoration: ['underline'],
                    },
                },
            },
        ],
        bbcode: '[u]{0}[/u]',
        html: '<u>{0}</u>',
    },
    // END_COMMAND

    // START_COMMAND: Strikethrough
    s: {
        conditions: [
            { tag: 's' },
            { tag: 'strike' },
            {
                attribute: {
                    style: {
                        textDecoration: ['line-through'],
                    },
                },
            },
        ],
        bbcode: '[s]{0}[/s]',
        html: '<s>{0}</s>',
    },
    // END_COMMAND

    // START_COMMAND: Subscript
    sub: {
        conditions: [
            { tag: 'sub' },
        ],
        bbcode: '[sub]{0}[/sub]',
        html: '<sub>{0}</sub>',
    },
    // END_COMMAND

    // START_COMMAND: Superscript
    sup: {
        conditions: [
            { tag: 'sup' },
        ],
        bbcode: '[sup]{0}[/sup]',
        html: '<sup>{0}</sup>',
    },
    // END_COMMAND

    // START_COMMAND: Font
    font: {
        conditions: [
            {
                attribute: {
                    style: {
                        fontFamily: null,
                    },
                },
            },
        ],
        quoteType: QuoteType.never,
        bbcode(element, attr, content) {
            const font = getObjectPathValue(attr, 'style.fontFamily');

            return `[font=${stripQuotes(font)}]${content}[/font]`;
        },
        html: '<span style="font-family: {default}">{0}</span>',
    },
    // END_COMMAND

    // START_COMMAND: Size
    size: {
        conditions: [
            {
                attribute: {
                    style: {
                        fontSize: null,
                    },
                },
            },
        ],
        bbcode(token, attrs, content) {
            let fontSize : unknown = getObjectPathValue(attrs, 'size');

            if (!fontSize) {
                fontSize = getObjectPathValue(attrs, 'style.fontSize');
            }

            return `[size=${fontSize}]${content}[/size]`;
        },
        html: '<span style="font-size: {default}">{!0}</span>',
    },
    // END_COMMAND

    // START_COMMAND: Color
    color: {
        conditions: [
            {
                attribute: {
                    style: {
                        color: null,
                    },
                },
            },
        ],
        quoteType: QuoteType.never,
        bbcode(token, attrs, content) {
            let color = getObjectPathValue(attrs, 'color');

            if (!color) {
                color = getObjectPathValue(attrs, 'style.color');
            }

            return `[color=${normaliseColor(color)}]${
                content}[/color]`;
        },
        html(token, attrs, content) {
            return `<span style="color: ${escapeEntities(normaliseColor(attrs.default), true)}">${content}</span>`;
        },
    },
    // END_COMMAND

    // START_COMMAND: Lists
    ul: {
        conditions: [
            { tag: 'ul' },
        ],
        breakStart: true,
        isInline: false,
        skipLastLineBreak: true,
        bbcode: '[ul]{0}[/ul]',
        html: '<ul>{0}</ul>',
    },
    list: {
        breakStart: true,
        isInline: false,
        skipLastLineBreak: true,
        html: '<ul>{0}</ul>',
    },
    ol: {
        conditions: [
            { tag: 'ol' },
        ],
        breakStart: true,
        isInline: false,
        skipLastLineBreak: true,
        bbcode: '[ol]{0}[/ol]',
        html: '<ol>{0}</ol>',
    },
    li: {
        conditions: [
            { tag: 'li' },
        ],
        isInline: true,
        closedBy: ['/ul', '/ol', '/list', '*', 'li'],
        bbcode: '[li]{0}[/li]',
        html: '<li>{0}</li>',
    },
    '*': {
        isInline: false,
        closedBy: ['/ul', '/ol', '/list', '*', 'li'],
        html: '<li>{0}</li>',
    },
    // END_COMMAND

    // START_COMMAND: Table
    table: {
        conditions: [
            { tag: 'table' },
        ],
        isInline: false,
        isHtmlInline: true,
        skipLastLineBreak: true,
        bbcode: '[table]{0}[/table]',
        html: '<table>{0}</table>',
    },
    tr: {
        conditions: [
            { tag: 'tr' },
        ],
        isInline: false,
        skipLastLineBreak: true,
        bbcode: '[tr]{0}[/tr]',
        html: '<tr>{0}</tr>',
    },
    th: {
        conditions: [
            { tag: 'tr' },
        ],
        allowsEmpty: true,
        isInline: false,
        bbcode: '[th]{0}[/th]',
        html: '<th>{0}</th>',
    },
    td: {
        conditions: [
            { tag: 'td' },
        ],
        allowsEmpty: true,
        isInline: false,
        bbcode: '[td]{0}[/td]',
        html: '<td>{0}</td>',
    },
    // END_COMMAND

    // START_COMMAND: Emoticons
    // END_COMMAND

    // START_COMMAND: Horizontal Rule
    hr: {
        conditions: [
            { tag: 'hr' },
        ],
        allowsEmpty: true,
        isSelfClosing: true,
        isInline: false,
        bbcode: '[hr]{0}',
        html: '<hr />',
    },
    // END_COMMAND

    // START_COMMAND: Image
    img: {
        allowsEmpty: true,
        conditions: [
            { tag: 'img', attribute: { src: null } },
        ],
        allowedChildren: ['#'],
        quoteType: QuoteType.never,
        bbcode(token, attrs, content) {
            let attribs = '';

            const width = getObjectPathValue(attrs, 'width') || getObjectPathValue(attrs, 'style.width');
            const height = getObjectPathValue(attrs, 'height') || getObjectPathValue(attrs, 'style.height');

            // only add width and height if one is specified
            if (width && height) {
                attribs = `=${width}x${height}`;
            }

            return `[img${attribs}]${getObjectPathValue(attrs, 'src')}[/img]`;
        },
        html(token, attrs, content) {
            let width : string;
            let height : string;
            let match;
            let attribs = '';

            // handle [img width=340 height=240]url[/img]
            width = attrs.width;
            height = attrs.height;

            // handle [img=340x240]url[/img]
            if (attrs.default) {
                match = attrs.default.split(/x/i);

                // eslint-disable-next-line prefer-destructuring
                width = match[0];
                height = (match.length === 2 ? match[1] : match[0]);
            }

            if (typeof width !== undefined) {
                attribs += ` width="${escapeEntities(width, true)}"`;
            }

            if (typeof height !== undefined) {
                attribs += ` height="${escapeEntities(height, true)}"`;
            }

            return `<img${attribs} src="${escapeUriScheme(content)}" />`;
        },
    },
    // END_COMMAND

    // START_COMMAND: URL
    url: {
        allowsEmpty: true,
        conditions: [
            { tag: 'a', attribute: { href: null } },
        ],
        quoteType: QuoteType.never,
        bbcode(token, attrs, content) {
            const url = getObjectPathValue(attrs, 'href');

            // make sure this link is not an e-mail,
            // if it is return e-mail BBCode
            if (url.substring(0, 7) === 'mailto:') {
                return `[email=${url.substring(7)}]${content}[/email]`;
            }

            return `[url=${url}]${content}[/url]`;
        },
        html(token, attrs, content) {
            attrs.default = escapeEntities(attrs.default, true) || content;

            return `<a href="${escapeUriScheme(attrs.default)}">${content}</a>`;
        },
    },
    // END_COMMAND

    // START_COMMAND: E-mail
    email: {
        quoteType: QuoteType.never,
        bbcode: '[email]{0}[/email]',
        html(token, attrs, content) {
            return `<a href="mailto:${escapeEntities(attrs.default, true) || content}">${content}</a>`;
        },
    },
    // END_COMMAND

    // START_COMMAND: Quote
    quote: {
        conditions: [
            { tag: 'blockquote' },
        ],
        isInline: false,
        quoteType: QuoteType.never,
        bbcode(token, attrs, content) {
            const authorAttr = 'data-author';
            let author = getObjectPathValue(attrs, authorAttr);
            if (!author) {
                let index = -1;

                for (let i = 0; i < token.children.length; i++) {
                    if (token.children[i].name.toLowerCase() === 'cite') {
                        index = i;
                    }
                }

                if (index > -1) {
                    const citeChild = token.children[index].children[0];
                    if (citeChild) {
                        author = citeChild.value.replace(/(^\s+|\s+$)/g, '');

                        token.children.splice(index, 1);
                        content = convertHTMLToBBCode(token.children);
                    }
                }
            }

            return `[quote${(author ? `=${author}` : '')}]${content}[/quote]`;
        },
        html(token, attrs, content) {
            if (attrs.default) {
                content = `<cite>${escapeEntities(attrs.default)}</cite>${content}`;
            }

            return `<blockquote>${content}</blockquote>`;
        },
    },
    // END_COMMAND

    // START_COMMAND: Code
    code: {
        conditions: [
            { tag: 'code' },
        ],
        isInline: false,
        allowedChildren: ['#', '#newline'],
        bbcode: '[code]{0}[/code]',
        html: '<code>{0}</code>',
    },
    // END_COMMAND

    // START_COMMAND: Left
    left: {
        conditions: [
            {
                attribute: {
                    style: {
                        textAlign: [
                            'left',
                            '-webkit-left',
                            '-moz-left',
                            '-khtml-left',
                        ],
                    },
                },
            },
        ],
        isInline: false,
        allowsEmpty: true,
        bbcode: '[left]{0}[/left]',
        html: '<div style="text-align: left">{0}</div>',
    },
    // END_COMMAND

    // START_COMMAND: Centre
    center: {
        conditions: [
            {
                attribute: {
                    style: {
                        textAlign: [
                            'center',
                            '-webkit-center',
                            '-moz-center',
                            '-khtml-center',
                        ],
                    },
                },
            },
        ],
        isInline: false,
        allowsEmpty: true,
        bbcode: '[center]{0}[/center]',
        html: '<div style="text-align: center">{0}</div>',
    },
    // END_COMMAND

    // START_COMMAND: Right
    right: {
        conditions: [
            {
                attribute: {
                    style: {
                        textAlign: [
                            'right',
                            '-webkit-right',
                            '-moz-right',
                            '-khtml-right',
                        ],
                    },
                },
            },
        ],
        isInline: false,
        allowsEmpty: true,
        bbcode: '[right]{0}[/right]',
        html: '<div style="text-align: right">{0}</div>',
    },
    // END_COMMAND

    // START_COMMAND: Justify
    justify: {
        conditions: [
            {
                attribute: {
                    style: {
                        textAlign: [
                            'justify',
                            '-webkit-justify',
                            '-moz-justify',
                            '-khtml-justify',
                        ],
                    },
                },
            },
        ],
        isInline: false,
        allowsEmpty: true,
        bbcode: '[justify]{0}[/justify]',
        html: '<div style="text-align: justify">{0}</div>',
    },
    // END_COMMAND

    // START_COMMAND: YouTube
    youtube: {
        allowsEmpty: true,
        conditions: [
            { tag: 'iframe', attribute: { 'data-youtube-id': null } },
        ],
        bbcode(token, attrs, content) {
            const value = getObjectPathValue(attrs, 'data-youtube-id');

            return value ? `[youtube]${value}[/youtube]` : value;
        },
        html: '<iframe width="560" height="315" ' +
            'src="https://www.youtube-nocookie.com/embed/{0}?wmode=opaque" ' +
            'data-youtube-id="{0}" allowfullscreen></iframe>',
    },
    // END_COMMAND

    // START_COMMAND: Rtl
    rtl: {
        conditions: [
            {
                attribute: {
                    style: {
                        direction: ['rtl'],
                    },
                },
            },
        ],
        isInline: false,
        bbcode: '[rtl]{0}[/rtl]',
        html: '<div style="direction: rtl">{0}</div>',
    },
    // END_COMMAND

    // START_COMMAND: Ltr
    ltr: {
        conditions: [
            {
                attribute: {
                    style: {
                        direction: ['ltr'],
                    },
                },
            },
        ],
        isInline: false,
        bbcode: '[ltr]{0}[/ltr]',
        html: '<div style="direction: ltr">{0}</div>',
    },
    // END_COMMAND
};
