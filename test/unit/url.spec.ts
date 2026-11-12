import { describe, expect, it } from 'vitest';
/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

/* eslint-disable no-script-url -- script urls are the inputs under test */

import { Parser } from '../../src';
import { applyUrlPolicy } from '../../src/utils';

describe('src/utils/url.ts', () => {
    it.each([
        ['http://example.com/a', 'http://example.com/a'],
        ['HTTPS://example.com/a', 'HTTPS://example.com/a'],
        ['ftp://example.com/a', 'ftp://example.com/a'],
        ['sftp://example.com/a', 'sftp://example.com/a'],
        ['mailto:a@b.c', 'mailto:a@b.c'],
        ['tel:+123', 'tel:+123'],
        ['ssh://host', 'ssh://host'],
        ['spotify:track:1', 'spotify:track:1'],
        ['skype:user', 'skype:user'],
        ['teamspeak://host', 'teamspeak://host'],
        ['data:image/png;base64,iVBORw0KGgo=', 'data:image/png;base64,iVBORw0KGgo='],
        ['DATA:IMAGE/JPEG;base64,AA==', 'DATA:IMAGE/JPEG;base64,AA=='],
        ['data:image/pjpeg;base64,AA==', 'data:image/pjpeg;base64,AA=='],
        ['//example.com/a', '//example.com/a'],
        ['x//y', 'x//y'],
        ['page.php?time=10:30', 'page.php?time=10:30'],
        ['/path:x', '/path:x'],
        ['#anchor', '#anchor'],
        ['', ''],
        ['  http://example.com/a\n', 'http://example.com/a'],
        ['ht\ttp://exa\r\nmple.com', 'http://example.com'],
        ['java&#115;cript:alert(1)', 'java&#115;cript:alert(1)'],
        ['javascript&colon;alert(1)', 'javascript&colon;alert(1)'],
    ])('should allow %j', (input, expected) => {
        expect(applyUrlPolicy(input)).toEqual(expected);
    });

    it.each([
        'javascript:alert(1)',
        'JaVaScRiPt:alert(1)',
        ' javascript:alert(1)',
        '\u0001\u001fjavascript:alert(1)',
        '\u007fjavascript:alert(1)',
        'java\tscript:alert(1)',
        'java\nscript:alert(1)',
        'java\rscript:alert(1)',
        'javascript\t:alert(1)',
        'javascript://x%0aalert(1)',
        'vbscript:msgbox(1)',
        'data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==',
        'data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=',
        'data:image/png',
        'data:,x',
        'file:///etc/passwd',
        'x-unknown:foo',
    ])('should reject %j', (input) => {
        expect(applyUrlPolicy(input)).toBeUndefined();
    });

    it('should not depend on a window global', () => {
        const global = globalThis as Record<string, any>;

        global.window = {
            location: {
                protocol: 'https:',
                host: 'example.com',
                pathname: '/a/b',
            },
        };

        try {
            expect(applyUrlPolicy('javascript:alert(1)')).toBeUndefined();
            expect(new Parser().toHTML('[url=javascript:alert(1)]x[/url]'))
                .toEqual('[url=javascript:alert(1)]x[/url]');
        } finally {
            delete global.window;
        }
    });
});

describe('url policy in handler presets', () => {
    const parser = new Parser();

    it.each([
        ['[url=javascript:alert(1)]x[/url]', '[url=javascript:alert(1)]x[/url]'],
        ['[url=JaVaScRiPt:alert(1)]x[/url]', '[url=JaVaScRiPt:alert(1)]x[/url]'],
        ['[url= javascript:alert(1)]x[/url]', '[url= javascript:alert(1)]x[/url]'],
        ['[url=java\tscript:alert(1)]x[/url]', '[url=java\tscript:alert(1)]x[/url]'],
        ['[url=\u0001javascript:alert(1)]x[/url]', '[url=\u0001javascript:alert(1)]x[/url]'],
        ['[url=javascript://x%0aalert(1)]x[/url]', '[url=javascript://x%0aalert(1)]x[/url]'],
        ['[url=data:text/html;base64,PHNjcmlwdD4=]x[/url]', '[url=data:text/html;base64,PHNjcmlwdD4=]x[/url]'],
        ['[url]javascript:alert(1)[/url]', '[url]javascript:alert(1)[/url]'],
        ['[url]java\tscript:alert(1)[/url]', '[url]java\tscript:alert(1)[/url]'],
        ['[url=javascript:alert(1)][b]x[/b][/url]', '[url=javascript:alert(1)]<strong>x</strong>[/url]'],
        ['[url=javascript:alert(1)<b>"\'`]x[/url]', '[url=javascript:alert(1)&lt;b&gt;&#34;&#39;&#96;]x[/url]'],
        ['[img]javascript:alert(1)[/img]', '[img]javascript:alert(1)[/img]'],
        ['[img=10x10]javascript:alert(1)[/img]', '[img=10x10]javascript:alert(1)[/img]'],
        ['[img]data:image/svg+xml;base64,PHN2Zz4=[/img]', '[img]data:image/svg+xml;base64,PHN2Zz4=[/img]'],
    ])('should render rejected %j as literal text', (input, expected) => {
        const output = parser.toHTML(input);

        expect(output).toEqual(expected);
        expect(output).not.toMatch(/<a|<img|href=|src=/);
    });

    it.each([
        ['[url=bar]foo[/url]', '<a href="bar">foo</a>'],
        ['[url=https://example.com/a?b=1&c=2]x[/url]', '<a href="https://example.com/a?b=1&amp;c=2">x</a>'],
        ['[url]https://example.com/a?b=1&c=2[/url]', '<a href="https://example.com/a?b=1&amp;c=2">https://example.com/a?b=1&amp;c=2</a>'],
        ['[url]//example.com/a[/url]', '<a href="//example.com/a">//example.com/a</a>'],
        ['[url=page.php?time=10:30]x[/url]', '<a href="page.php?time=10:30">x</a>'],
        ['[url=mailto:a@b.c]x[/url]', '<a href="mailto:a@b.c">x</a>'],
        ['[img]https://example.com/a.png[/img]', '<img src="https://example.com/a.png" />'],
        ['[img]data:image/png;base64,iVBORw0KGgo=[/img]', '<img src="data:image/png;base64,iVBORw0KGgo=" />'],
        ['[email=a@b.c]x[/email]', '<a href="mailto:a@b.c">x</a>'],
        ['[email]a@b.c[/email]', '<a href="mailto:a@b.c">a@b.c</a>'],
        ['[email]javascript:alert(1)[/email]', '<a href="mailto:javascript:alert(1)">javascript:alert(1)</a>'],
        // entity-looking input is not decoded; the emitted & is escaped, so browsers see no scheme
        ['[url=javascript&colon;alert(1)]x[/url]', '<a href="javascript&amp;colon;alert(1)">x</a>'],
        ['[url]java&#115;cript:alert(1)[/url]', '<a href="java&amp;#115;cript:alert(1)">java&amp;#115;cript:alert(1)</a>'],
    ])('should render allowed %j', (input, expected) => {
        expect(parser.toHTML(input)).toEqual(expected);
    });

    it.each([
        ['[url=a"b]x[/url]', '<a href="a&#34;b">x</a>'],
        ['[url="a\\"b"]x[/url]', '<a href="a&#34;b">x</a>'],
        ['[url]a"b\'c<d>[/url]', '<a href="a&#34;b&#39;c&lt;d&gt;">a&#34;b&#39;c&lt;d&gt;</a>'],
        ['[img]a"onerror="alert(1)[/img]', '<img src="a&#34;onerror=&#34;alert(1)" />'],
        ['[email=a"b]x[/email]', '<a href="mailto:a&#34;b">x</a>'],
        [
            '[url][img]onmouseover=alert(1)//[/img][/url]',
            '<a href="<img src=&#34;onmouseover=alert(1)//&#34; />"><img src="onmouseover=alert(1)//" /></a>',
        ],
        [
            '[email][img]onmouseover=alert(1)//[/img][/email]',
            '<a href="mailto:<img src=&#34;onmouseover=alert(1)//&#34; />"><img src="onmouseover=alert(1)//" /></a>',
        ],
        [
            '[youtube][img]onload=alert(1)//[/img][/youtube]',
            '<iframe width="560" height="315" ' +
            'src="https://www.youtube-nocookie.com/embed/<img src=&#34;onload=alert(1)//&#34; />?wmode=opaque" ' +
            'data-youtube-id="<img src=&#34;onload=alert(1)//&#34; />" allowfullscreen></iframe>',
        ],
    ])('should keep %j inside the attribute', (input, expected) => {
        expect(parser.toHTML(input)).toEqual(expected);
    });

    it('should render youtube ids unchanged', () => {
        expect(parser.toHTML('[youtube]abc[/youtube]')).toEqual(
            '<iframe width="560" height="315" ' +
            'src="https://www.youtube-nocookie.com/embed/abc?wmode=opaque" ' +
            'data-youtube-id="abc" allowfullscreen></iframe>',
        );
    });
});

describe('src/handler/utils/color.ts', () => {
    it.each([
        ['[color=#abc]x[/color]', '<span style="color: #aabbcc">x</span>'],
        ['[color=#1?2]x[/color]', '<span style="color: #1?2">x</span>'],
        ['[color=#:;@]x[/color]', '<span style="color: #:;@">x</span>'],
    ])('should expand only hex shorthand colours for %j', (input, expected) => {
        expect(new Parser().toHTML(input)).toEqual(expected);
    });
});
