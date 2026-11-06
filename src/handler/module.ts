/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { isObject } from '../utils';
import { HandlerPreset } from './constants';
import type { Handler } from './types';
import { extendHandler } from './utils';

export class Handlers {
    protected items : Record<string, Handler>;

    constructor(items?: Record<string, Handler>) {
        this.items = {};

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
            return this.items[id];
        }

        return this.items;
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
