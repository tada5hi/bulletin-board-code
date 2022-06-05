[![npm version](https://badge.fury.io/js/bulletin-board-code.svg)](https://badge.fury.io/js/bulletin-board-code)
[![codecov](https://codecov.io/gh/Tada5hi/bulletin-board-code/branch/master/graph/badge.svg?token=4KNSG8L13V)](https://codecov.io/gh/Tada5hi/bulletin-board-code)
[![Master Workflow](https://github.com/Tada5hi/bulletin-board-code/workflows/main/badge.svg)](https://github.com/Tada5hi/bulletin-board-code)

# Bulletin Board Code 🧙
**B**ulletin **B**oard **Code** (BBCode) is a library to parse a string containing BBCodes to HTML.
Furthermore, it is also possible to clean the input string.

**Table of Contents**

- [Installation](#installation)
- [Usage](#usage)

## Installation

```bash
npm install bulletin-board-code --save
```

## Usage

BBCode to HTML:

```typescript
import { Parser } from 'bulletin-board-parser';

// initialize the parser
const parser = new Parser();

console.log(parser.toHTML('[b]foo[/b])'));
// <strong>foo</strong>

```

Custom BBCode TO HTML:

```typescript
import { Parser, setHandler } from 'bulletin-board-parser';

setHandler('lazy', {
    html: '<span>lazy: {0}</span>'
});

const parser = new Parser();

console.log(parser.toHTML('[lazy]foo[/lazy]'));
// <span>lazy: foo</span>

```
