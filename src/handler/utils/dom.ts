/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export function setCss(node: HTMLElement, rule: string | Record<string, any>, value?: string | number) {
    if (arguments.length < 3) {
        if (typeof rule === 'object') {
            const keys = Object.keys(rule);
            for (let i = 0; i < keys.length; i++) {
                setCss(node, keys[i], rule[keys[i]]);
            }
        }
    } else {
        // isNaN returns false for null, false and empty strings
        // so need to check it's truthy or 0
        const isNumeric = (value || value === 0) && !Number.isNaN(value);
        if (typeof rule === 'string') {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            node.style[rule] = isNumeric ? `${value}px` : value;
        }
    }
}
export function getCss<K extends keyof CSSStyleDeclaration>(node: HTMLElement, rule: K): CSSStyleDeclaration[K] | null {
    if (node.nodeType !== 1) {
        return null;
    }

    const style = getComputedStyle(node);

    return style[rule];
}

export function setAttribute(node: HTMLElement, attr: string, value: string | null) : void {
    if (value == null) {
        removeAttr(node, attr);

        return;
    }

    node.setAttribute(attr, value);
}

export function getAttribute(node: HTMLElement, attr: string): string | null {
    return node.getAttribute(attr);
}

export function removeAttr(node: HTMLElement, attr: string) : void {
    node.removeAttribute(attr);
}

export function hasSelector(node: HTMLElement | Element, selector: string): boolean {
    if (node && node.nodeType === 1) {
        return node.matches.call(node, selector);
    }

    return false;
}

function toFloat(input: string) {
    const value = Number.parseFloat(input);

    return Number.isFinite(value) ? value : 0;
}

export function setWidth(node: HTMLElement, value: string | number) {
    return setCss(node, 'width', value);
}

export function getWidth(node: HTMLElement, value?: string | number): number {
    const cs = getComputedStyle(node);
    const padding = toFloat(cs.paddingLeft) + toFloat(cs.paddingRight);
    const border = toFloat(cs.borderLeftWidth) + toFloat(cs.borderRightWidth);

    return node.offsetWidth - padding - border;
}

export function setHeight(node: HTMLElement, value: string | number) {
    return setCss(node, 'height', value);
}

export function getHeight(node: HTMLElement, value?: string | number) : number {
    const cs = getComputedStyle(node);
    const padding = toFloat(cs.paddingTop) + toFloat(cs.paddingBottom);
    const border = toFloat(cs.borderTopWidth) + toFloat(cs.borderBottomWidth);

    return node.offsetHeight - padding - border;
}
