/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {Token, TokenType} from "../../src";
import {findHandlerForHTMLToken} from "../../src/handler/utils";

describe('src/handler/*.ts', () => {
    it('should find handler for html token', () => {
        let token = new Token(TokenType.OPEN, 'SPAN', 'SPAN', {style: {fontFamily: 'sans-serif'}});

        const handler = findHandlerForHTMLToken(token);

        expect(handler).toBeDefined();
    });
})
