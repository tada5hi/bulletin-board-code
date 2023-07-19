/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { isObject } from '../utils';
import { HandlerPreset } from './constants';
import type { Handler } from './type';
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
        for (let i = 0; i < keys.length; i++) {
            this.items[keys[i]] = extendHandler(HandlerPreset[keys[i]]);
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
            for (let i = 0; i < keys.length; i++) {
                this.set(keys[i], id[keys[i]]);
            }
            return;
        }

        if (typeof handler !== 'undefined') {
            this.items[id] = extendHandler(handler);
        }
    }

    unset(id: string | string[]) {
        const keys = Array.isArray(id) ? id : [id];
        for (let i = 0; i < keys.length; i++) {
            delete this.items[keys[i]];
        }
    }
}
