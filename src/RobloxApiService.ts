// Copyright (c) 2025 RAMPAGE Interactive
// Written by vq9o

import axios from 'axios';
import noblox from 'noblox.js';
import chalk from 'chalk';

export class RobloxApiService {
    private cookie: string;
    private baseUrl = 'https://apis.roblox.com/developer-products/v1';

    constructor(cookie: string) {
        this.cookie = cookie;
    }

    async initialize() {
        await noblox.setCookie(this.cookie, true).then(function() {
            console.log(chalk.green("Roblox account authenticated in successfully!"));
        }).catch(function (error) { 
            console.error(chalk.red(error));
        });
    }

    async getProductDetails(productId: number): Promise<{
        Name: string;
        Description: string;
        ProductId: number;
        PriceInRobux: number;
        Created: string;
        Updated: string;
    }> {
        const response = await axios.get(
            `${this.baseUrl}/developer-products/${productId}/details`
        );

        return response.data;
    }

    async updateProductPrice(universeId: number, productId: number, price: number): Promise<void> {
        console.log(chalk.yellow(`Product: ${productId} | New Price: ${price} | Universe: ${universeId}`));

        await noblox.updateDeveloperProduct(
            universeId,
            productId,
            price
        );
    }
}