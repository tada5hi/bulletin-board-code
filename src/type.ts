/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Token, TokenAttributes } from './token';

export type FormatFn = (element: HTMLElement, content: string) => string;
export type HTMLFn = (token: Token, attrs: TokenAttributes, content: string) => string;
