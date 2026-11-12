<p align="center"><img src=".github/assets/logo.svg" width="144" height="144" alt="Bulletin Board Code logo" /></p>
<h1 align="center">Bulletin Board Code</h1>
<p align="center"><strong>Bidirectional convert between BBCode and HTML.</strong></p>
<p align="center">Convert stored forum markup to HTML and edited HTML back to BBCode with one configurable handler registry.</p>
<p align="center">
  <a href="https://www.npmjs.com/package/bulletin-board-code"><img src="https://img.shields.io/npm/v/bulletin-board-code" alt="npm version" /></a>
  <a href="https://github.com/tada5hi/bulletin-board-code/actions"><img src="https://img.shields.io/github/actions/workflow/status/tada5hi/bulletin-board-code/main.yml" alt="CI status" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/npm/l/bulletin-board-code" alt="License" /></a>
</p>
<p align="center"><a href="#installation">Installation</a> · <a href="#usage">Usage</a> · <a href="#api">API</a> · <a href="#notes">Notes</a></p>

---

## Why Bulletin Board Code?

Convert stored forum markup to HTML and edited HTML back to BBCode with one configurable handler registry.

| Concern | Without it | With it |
|---|---|---|
| Two formats | Maintain separate tag replacements | Use Parser.toHTML and Parser.toBBCode |
| Nested markup | Repair nesting with string replacements | Tokenize, normalize and convert a token tree |
| Custom tags | Change both converters separately | Register both representations in one Handler |

Parser tokenizes BBCode, normalizes nesting and empty tags, then renders each supported token through its HTML handler.

<img src=".github/assets/mechanism.svg" width="960" alt="Parser tokenizes BBCode, normalizes nesting and empty tags, then renders each supported token through its HTML handler." />

**Table of Contents**

- [Why Bulletin Board Code?](#why-bulletin-board-code)
- [Installation](#installation)
- [Features](#features)
- [Usage](#usage)
  - [BBCode to HTML](#bbcode-to-html)
  - [HTML to BBCode](#html-to-bbcode)
- [Handlers](#handlers)
  - [Set](#set)
  - [Unset](#unset)
- [Options](#options)
  - [ParserOptions](#parseroptions)
- [API](#api)
- [Notes](#notes)
- [Contributing](#contributing)
- [License](#license)

## Installation

```bash
npm install bulletin-board-code
```

The package manifest does not declare a Node runtime minimum. ESM, CommonJS and TypeScript declarations are included. Import the documented package entrypoint rather than undeclared `dist/` paths.

## Features

- Convert BBCode to HTML and HTML to BBCode through the same handler registry.
- Parse nested BBCode into a token tree.
- Repair invalid nesting and children with configurable automatic repair options.
- Add, replace and remove custom tag handlers.

The [predefined handlers](src/handler/constants.ts) show supported tags and matching conditions; [the tests](test) demonstrate concrete conversions.

## Usage

```typescript
import { Parser } from 'bulletin-board-code';

const parser = new Parser();
console.log(parser.toHTML('[b]Hello[/b]')); // <strong>Hello</strong>
console.log(parser.toBBCode('<strong>Hello</strong>')); // [b]Hello[/b]
```

### BBCode to HTML

```typescript
import { Parser } from 'bulletin-board-code';

const parser = new Parser();
console.log(parser.toHTML('[b]foo[/b]')); // <strong>foo</strong>
```

### HTML to BBCode

```typescript
import { Parser } from 'bulletin-board-code';

const parser = new Parser();
console.log(parser.toBBCode('<strong>foo</strong>')); // [b]foo[/b]
```

## Handlers

```typescript
import { Parser } from 'bulletin-board-code';

const parser = new Parser({
    handlers: {
        mark: {
            html: '<mark>{0}</mark>',
            bbcode: '[mark]{0}[/mark]',
            conditions: [{ tag: 'mark' }],
        },
    },
});
console.log(parser.toHTML('[mark]Read this[/mark]')); // <mark>Read this</mark>
```

`setHandler(name, handler)` and `setHandler(record)` add or replace handlers. `unsetHandler(name)` also accepts an array. Each registry starts with `HandlerPreset`.

### Set

A handler specifies both output representations and the HTML conditions used to recognize a tag. Use a template with `{0}` for content, or a function receiving the token, attributes, converted content, options, handler registry and a `convert(tokens)` function for converting child tokens yourself. Custom handlers are added to the presets; registering an existing name replaces it.

This handler matches a `span` with a `lazy` attribute. A `null` attribute condition checks presence without constraining its value.

```typescript
import { Parser } from 'bulletin-board-code';

const parser = new Parser();
parser.setHandler('lazy', {
    conditions: [{ tag: 'span', attribute: { lazy: null } }],
    bbcode: '[lazy]{0}[/lazy]',
    html: '<span lazy="true">{0}</span>',
});
console.log(parser.toHTML('[lazy]foo[/lazy]')); // <span lazy="true">foo</span>
console.log(parser.toBBCode('<span lazy="true">foo</span>')); // [lazy]foo[/lazy]
```

An HTML element can match several handlers. The tag match is applied outermost and every attribute-only match is nested inside it, so `<strong style="font-style: italic">x</strong>` becomes `[b][i]x[/i][/b]`. A `class` condition accepts a string or an array of class names.

### Unset

`unsetHandler` is a parser method, not a standalone package export. When retaining unsupported markup is important, construct the parser with `lazyTransformation: false`. BBCode tags without a registered handler stay literal text. In the default lazy mode, HTML to BBCode keeps the content of unmatched elements and drops only the element itself; script-like elements such as `script` and `style` are dropped with their content.

```typescript
import { Parser } from 'bulletin-board-code';

const parser = new Parser({ lazyTransformation: false });
parser.unsetHandler('h1');
parser.unsetHandler(['h2', 'h3']);
console.log(parser.toHTML('[h1]foo[/h1]')); // [h1]foo[/h1]
console.log(parser.toBBCode('<h1>foo</h1>')); // <h1>foo</h1>
```

## Options

### ParserOptions

Pass a partial `ParserOptions` to `new Parser(options)`. The [type declaration](src/parser/types.ts) defines the complete input contract; all options and defaults are listed below.

| Option | Default | Purpose |
|---|---|---|
| `handlers` | `{}` | Add or replace preset handlers |
| `breakBeforeBlock` | `false` | Newline before block tags |
| `breakStartBlock` | `false` | Newline after a block opening tag |
| `breakEndBlock` | `false` | Newline before a block closing tag |
| `breakAfterBlock` | `true` | Newline after block tags |
| `removeEmptyTags` | `true` | Remove empty tags unless their handler allows them |
| `fixInvalidNesting` | `true` | Repair block elements nested inside inline elements |
| `fixInvalidChildren` | `true` | Repair children not permitted by their parent handler |
| `quoteType` | `QuoteType.auto` | Quote BBCode attributes when needed |
| `lazyTransformation` | `true` | Drop unmatched tags during conversion instead of reconstructing their markup |

The `break*Block` options apply to block level handlers; a handler's own `breakBefore`, `breakStart`, `breakEnd` or `breakAfter` flag takes precedence. When an option is on, parsing treats one newline at that position as formatting and drops it, and `cleanupBBCode()` writes it. With the defaults, `[quote]foo[/quote]\nbar` renders as `<blockquote>foo</blockquote>bar`.

`parseBBCode()` and `parseHTML()` expose tokens; `cleanupBBCode()` normalizes BBCode without converting to HTML. `fromBBCode()` aliases `toHTML()` and `fromHTML()` aliases `toBBCode()`.

## API

All names below are exported from `bulletin-board-code`. Types have no runtime value.

| Export | Kind | Purpose |
|---|---|---|
| `QuoteType` | enum | Attribute quoting modes |
| `HandlerPreset` | constant | Built-in tag definitions |
| `Attribute` | type | Attribute match condition (`style`, `class`, any attribute) |
| `Condition` | type | HTML match condition of a handler |
| `ConverterContext` | type | Argument of handler render functions, including `convert(tokens)` |
| `ConverterOptions` | type | Converter settings (`lazy`) |
| `Handler` | type | Tag definition |
| `Handlers` | class | Handler registry: `get`, `set`, `unset`, `has`, `isInline`, `isHtmlInline`, `breaks`, `match` |
| `convertBBCodeToHTML` | function | Render BBCode tokens as HTML; leaves the input tokens unchanged |
| `convertHTMLToBBCode` | function | Render HTML tokens as BBCode; leaves the input tokens unchanged |
| `BBCodeToHTMLConvertContext` | type | Argument of `convertBBCodeToHTML` |
| `HTMLToBBCodeConvertContext` | type | Argument of `convertHTMLToBBCode` |
| `ParserDefaultOptions` | constant | Default parser settings |
| `Parser` | class | Parse, normalize and convert BBCode or HTML |
| `ParserInterface` | interface | Public methods of `Parser` |
| `ParserOptions` | type | Complete parser settings |
| `ParserOptionsInput` | type | Partial parser settings accepted by `new Parser()` |
| `TokenType` | enum | Token categories |
| `Token` | class | Token tree node |
| `tokenizeBBCode` | function | Tokenize BBCode with a handler registry |
| `tokenizeHTML` | function | Tokenize HTML with node-html-parser |
| `TokenAttributes` | type | Token attribute record |

`Handlers.has(name)` checks registration. `isInline(handler)` and `isHtmlInline(handler)` report the BBCode and HTML block level; unknown tags are inline. `breaks(handler, position, options)` tells whether a newline belongs `before`, at the `start`, at the `end` or `after` a tag. `match(token)` returns the handlers for an HTML token, tag match first.

## Notes

- **Conversion is not a lossless round trip.** Tags, nesting, whitespace and empty elements can be normalized. BBCode tags without a handler stay literal text. With `lazyTransformation` true, unmatched HTML elements are dropped while their content is kept: `<br>` becomes a newline, and block elements such as `div` or `p` separate their content from what follows with a newline, as do block elements whose handlers matched only through attribute conditions such as `style`. `script`, `style`, `noscript`, `template`, `title` and `head` elements are dropped together with their content. HTML to BBCode emits text decoded, not HTML-escaped. Set `lazyTransformation` to false to reconstruct unmatched markup.
- **Rejected URLs render as text.** `[url]`, `[img]` and `[email]` accept URLs without a scheme and the schemes `http`, `https`, `ftp`, `sftp`, `mailto`, `tel`, `ssh`, `spotify`, `skype`, `teamspeak`, plus PNG, BMP, GIF and JPEG `data:image/` URLs; any other scheme renders the whole tag as literal, escaped text. `[size]`, `[font]` and `[color]` values that are not a single plain CSS value (empty, or containing `;`, `:`, `{`, `}`, `\`, `/`, `url(` or `expression(`) render the whole tag as literal, escaped text as well.
- **Conversion is not an HTML security boundary.** Review the generated HTML and custom handlers under your application's sanitization policy before rendering untrusted input.

## Contributing

Use the verified development commands in [the agent guide](AGENTS.md).

## License

Made with 💚

Published under the [MIT License](LICENSE).
