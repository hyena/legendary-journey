# Tool for tracking how far away you are from finishing a legendary over time.

This is a little tool I wrote to help track my progress towards finishing a legendary item in GW2.  It wouldn't be possible without the [gw2efficiency apis](https://github.com/gw2efficiency).

The tool takes in an item id (usually a legendary but not necessarily) and a gw2 api key and outputs a json object containing the current timestamp, the cost to craft the item (using items in the account's storage), and the amount of gold in the account's wallet.

By tracking the difference between the cost to craft the item and the available wallet gold, you can keep track of your progress towards crafting that legendary.

## Requirements

node and `npm`.

You will also need to know the id of the item you want to craft and have a [gw2 api key](https://account.arena.net/applications).

## Running

Assuming the above packages are installed and your node executable is named `nodejs`, you can run legendary-journey as follows:

```
npm install
npm run start <item-id> <api-key>
```

The output will be a json document like the following:

```
{
  craftCost: ....,
  walletGold: ...
  timestamp: ....,
}
```

## Todos

* Take in items by item name instead of id.
* Calculate the account's value if all components not used in the crafting were sold
