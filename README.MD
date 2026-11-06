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

A handler specifies both output representations and the HTML conditions used to recognize a tag. Use a template with `{0}` for content, or a function receiving the token, attributes, content, options and handler registry. Custom handlers are added to the presets; registering an existing name replaces it.

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

### Unset

`unsetHandler` is a parser method, not a standalone package export. When retaining unsupported markup is important, construct the parser with `lazyTransformation: false`; the default lazy mode omits unmatched opening-token branches.

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
| `breakBeforeBlock` | `false` | Add a newline before block elements |
| `breakStartBlock` | `false` | Add a newline after a block opening tag |
| `breakEndBlock` | `false` | Add a newline before a block closing tag |
| `breakAfterBlock` | `true` | Add a break after block elements |
| `removeEmptyTags` | `true` | Remove empty tags unless their handler allows them |
| `fixInvalidNesting` | `true` | Repair block elements nested inside inline elements |
| `fixInvalidChildren` | `true` | Repair children not permitted by their parent handler |
| `quoteType` | `QuoteType.auto` | Quote BBCode attributes when needed |
| `lazyTransformation` | `true` | Omit unmatched opening-token branches during conversion |

`parseBBCode()` and `parseHTML()` expose tokens; `cleanupBBCode()` normalizes BBCode without converting to HTML. `fromBBCode()` aliases `toHTML()` and `fromHTML()` aliases `toBBCode()`.

## API

All names below are exported from `bulletin-board-code`. Types have no runtime value.

| Export | Kind | Purpose |
|---|---|---|
| `QuoteType` | enum | Attribute quoting modes |
| `HandlerPreset` | constant | Built-in tag definitions |
| `Attribute` | type | Type contract for attribute |
| `Condition` | type | Type contract for condition |
| `ConverterContext` | type | Type contract for converter context |
| `Handler` | type | Type contract for handler |
| `Handlers` | class | Manage the preset and custom tag registry |
| `convertBBCodeToHTML` | function | Render BBCode tokens as HTML; consumes the input array |
| `convertHTMLToBBCode` | function | Render HTML tokens as BBCode; consumes the input array |
| `ConverterOptions` | type | Type contract for converter options |
| `BBCodeToHTMLConvertContext` | type | Type contract for bbcode to htmlconvert context |
| `HTMLToBBCodeConvertContext` | type | Type contract for htmlto bbcode convert context |
| `ParserDefaultOptions` | constant | Default parser settings |
| `Parser` | class | Parse, normalize and convert BBCode or HTML |
| `ParserInterface` | interface | Type contract for parser interface |
| `ParserOptions` | type | Type contract for parser options |
| `ParserOptionsInput` | type | Type contract for parser options input |
| `BBCodeCleanupContext` | type | Type contract for bbcode cleanup context |
| `TokenType` | enum | Token categories |
| `Token` | class | Mutable token tree node |
| `tokenizeAttrs` | function | Parse BBCode attribute text |
| `tokenizeTag` | function | Parse a BBCode opening or closing tag |
| `tokenizeBBCode` | function | Tokenize BBCode with a handler registry |
| `tokenizeHTML` | function | Tokenize HTML with node-html-parser |
| `TokenAttributes` | type | Type contract for token attributes |
| `TokenParseContext` | type | Type contract for token parse context |
| `ChildAllowedCheckContext` | type | Type contract for child allowed check context |
| `NestingTokenFixContext` | type | Type contract for nesting token fix context |
| `TokenNewLinesNormaliseContext` | type | Type contract for token new lines normalise context |
| `removeEmptyTokens` | function | Remove empty tokens using handler rules |
| `hasToken` | function | Find a matching token name and category |
| `fixNestingTokens` | function | Repair invalid nesting in a token tree |
| `normalizeTokenNewLines` | function | Normalize token line breaks |
| `isChildAllowed` | function | Check handler parent/child constraints |
| `parseTokens` | function | Build nested tokens from a token sequence |

## Notes

- **Conversion is not a lossless round trip.** Tags, nesting, whitespace and empty elements can be normalized. Unsupported opening tags and their contents are omitted by the converters when `lazyTransformation` is true; set it to false to reconstruct unmatched markup.
- **Conversion is not an HTML security boundary.** Review the generated HTML and custom handlers under your application's sanitization policy before rendering untrusted input.
- **Low-level converters consume arrays.** `convertBBCodeToHTML` and `convertHTMLToBBCode` shift tokens from the supplied arrays; pass copies if you need the arrays again.

## Contributing

Use the verified development commands in [the agent guide](AGENTS.md).

## License

Made with 💚

Published under the [MIT License](LICENSE).
