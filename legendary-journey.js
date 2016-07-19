require('babel-polyfill')
const client = require('gw2e-gw2api-client')
const value = require('gw2e-account-value')
const calc = require('gw2e-recipe-calculation')
const nesting = require('gw2e-recipe-nesting')
const fs = require('fs')

// Takes in the contents of an account's bank, mats,
// and all their characters and returns a simple
// map of object ids to counts.
function assembleItems (bank, mats, characters) {
  // Bank and mats can be processed together.
  var ret = bank.concat(mats).reduce(function(totals, slot) {
    if (slot) {
      totals[slot.id] = (totals[slot.id] || 0) + slot.count
    }
    return totals
  }, {})

  // Characters requires more processing.
  for (var character in characters) {
    for (var bag in character.bags) {
      for (var item in bag.inventory) {
        if (item) {
          ret[item.id] = (ret[item.id] || 0) + item.count
        }
      }
    }
  }
  return ret
}

async function calculateCost (item, apiKey) {
  try {
    let api = client()
    api.language('en')
    api.authenticate(apiKey)

    // Get all of GW2's recipes and organize them into a tree.
    let recipes = await api.recipes().all()
    // Also read MF recipes from a file.
    let mysticRecipes = JSON.parse(fs.readFileSync('mystic-recipes.json', 'utf8'))
    let nestedRecipes = nesting(recipes.concat(mysticRecipes))

    // Find our target.
    let recipeTree = nestedRecipes.find(function (recipe) {
      return recipe.id === item
    })

    // Assemble arrays of all the account's stuff:
    // Bank
    // Material storage
    // Character inventories
    // BUG: Currently shared inventory slots are ignored as there is no
    // support for them in gw2api-client.
    let bank = await api.account().bank().get()
    let mats = await api.account().materials().get()
    let characters = await api.characters().all()
    let items = assembleItems(bank, mats, characters)
    let gold = (await api.account().wallet().get()).find(function (currency) {
      return currency.id == 1
    }).value
    // Get all the current prices. We assume to be paying the buy price.
    let tradingPost = await api.commerce().prices().all()
    let prices = tradingPost.reduce(function (prices, item) {
      prices[item.id] = item.buys.unit_price
      return prices
    }, {})
    prices = calc.useVendorPrices(prices)

    let tree = calc.cheapestTree(1, recipeTree, prices, items)
    console.log({
      "craftCost": tree.craftPrice,
      "walletGold": gold,
      "timestamp": Math.round(Date.now() / 1000)
    })
  } catch (err) {
    console.log('Something went wrong.', err)
  }
}

calculateCost(
  parseInt(process.argv[2]),
  process.argv[3]
)
