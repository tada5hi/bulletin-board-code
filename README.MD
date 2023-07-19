# Bulletin Board Code ⚗️

[![npm version](https://badge.fury.io/js/bulletin-board-code.svg)](https://badge.fury.io/js/bulletin-board-code)
[![CI](https://github.com/tada5hi/bulletin-board-code/actions/workflows/main.yml/badge.svg)](https://github.com/tada5hi/bulletin-board-code/actions/workflows/main.yml)
[![codecov](https://codecov.io/gh/Tada5hi/bulletin-board-code/branch/master/graph/badge.svg?token=4KNSG8L13V)](https://codecov.io/gh/Tada5hi/bulletin-board-code)
[![Known Vulnerabilities](https://snyk.io/test/github/Tada5hi/bulletin-board-code/badge.svg)](https://snyk.io/test/github/Tada5hi/bulletin-board-code)
[![semantic-release: angular](https://img.shields.io/badge/semantic--release-angular-e10079?logo=semantic-release)](https://github.com/semantic-release/semantic-release)

**B**ulletin **B**oard **Code** (BBCode) is a library to transform a string from:
- BBCode to HTML
- HTML to BBCode

**Table of Contents**

- [Installation](#installation)
- [Features](#features)
- [Usage](#usage)
  - [BBCode to HTML](#bbcode-to-html)
  - [HTML to BBCode](#html-to-bbcode)
- [Handlers](#handlers)
  - [Set](#set)
  - [Unset](#unset)
- [Types](#types)
  - [ParserOptions](#parseroptions)
- [License](#license)

## Installation

```bash
npm install bulletin-board-code --save
```

## Features

- ✨ bidirectional transformation (HTML & BBCode)
- 📚 support nested BBCodes
- 🛠️ automatic repair mode
- 🧩 set/unset custom handlers for transformation

## Usage

For an overview of all predefined BBCodes,
take a look at the following [file](src/handler/constants.ts).
To see them in action, the test directory can be inspected.

### BBCode To HTML

```typescript
import { Parser } from 'bulletin-board-code';

// initialize the parser
const parser = new Parser();

console.log(parser.toHTML('[b]foo[/b]'));
// <strong>foo</strong>

```

### HTML To BBCode

```typescript
import { Parser } from 'bulletin-board-code';

// initialize the parser
const parser = new Parser();

console.log(parser.toBBCode('<strong>foo</strong>'));
// [b]foo[/b]
```

## Handlers

A handler describes how parsed tokens should be transformed to HTML or BBCode.
Furthermore, the handler specifies conditions, when to match with a token.

### Set

To set a (new) handler use the following approach:

```typescript
import { Parser } from 'bulletin-board-code';

const parser = new Parser();

parser.setHandler('lazy', {
    conditions: [{ attribute: { lazy: null } }],
    bbcode: '[lazy]{0}[/lazy]',
    html: '<span lazy="true">lazy: {0}</span>'
});

console.log(parser.toHTML('[lazy]foo[/lazy]'));
// <span lazy="true">lazy: foo</span>

console.log(parser.toBBCode('<span lazy="true">lazy: foo</span>'));
// [lazy]foo[/lazy]
```

### Unset

To unset a handler use the following approach:

```typescript
import { Parser, unsetHandler } from 'bulletin-board-code';

const parser = new Parser();

parser.unsetHandler('h1');
parser.unsetHandler(['h2', 'h3']);

console.log(parser.toHTML('[h1]foo[/h1]'));
// [h1]foo[/h1]

console.log(parser.toBBCode('<h1>foo</h1>'));
// <h1>foo</h1>
```

## Types
### ParserOptions

The following options can be passed to the parser as constructor arguments.

```typescript
declare type ParserOptions = {
    /**
     * Add a set of handlers to the already predefined ones.
     *
     * default: {}
     */
    handlers: Record<string, Handler>,

    /**
     * If to add a new line before block level elements
     *
     * default: false
     */
    breakBeforeBlock: boolean,

    /**
     * If to add a new line after the start of block level elements
     *
     * default: false
     */
    breakStartBlock: boolean,

    /**
     * If to add a new line before the end of block level elements
     *
     * default: false
     */
    breakEndBlock: boolean,

    /**
     * If to add a new line after block level elements.
     *
     * default: true
     */
    breakAfterBlock: boolean,

    /**
     * If to remove empty tags.
     *
     * default: true
     */
    removeEmptyTags: boolean,

    /**
     * If to fix invalid nesting, like block level elements inside inline elements.
     *
     * default: true
     */
    fixInvalidNesting: boolean,

    /**
     * If to fix invalid children. i.e.
     * A tag which is inside a parent that doesn’t allow that type of tag as a child.
     *
     * default: true
     */
    fixInvalidChildren: boolean,

    /**
     * The default attribute quote type.
     *
     * default: QuoteType.auto
     */
    quoteType: `${QuoteType}`,

    /**
     * Lazy transformation without handler.
     * Otherwise, library will attempt to construct html or bbcode without handler.
     *
     * default: true
     */
    lazyTransformation: boolean
};
```

## License

Made with 💚

Published under [MIT License](./LICENSE).
