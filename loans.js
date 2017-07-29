const Poloniex = require('poloniex-api-node');

const apiKey = 'YOUR-32-CHARACTER-API-KEY'
const secret = 'YOUR 128 CHARACTER ALPHANUMERIC SECRET KEY'

let poloniex = new Poloniex(apiKey, secret);

/*------------------------------------------------*/

const getDepth = currency => {
  return poloniex.returnLoanOrders(currency, ordersToFetch)
    .then(loanOrders => loanOrders)
    .catch(err => err)
}


// Get lending history from beginning of the year to present (2017 - hard-coded for now)
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

// Example call: createLoanOffer('BTC', 0.25, 2, 0, 0.0008)
const createLoanOffer = (currency, amount, duration, autoRenew, lendingRate) => {
  return poloniex.createLoanOffer(currency, amount, duration, autoRenew, lendingRate)
    .then(loanOffer => loanOffer)
    .catch(err => err)

}

// Example call: cancelLoanOffer('10590')
const cancelLoanOffer = (orderNumber) => {
  return poloniex.createLoanOffer(orderNumber)
  .then(offer => offer)
  .catch(err => err)

}


module.exports = {
  getActiveLoans,
  getDepth,
  getAllBalances,
  getLendingHistory,
  getOpenLoanOffers,
  getAvailableBalances,
  createLoanOffer,
  cancelLoanOffer
}