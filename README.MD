# Bulletin Board Code 🧙

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
- [Usage](#usage)
  - [BBCode to HTML](#bbcode-to-html)
  - [HTML to BBCode](#html-to-bbcode)
- [Handlers](#handlers)
  - [Set](#set)
  - [Unsert](#unset)
- [License](#license)

---
**Important NOTE**

The `README.md` file is still under construction ☂ at the moment.
So please stay patient or contribute to it, till it covers all parts ⭐.

---

## Installation

```bash
npm install bulletin-board-code --save
```

## Usage

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

## Set

The `setHandler` method allows adding or overwriting an existing handler.

```typescript
import { Parser, setHandler } from 'bulletin-board-code';

setHandler('lazy', {
    conditions: [{ attribute: { lazy: null } }],
    bbcode: '[lazy]{0}[/lazy]',
    html: '<span lazy="true">lazy: {0}</span>'
});

const parser = new Parser();

console.log(parser.toHTML('[lazy]foo[/lazy]'));
// <span lazy="true">lazy: foo</span>

console.log(parser.toBBCode('<span lazy="true">lazy: foo</span>'));
// [lazy]foo[/lazy]
```

## Unset

The `unsetHandler` method can be used to remove one or many handlers.

```typescript
import { Parser, unsetHandler } from 'bulletin-board-code';

unsetHandler('h1');
unsetHandler(['h2', 'h3']);

const parser = new Parser();

console.log(parser.toHTML('[h1]foo[/h1]'));
// [h1]foo[/h1]

console.log(parser.toBBCode('<h1>foo</h1>'));
// <h1>foo</h1>
```

## License

Made with 💚

Published under [MIT License](./LICENSE).
