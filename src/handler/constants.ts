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
    getAttribute,
    getCss,
    getHeight,
    getWidth,
    hasSelector,
    normaliseColor,
    setAttribute,
    stripQuotes,
} from './utils';

/* istanbul ignore next */
export const Handlers : Record<string, Handler> = {
    // START_COMMAND: Bold
    b: {
        tags: {
            b: null,
            strong: null,
        },
        styles: {
            // 401 is for FF 3.5
            'font-weight': ['bold', 'bolder', '401', '700', '800', '900'],
        },
        format: '[b]{0}[/b]',
        html: '<strong>{0}</strong>',
    },
    // END_COMMAND

    // START_COMMAND: Italic
    i: {
        tags: {
            i: null,
            em: null,
        },
        styles: {
            'font-style': ['italic', 'oblique'],
        },
        format: '[i]{0}[/i]',
        html: '<em>{0}</em>',
    },
    // END_COMMAND

    // START_COMMAND: Underline
    u: {
        tags: {
            u: null,
        },
        styles: {
            'text-decoration': ['underline'],
        },
        format: '[u]{0}[/u]',
        html: '<u>{0}</u>',
    },
    // END_COMMAND

    // START_COMMAND: Strikethrough
    s: {
        tags: {
            s: null,
            strike: null,
        },
        styles: {
            'text-decoration': ['line-through'],
        },
        format: '[s]{0}[/s]',
        html: '<s>{0}</s>',
    },
    // END_COMMAND

    // START_COMMAND: Subscript
    sub: {
        tags: {
            sub: null,
        },
        format: '[sub]{0}[/sub]',
        html: '<sub>{0}</sub>',
    },
    // END_COMMAND

    // START_COMMAND: Superscript
    sup: {
        tags: {
            sup: null,
        },
        format: '[sup]{0}[/sup]',
        html: '<sup>{0}</sup>',
    },
    // END_COMMAND

    // START_COMMAND: Font
    font: {
        tags: {
            font: {
                face: null,
            },
        },
        styles: {
            'font-family': null,
        },
        quoteType: QuoteType.never,
        format(element, content) {
            let font = getAttribute(element, 'face');

            if (!hasSelector(element, 'font') || !font) {
                font = getCss(element, 'fontFamily');
            }

            return `[font=${stripQuotes(font)}]${content}[/font]`;
        },
        html: '<span style="font-family: {default}">{0}</span>',
    },
    // END_COMMAND

    // START_COMMAND: Size
    size: {
        tags: {
            font: {
                size: null,
            },
        },
        styles: {
            'font-size': null,
        },
        format(element, content) {
            let fontSize : unknown = getAttribute(element, 'size');
            let size = 2;

            if (!fontSize) {
                fontSize = getCss(element, 'fontSize');
            }

            // Most browsers return px value but IE returns 1-7
            if (`${fontSize}`.indexOf('px') > -1) {
                // convert size to an int
                fontSize = Number(`${fontSize}`.replace('px', ''));

                if (fontSize < 12) {
                    size = 1;
                }
                if (fontSize > 15) {
                    size = 3;
                }
                if (fontSize > 17) {
                    size = 4;
                }
                if (fontSize > 23) {
                    size = 5;
                }
                if (fontSize > 31) {
                    size = 6;
                }
                if (fontSize > 47) {
                    size = 7;
                }
            } else {
                size = Number(fontSize);
            }

            return `[size=${size}]${content}[/size]`;
        },
        html: '<span style="font-size: {default}">{!0}</span>',
    },
    // END_COMMAND

    // START_COMMAND: Color
    color: {
        tags: {
            font: {
                color: null,
            },
        },
        styles: {
            color: null,
        },
        quoteType: QuoteType.never,
        format(elm, content) {
            let color = getAttribute(elm, 'color');

            if (!hasSelector(elm, 'font') || !color) {
                color = elm.style.color || getCss(elm, 'color');
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
        tags: {
            ul: null,
        },
        breakStart: true,
        isInline: false,
        skipLastLineBreak: true,
        format: '[ul]{0}[/ul]',
        html: '<ul>{0}</ul>',
    },
    list: {
        breakStart: true,
        isInline: false,
        skipLastLineBreak: true,
        html: '<ul>{0}</ul>',
    },
    ol: {
        tags: {
            ol: null,
        },
        breakStart: true,
        isInline: false,
        skipLastLineBreak: true,
        format: '[ol]{0}[/ol]',
        html: '<ol>{0}</ol>',
    },
    li: {
        tags: {
            li: null,
        },
        isInline: true,
        closedBy: ['/ul', '/ol', '/list', '*', 'li'],
        format: '[li]{0}[/li]',
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
        tags: {
            table: null,
        },
        isInline: false,
        isHtmlInline: true,
        skipLastLineBreak: true,
        format: '[table]{0}[/table]',
        html: '<table>{0}</table>',
    },
    tr: {
        tags: {
            tr: null,
        },
        isInline: false,
        skipLastLineBreak: true,
        format: '[tr]{0}[/tr]',
        html: '<tr>{0}</tr>',
    },
    th: {
        tags: {
            th: null,
        },
        allowsEmpty: true,
        isInline: false,
        format: '[th]{0}[/th]',
        html: '<th>{0}</th>',
    },
    td: {
        tags: {
            td: null,
        },
        allowsEmpty: true,
        isInline: false,
        format: '[td]{0}[/td]',
        html: '<td>{0}</td>',
    },
    // END_COMMAND

    // START_COMMAND: Emoticons
    // END_COMMAND

    // START_COMMAND: Horizontal Rule
    hr: {
        tags: {
            hr: null,
        },
        allowsEmpty: true,
        isSelfClosing: true,
        isInline: false,
        format: '[hr]{0}',
        html: '<hr />',
    },
    // END_COMMAND

    // START_COMMAND: Image
    img: {
        allowsEmpty: true,
        tags: {
            img: {
                src: null,
            },
        },
        allowedChildren: ['#'],
        quoteType: QuoteType.never,
        format(element, content) {
            let attribs = '';
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            const style = (name: string) => (element.style ? element.style[name] : null);

            const width = getAttribute(element, 'width') || style('width');
            const height = getAttribute(element, 'height') || style('height');

            // only add width and height if one is specified
            if (width && height) {
                attribs = `=${getWidth(element)}x${getHeight(element)}`;
            }

            return `[img${attribs}]${getAttribute(element, 'src')}[/img]`;
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
        tags: {
            a: {
                href: null,
            },
        },
        quoteType: QuoteType.never,
        format(element, content) {
            const url = getAttribute(element, 'href');

            // make sure this link is not an e-mail,
            // if it is return e-mail BBCode
            if (url.substring(0, 7) === 'mailto:') {
                return `[email="${url.substring(7)}"]${content}[/email]`;
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
        format: '[email]{0}[/email]',
        html(token, attrs, content) {
            return `<a href="mailto:${escapeEntities(attrs.default, true) || content}">${content}</a>`;
        },
    },
    // END_COMMAND

    // START_COMMAND: Quote
    quote: {
        tags: {
            blockquote: null,
        },
        isInline: false,
        quoteType: QuoteType.never,
        format(element, content) {
            const authorAttr = 'data-author';
            let author = '';
            let cite;
            const { children } = element;

            for (let i = 0; !cite && i < children.length; i++) {
                if (hasSelector(children[i], 'cite')) {
                    cite = children[i];
                }
            }

            if (cite || getAttribute(element, authorAttr)) {
                if (cite && cite.textContent) {
                    author = cite.textContent;
                } else {
                    author = getAttribute(element, authorAttr);
                }

                setAttribute(element, authorAttr, author);

                if (cite) {
                    element.removeChild(cite);
                }

                content = this.elementToBbcode(element);
                author = `=${author.replace(/(^\s+|\s+$)/g, '')}`;

                if (cite) {
                    element.insertBefore(cite, element.firstChild);
                }
            }

            return `[quote${author}]${content}[/quote]`;
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
        tags: {
            code: null,
        },
        isInline: false,
        allowedChildren: ['#', '#newline'],
        format: '[code]{0}[/code]',
        html: '<code>{0}</code>',
    },
    // END_COMMAND

    // START_COMMAND: Left
    left: {
        styles: {
            'text-align': [
                'left',
                '-webkit-left',
                '-moz-left',
                '-khtml-left',
            ],
        },
        isInline: false,
        allowsEmpty: true,
        format: '[left]{0}[/left]',
        html: '<div style="text-align: left">{0}</div>',
    },
    // END_COMMAND

    // START_COMMAND: Centre
    center: {
        styles: {
            'text-align': [
                'center',
                '-webkit-center',
                '-moz-center',
                '-khtml-center',
            ],
        },
        isInline: false,
        allowsEmpty: true,
        format: '[center]{0}[/center]',
        html: '<div style="text-align: center">{0}</div>',
    },
    // END_COMMAND

    // START_COMMAND: Right
    right: {
        styles: {
            'text-align': [
                'right',
                '-webkit-right',
                '-moz-right',
                '-khtml-right',
            ],
        },
        isInline: false,
        allowsEmpty: true,
        format: '[right]{0}[/right]',
        html: '<div style="text-align: right">{0}</div>',
    },
    // END_COMMAND

    // START_COMMAND: Justify
    justify: {
        styles: {
            'text-align': [
                'justify',
                '-webkit-justify',
                '-moz-justify',
                '-khtml-justify',
            ],
        },
        isInline: false,
        allowsEmpty: true,
        format: '[justify]{0}[/justify]',
        html: '<div style="text-align: justify">{0}</div>',
    },
    // END_COMMAND

    // START_COMMAND: YouTube
    youtube: {
        allowsEmpty: true,
        tags: {
            iframe: {
                'data-youtube-id': null,
            },
        },
        format(element, content) {
            const value = getAttribute(element, 'data-youtube-id');

            return value ? `[youtube]${value}[/youtube]` : value;
        },
        html: '<iframe width="560" height="315" ' +
            'src="https://www.youtube-nocookie.com/embed/{0}?wmode=opaque" ' +
            'data-youtube-id="{0}" allowfullscreen></iframe>',
    },
    // END_COMMAND

    // START_COMMAND: Rtl
    rtl: {
        styles: {
            direction: ['rtl'],
        },
        isInline: false,
        format: '[rtl]{0}[/rtl]',
        html: '<div style="direction: rtl">{0}</div>',
    },
    // END_COMMAND

    // START_COMMAND: Ltr
    ltr: {
        styles: {
            direction: ['ltr'],
        },
        isInline: false,
        format: '[ltr]{0}[/ltr]',
        html: '<div style="direction: ltr">{0}</div>',
    },
    // END_COMMAND
};
