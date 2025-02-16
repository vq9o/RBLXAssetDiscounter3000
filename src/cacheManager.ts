// Copyright (c) 2025 RAMPAGE Interactive
// Written by vq9o

import fs from 'fs';
import path from 'path';
import { CacheData, Config } from './types.js';
import { RobloxApiService } from './RobloxApiService.js';
import chalk from 'chalk';

export class CacheManager {
    private cachePath: string;
    private configPath: string;
    private cache: CacheData[];
    private config: Config;
    private apiService?: RobloxApiService;
    private loggedIn: boolean = false;

    constructor() {
        this.cachePath = path.join(process.cwd(), 'cache.json');
        this.configPath = path.join(process.cwd(), 'config.json');
        this.cache = this.loadCache();
        this.config = this.loadConfig();

        if (this.config.cookie) this.apiService = new RobloxApiService(this.config.cookie);
    }

    public async initialize() {
        if (!this.loggedIn && this.config.cookie && this.apiService) {
            await this.apiService.initialize().catch(function (error) { console.error(chalk.red("An error occured with the Roblox API while attempting to Login: ", error)); });
            this.loggedIn = true;
        }
    }

    private loadCache(): CacheData[] {
        if (!fs.existsSync(this.cachePath)) {
            fs.writeFileSync(this.cachePath, '[]');
            return [];
        }

        return JSON.parse(fs.readFileSync(this.cachePath, 'utf8'));
    }

    private loadConfig(): Config {
        if (!fs.existsSync(this.configPath)) {
            fs.writeFileSync(this.configPath, '{}');
            return {};
        }

        return JSON.parse(fs.readFileSync(this.configPath, 'utf8'));
    }

    private saveCache() {
        fs.writeFileSync(this.cachePath, JSON.stringify(this.cache, null, 2));
    }

    private saveConfig() {
        fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 2));
    }

    public getItem(assetId: number): CacheData | undefined {
        return this.cache.find(item => item.assetId === assetId);
    }

    public getAllItems(): CacheData[] {
        return this.cache;
    }

    public async addItem(universeId: number, group: string, assetId: number) {
        if (!this.apiService) throw new Error('Cookie and Universe ID not configured');
        if (!this.loggedIn) await this.initialize();

        try {
            const details = await this.apiService.getProductDetails(assetId);

            const item: CacheData = {
                group,
                assetId,
                universeId: universeId,
                name: details.Name,
                description: details.Description,
                currentPrice: details.PriceInRobux,
                defaultPrice: details.PriceInRobux,
                type: 'developerproduct'
            };

            // Check if item already exists
            const existingIndex = this.cache.findIndex(i => i.assetId === assetId);

            if (existingIndex !== -1) {
                this.cache[existingIndex] = item;
            } else {
                this.cache.push(item);
            }

            this.saveCache();
            return item;
        } catch (error) {
            throw new Error(`Failed to fetch product details: ${error}`);
        }
    }

    public removeItem(assetId: number) {
        this.cache = this.cache.filter(item => item.assetId !== assetId);
        this.saveCache();
    }
    public async updatePrice(assetId: number, newPrice: number | undefined) {
        if (!this.apiService) throw new Error('API key not configured');
        if (!this.loggedIn) await this.initialize();

        const item = this.cache.find(item => item.assetId === assetId);
        if (!item) throw new Error('Asset not found in cache');

        try {
            if (newPrice === undefined) newPrice = item.defaultPrice;
            await this.apiService.updateProductPrice(item.universeId, assetId, newPrice);
            const index = this.cache.findIndex(i => i.assetId === assetId);

            if (index !== -1) {
                this.cache[index] = {
                    ...item,
                    currentPrice: newPrice
                };
                this.saveCache();
            }
        } catch (error) {
            throw new Error(chalk.red(`Failed to update price: ${error}`));
        }
    }

    public async updateGroupPrice(group: string, newPrice: number) {
        if (!this.apiService) throw new Error('API key not configured');
        if (!this.loggedIn) await this.initialize();

        const items = this.cache.filter(item => item.group === group);
        if (items.length === 0) throw new Error('No items found for the specified group');

        let updated = false;
        for (const item of items) {
            try {
                await this.updatePrice(item.assetId, newPrice);
                updated = true;
            } catch (error) {
                console.error(chalk.red(error));
            }
        }

        if (updated) this.saveCache();
    }

    public setConfig(key: keyof Config, value: string) {
        if (key === 'cookie') {
            this.config.cookie = value;
        }

        this.loggedIn = false;

        if (this.config.cookie) {
            this.apiService = new RobloxApiService(this.config.cookie);
            this.initialize();
        }

        this.saveConfig();
    }

    public getConfig(): Config {
        return this.config;
    }
}