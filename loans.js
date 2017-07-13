const Poloniex = require('poloniex-api-node');
const _ = require('lodash')

const apiKey = 'YOUR-32-CHARACTER-API-KEY'
const secret = 'YOUR 128 CHARACTER ALPHANUMERIC SECRET KEY'

let poloniex = new Poloniex(apiKey, secret);

/*------------------------------------------------*/

const getDepth = coin => {
  return poloniex.returnLoanOrders(coin, null)
    .then(loanOrders => loanOrders)
    .catch(err => err)
}


// Get lending history from begining of the year to present (2017 - hardcoded for now)
const getLendingHistory = () => {
  return poloniex.returnLendingHistory(1483228800, 1514764799, null)
    .then(history => history)
    .catch(err => history)
}


const getBalances = () => {
  return poloniex.returnBalances()
    .then(balances => balances)
    .catch(err => err)
}



const getActiveLoans = () => {
    return poloniex.returnActiveLoans()
      .then(activeLoans => activeLoans)
      .catch(err => err)

}


const getOpenLoanOffers = coin => {
  return poloniex.returnOpenLoanOffers()
    .then(loanOffers => loanOffers)
    .catch(err => err)
}

module.exports = {
  getActiveLoans,
  getDepth,
  getBalances,
  getLendingHistory,
  getOpenLoanOffers
}