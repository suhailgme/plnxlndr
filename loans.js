const Poloniex = require('poloniex-api-node');
const _ = require('lodash')



const apiKey = 'YOUR-32-CHARACTER-API-KEY'
const secret = 'YOUR 128 CHARACTER ALPHANUMERIC SECRET KEY'

let poloniex = new Poloniex(apiKey, secret);


let getDepth = coin => {
  return new Promise((resolve, reject) => {
    return poloniex.returnLoanOrders(coin, null)
    .then(loanOrders => resolve(loanOrders))
    .catch(err => reject(err))
  })
}




let getLendingHistory = () => {
  poloniex.returnLendingHistory(0, 0, null).then(history => console.log(history))
    .catch(err => console.error(err.message))
}


let getBalances = () => {
  return new Promise((resolve, reject) => {
    return poloniex.returnBalances()
      .then(balances => resolve(balances))
      .catch(err => reject(err))
  })
}


//
let getActiveLoans = () => {
  return new Promise((resolve, reject) => {
    return poloniex.returnActiveLoans()
      .then(activeLoans => resolve(activeLoans))
      .catch(err => reject(err))
  })
}


let getOpenLoanOffers = (coin) => {
  poloniex.returnOpenLoanOffers().then((loanOffers) => {
    //console.log(loanOffers[coin].length)
    if (loanOffers[coin].length > 0) {
      loanOffers[coin].forEach((offer) => {
        console.log(`Open offer of ${offer.amount}${coin} at rate of ${(offer.rate*100).toFixed(4)}% for ${offer.duration} days created on ${offer.date} (auto renew is ${offer.autoRenew === 0 ? 'off).' : 'on).'}`)
      })
    } else {
      console.log('No open orders.')
    }
  }).catch(err => console.error(err.msg))

}

module.exports = {
  getActiveLoans,
  getDepth,
  getBalances
}
