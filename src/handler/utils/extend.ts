/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Handler } from '../type';

export function extendHandler(handler: Handler) {
    return {
        ...{
            isSelfClosing: false,
            isInline: true,
            allowsEmpty: false,
            excludeClosing: false,
            skipLastLineBreak: false,
            strictMatch: false,
            breakBefore: false,
            breakStart: false,
            breakEnd: false,
            breakAfter: false,
        } as Partial<Handler>,
        ...handler,
    };
}
