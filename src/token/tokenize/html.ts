/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    HTMLElement, Node, NodeType, TextNode, parse,
} from 'node-html-parser';
import { Token } from '../module';
import { TokenType } from '../constants';

function parseStyles(input: string) {
    return input
        .split(';')
        .filter((style) => style.split(':')[0] && style.split(':')[1])
        .map((style) => [
            style.split(':')[0].trim().replace(/-./g, (c) => c.substring(1).toUpperCase()),
            style.split(':')[1].trim(),
        ])
        .reduce((styleObj, style) => ({
            ...styleObj,
            [style[0]]: style[1],
        }), {});
}

const selfClosingTags : string[] = [
    'area',
    'base',
    'br',
    'col',
    'embed',
    'hr',
    'img',
    'input',
    'link',
    'meta',
    'param',
    'source',
    'track',
    'wbr',
];

function parseNode(node: Node) : Token[] {
    const tokens : Token[] = [];

    switch (node.nodeType) {
        case NodeType.ELEMENT_NODE: {
            const element = node as HTMLElement;
            if (element.rawTagName) {
                const children : Token[] = [];
                for (let i = 0; i < element.childNodes.length; i++) {
                    children.push(...parseNode(element.childNodes[i]));
                }

                let closingToken : Token | undefined;
                if (selfClosingTags.indexOf(element.tagName.toLowerCase()) === -1) {
                    closingToken = new Token(
                        TokenType.CLOSE,
                        element.tagName.toLowerCase(),
                        `</${element.tagName.toLowerCase()}>`,
                    );
                }

                const token = new Token(
                    TokenType.OPEN,
                    element.tagName.toLowerCase(),
                    `<${element.tagName.toLowerCase()}>`,
                    {
                        ...element.attrs,
                        ...(element.attrs.style ? { style: parseStyles(element.attrs.style) } : {}),
                        class: Array.from(element.classList.values()),
                    },
                    children,
                    closingToken,
                );

                tokens.push(token);
            } else {
                for (let i = 0; i < element.childNodes.length; i++) {
                    tokens.push(...parseNode(element.childNodes[i]));
                }
            }
            break;
        }
        case NodeType.TEXT_NODE: {
            const text = node as TextNode;
            tokens.push(new Token(TokenType.CONTENT, '#', text.text));
            break;
        }
        case NodeType.COMMENT_NODE:
            break;
    }

    return tokens;
}

export function tokenizeHTML(input: string) : Token[] {
    const htmlElement = parse(input);

    return parseNode(htmlElement);
}
