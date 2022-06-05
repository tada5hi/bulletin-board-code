/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export enum QuoteType {
    /**
     * Always quote the attribute value
     */
    always = 'always',

    /**
     * Never quote the attributes value
     */
    never = 'never',

    /**
     * Only quote the attributes value when it contains spaces to equals
     */
    auto = 'auto',
}
