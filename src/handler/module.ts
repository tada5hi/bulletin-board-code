/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { hasOwnProperty, isObject } from '../utils';
import { HandlerPreset } from './constants';
import type { ParserOptions } from '../parser';
import type { Token } from '../token';
import type { Handler } from './types';
import { extendHandler, matchHandlers } from './utils';

export class Handlers {
    protected items : Record<string, Handler>;

    constructor(items?: Record<string, Handler>) {
        // No prototype, so ids like __proto__ or constructor stay ordinary entries.
        this.items = Object.create(null);

        this.init();

        if (items) {
            this.set(items);
        }
    }

    protected init() {
        const keys = Object.keys(HandlerPreset);

        for (const key of keys) {
            this.items[key] = extendHandler(HandlerPreset[key]);
        }
    }

    get() : Record<string, Handler>;

    get(id: string) : Handler | undefined;

    get(id?: string) : any {
        if (typeof id === 'string') {
            return hasOwnProperty(this.items, id) ? this.items[id] : undefined;
        }

        return this.items;
    }

    has(id: string) : boolean {
        return hasOwnProperty(this.items, id);
    }

    /**
     * Check if the BBCode tag is inline (not block level).
     * Unknown tags are inline.
     *
     * @param handler
     */
    isInline(handler: string | Handler) : boolean {
        const item = this.resolve(handler);

        return !item || item.isInline !== false;
    }

    /**
     * Check if the HTML output of the tag is inline.
     * Unknown tags are inline.
     *
     * @param handler
     */
    isHtmlInline(handler: string | Handler) : boolean {
        const item = this.resolve(handler);

        return !item || (item.isHtmlInline ?? item.isInline) !== false;
    }

    /**
     * Check if a line break belongs at the given position of the tag.
     * The handler's own flag wins; otherwise block level tags follow the
     * matching parser option. Unknown tags never break.
     *
     * @param handler
     * @param position
     * @param options
     */
    breaks(
        handler: string | Handler,
        position: 'before' | 'start' | 'end' | 'after',
        options: Pick<ParserOptions, 'breakBeforeBlock' | 'breakStartBlock' | 'breakEndBlock' | 'breakAfterBlock'>,
    ) : boolean {
        const item = this.resolve(handler);

        if (!item) {
            return false;
        }

        let flag : boolean | undefined;
        let option : boolean;

        switch (position) {
            case 'before':
                flag = item.breakBefore;
                option = options.breakBeforeBlock;

                break;
            case 'start':
                flag = item.breakStart;
                option = options.breakStartBlock;

                break;
            case 'end':
                flag = item.breakEnd;
                option = options.breakEndBlock;

                break;
            default:
                flag = item.breakAfter;
                option = options.breakAfterBlock;

                break;
        }

        if (flag === true) {
            return true;
        }

        return item.isInline === false && option && flag !== false;
    }

    /**
     * Find the handlers matching an HTML token.
     * At most one tag matched handler comes first, followed by
     * every handler matched only through attribute conditions.
     *
     * @param token
     */
    match(token: Token) : Handler[] {
        return matchHandlers(this.items, token);
    }

    protected resolve(handler: string | Handler) : Handler | undefined {
        return typeof handler === 'string' ? this.get(handler) : handler;
    }

    set(items: Record<string, Handler>) : void;

    set(id: string, handler: Handler) : void;

    set(id: string | Record<string, Handler>, handler?: Handler) : void {
        if (isObject(id)) {
            const keys = Object.keys(id);

            for (const key of keys) {
                this.set(key, id[key]);
            }

            return;
        }

        if (typeof handler !== 'undefined') {
            this.items[id] = extendHandler(handler);
        }
    }

    unset(id: string | string[]) {
        const keys = Array.isArray(id) ? id : [id];

        for (const key of keys) {
            delete this.items[key];
        }
    }
}
