// Copyright (c) 2025 RAMPAGE Interactive
// Written by vq9o

export interface CacheData {
    group: string;
    assetId: number;
    universeId: number;
    name: string;
    description: string;
    currentPrice: number;
    defaultPrice: number;
    type: 'developerproduct';
}

export interface Config {
    cookie?: string;
}