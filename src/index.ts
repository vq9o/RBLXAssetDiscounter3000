// Copyright (c) 2025 RAMPAGE Interactive
// Written by vq9o

import { Command } from 'commander';
import figlet from "figlet";
import chalk from 'chalk';
import fs from 'fs';
import { createRequire } from 'module';
import { CacheManager } from './cacheManager.js';

const cacheManager = new CacheManager();

const require = createRequire(import.meta.url);
const packageJson = require('../package.json');
const current_version = packageJson.version;

console.log(figlet.textSync("RBLX Asset Discounter CLI"));
console.log("Copyright (c) 2025 RAMPAGE Interactive.");
console.log("Written by vq9o and Contributor(s).");
console.log(`Version: ${current_version}`);

const program = new Command();

program
    .version(current_version)
    .description('RBLX Asset Discounter CLI')

program
    .command('bindcookie [cookie]')
    .description('Bind your .ROBLOSECURITY cookie to authenticate the requests.')
    .action(async (cookie: string) => {
        if (!cookie) {
            console.log(chalk.red("Please provide a .ROBLOSECURITY cookie."));
            return;
        }
        cacheManager.setConfig('cookie', cookie);
        console.log(chalk.green("Cookie has been saved successfully."));
    });

program
    .command('delete [assetId]')
    .description('Delete a Gamepass/Developer Product\'s from the cache.json. It will NOT delete the item from Roblox.')
    .action(async (assetId: number) => {
        if (!assetId) {
            console.log(chalk.red("Please provide an asset ID."));
            return;
        }
        cacheManager.removeItem(assetId);
        console.log(chalk.green(`Asset ${assetId} has been removed from cache.`));
    });

program
    .command('editprice [assetId] [newPrice]')
    .description('Edit a Gamepass/Developer Product\'s price tag. If newPrice is undefined it will reset all items to their default price.')
    .action(async (assetId: number, newPrice: number) => {
        if (!assetId) {
            console.log(chalk.red("Please provide an asset ID."));
            return;
        }
        cacheManager.updatePrice(assetId, newPrice);
        console.log(chalk.green(`Price updated for asset ${assetId} to ${newPrice}.`));
    });

program
    .command('masseditprice [group] [newPrice]')
    .description('Mass Edit Pricing for all items in the associated group. If newPrice is undefined it will reset all items to their default price.')
    .action(async (group: string, newPrice: number) => {
        if (!group) {
            console.log(chalk.red("Please provide a group name."));
            return;
        }
        cacheManager.updateGroupPrice(group, newPrice);
        console.log(chalk.green(`Prices updated for all items in group ${group} to ${newPrice}.`));
    });


program
    .command('import [universeId] [group] [assetId]')
    .description('Import a Developer Product item.')
    .action(async (universeId: string, group: string, assetId: string) => {
        if (!group || !assetId) {
            console.log(chalk.red("Please provide both group name and asset ID."));
            return;
        }

        const processAssetId = async (id: string) => {
            try {
                const numericAssetId = parseInt(id);
                const numericUniverseId = parseInt(universeId);

                if (isNaN(numericUniverseId)) throw new Error('Invalid unvierse ID');
                if (isNaN(numericAssetId)) throw new Error('Invalid asset ID');

                await cacheManager.addItem(numericUniverseId, group, numericAssetId);
                
                console.log(chalk.green(`Imported asset ${id} successfully.`));
            } catch (error) {
                console.error(chalk.red(`Failed to import asset ${id}: ${error}`));
            }
        };

        try {
            if (fs.existsSync(assetId)) {
                const ids = fs.readFileSync(assetId, 'utf8')
                    .split('\n')
                    .map(line => line.trim())
                    .filter(line => line);

                for (const id of ids) await processAssetId(id);
            } else if (assetId.includes(',')) {
                const ids = assetId.split(',').map(id => id.trim());
                for (const id of ids) await processAssetId(id);
            } else {
                await processAssetId(assetId);
            }
        } catch (error) {
            console.error(chalk.red(`Operation failed: ${error}`));
        }
    });

program.parse(process.argv);

if (!process.argv.slice(2).length) program.outputHelp();

const options = program.opts();