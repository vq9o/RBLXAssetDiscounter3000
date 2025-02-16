# RBLXAssetDiscounter3000
Roblox Asset Discounter 3000 is a CLI utility to easily manage and update your game's Developer Product prices for sales and promotions.

## Features
- Mass update Developer Product prices by groups
- Import products individually or in bulk
- Save and restore default prices
- Cache-based price management

## Installation
```bash
npm install rblxassetdiscounter -g
```

## Setup
1. Copy config.json.template to config.json
2. Set your Roblox security cookie in config.json

## Commands
- Bind Cookie:
```bash
rblxdiscount bindcookie <.ROBLOSECURITY_COOKIE>
```

- Import Product:
```bash
rblxdiscount import <universeId> <groupName> <assetId>
```
You can also import multiple products by:
- Comma-separated IDs: `rblxdiscount import 123 sale "1234,5678,9012"`
- Text file: `rblxdiscount import 123 sale "products.txt"`

- Update Price:
```bash
rblxdiscount editprice <assetId> <newPrice>
```

- Mass Update Group Prices:
```bash
rblxdiscount masseditprice <groupName> <newPrice>
```

- Delete from Cache:
```bash
rblxdiscount delete <assetId>
```