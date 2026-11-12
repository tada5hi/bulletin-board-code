# Glossary

Terms used in the source, tests and agent docs.

- **Handler**: one tag definition with its BBCode and HTML templates or render functions, its HTML match conditions and its block/inline and line-break flags. `src/handler/types.ts`; presets in `src/handler/constants.ts`.
- **Handler registry**: the `Handlers` class. It holds the presets plus custom handlers and answers every question about a tag (`get`, `has`, `isInline`, `isHtmlInline`, `breaks`, `match`). `src/handler/module.ts`
- **Tag policy**: the block/inline and line-break rules of a tag. `Handlers.isInline`, `isHtmlInline` and `breaks` combine the handler flags with the `break*Block` parser options. `src/handler/module.ts`
- **Condition**: one way a handler recognizes an HTML element, by tag name, attributes (`style`, `class` as string or string array, any other attribute) or both. `src/handler/types.ts`
- **HTML matcher**: picks the handlers for an HTML element. At most one tag match comes first (tag plus attribute beats tag only, then registry order), followed by every attribute-only match. `src/handler/utils/match.ts`
- **Token**: a node of the token tree: opening tag with children and closing token, text or newline. `src/token/module.ts`, `src/token/constants.ts`
- **Token pipeline**: turns BBCode text into a token tree: tokenize, build the tree, fix nesting, normalize newlines, remove empty tags. `Parser.parseBBCode` runs it. `src/token/pipeline`
- **Tree walk**: renders a token tree in one direction without mutating it. Both converters supply a direction (handler lookup, text rendering, unmatched elements); several matching handlers nest with the first match outermost. `src/converter/walk`
- **URL policy**: allows URLs without a scheme and URLs with an allowed scheme; `[url]`, `[img]` and `[email]` with any other scheme render as literal text. `src/utils/url.ts`
