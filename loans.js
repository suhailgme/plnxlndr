const Poloniex = require('poloniex-api-node');
const _ = require('lodash')

const apiKey = 'YOUR-32-CHARACTER-API-KEY'
const secret = 'YOUR 128 CHARACTER ALPHANUMERIC SECRET KEY'

let poloniex = new Poloniex(apiKey, secret);

/*------------------------------------------------*/

const getDepth = currency => {
  return poloniex.returnLoanOrders(currency, ordersToFetch)
    .then(loanOrders => loanOrders)
    .catch(err => err)
}


// Get lending history from begining of the year to present (2017 - hardcoded for now)
const getLendingHistory = () => {
  return poloniex.returnLendingHistory(1483228800, 1514764799, null)
    .then(history => history)
    .catch(err => err)
}


const getAllBalances = () => {
  return poloniex.returnCompleteBalances('all')
    .then(balances => balances)
    .catch(err => err)
}

const getAvailableBalances = () => {
  return poloniex.returnAvailableAccountBalances()
  .then(availableBalances => availableBalances)
  .catch(err => err)
}



const getActiveLoans = () => {
    return poloniex.returnActiveLoans()
      .then(activeLoans => activeLoans)
      .catch(err => err)

}


const getOpenLoanOffers = () => {
  return poloniex.returnOpenLoanOffers()
    .then(loanOffers => loanOffers)
    .catch(err => err)
}

module.exports = {
  getActiveLoans,
  getDepth,
  getAllBalances,
  getLendingHistory,
  getOpenLoanOffers,
  getAvailableBalances
}