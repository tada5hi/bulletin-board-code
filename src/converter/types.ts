/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Handlers } from '../handler';
import type { Token } from '../token';

export type ConverterOptions = {
    isRoot?: boolean,
    lazy?: boolean
};

export type BBCodeToHTMLConvertContext = {
    tokens: Token[],
    options: ConverterOptions,
    handlers: Handlers
};

export type HTMLToBBCodeConvertContext = {
    tokens: Token[],
    options: ConverterOptions,
    handlers: Handlers
};
