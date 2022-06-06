/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export type TokenAttributes = {
    default?: string,
    class?: string[],
    style?: Record<string, any>
} & {
    [key: string]: any
};
