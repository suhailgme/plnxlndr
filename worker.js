const loans = require('./loansWorking')


// Takes the currency and required market depth (default 33) to get loan offers for.
// Prints the market depth, loan rate and number of offers parsed at the requested depth and
// returns a promise with the market rate and the date/time it was retrieved.
const getMarketRate = (currency, requiredDepth) => {
  return new Promise((resolve, reject) => {
    var marketDepth = loans.getDepth(currency).then((ticker) => {
      let depth = 0,
        totalCount = 0,
        ordersUntilRequiredDepth = 0,
        rate = 0
      //console.log(ticker)
      ticker.offers.forEach((offer) => {
        totalCount++
        if (depth <= requiredDepth) {
          ordersUntilRequiredDepth++
          //console.log(`Depth: ${depth} BTC, Offer Amount: ${offer.amount} BTC, Rate: ${offer.rate}%`)
          depth += Number(offer.amount)
          rate = parseFloat(offer.rate * 100).toFixed(4)
          //count++
        }
      })
      //console.log(`Required Market Depth is: ${requiredDepth}`)
      console.log(`\n${Date().slice(16,24)}: Market depth is ${depth} ${currency}. Total offers parsed: ${totalCount}. Offers until required depth: ${ordersUntilRequiredDepth} Rate is: ${rate}%`);
      depth ? resolve({
        rate: rate,
        retrieved: Date(),
        atDepth: ordersUntilRequiredDepth
      }) : reject(`${Date().slice(16,24)}: Couldn\'t reach Poloniex or no loan offers available!`)
    }).catch(err => console.error(`${Date().slice(16,24)}: ${err.message}`))
  })

}


// Takes the currency to check active loans for as argument and prints all current, ongoing loans including
// amount loaned,rate, date accepted and whether auto renew is on or off.
const getActiveLoans = (currency) => {
  return new Promise((resolve, reject) => {
    loans.getActiveLoans()
      .then((activeLoans) => {
        //console.log(activeLoans)
        if (!activeLoans.provided) {
          reject(`${Date().slice(16,24)}: No active loans`)
          //console.log(`${Date().slice(16,24)}: No active loans`)
        } else {
          activeLoans.provided.forEach((loan) => {
            console.log(`${Date().slice(16,24)}: Active loan of ${loan.amount} ${currency} at rate of ${(loan.rate*100).toFixed(4)}% for ${loan.duration} days accepted on ${loan.date} (auto renew is ${loan.autoRenew === 0 ? 'off).' : 'on).'}`)
          })
          resolve(activeLoans.provided)
        }
      }).catch(err => console.error(`${Date().slice(16,24)}: ${err.message}`))
  })

}

// Prints complete account balance for all accounts (exchange, margin, lending) to console.
// Returns a promise containing an object with ALL balances of currency parameter in the account.
const getCompleteBalances = currency => {
  return new Promise((resolve, reject) => {
    let balances = {}
    loans.getAllBalances()
      .then((allBalances) => {
        balances.allBalances = allBalances[currency]
        loans.getAvailableBalances()
          .then((availableBalances) => {
            balances.availableBalances = availableBalances
            if (Object.keys(balances).length) {
              console.log(`${Date().slice(16,24)}: Lending balance: ${balances.availableBalances.lending[currency]} BTC \n\t  On orders: ${balances.allBalances.onOrders} BTC \n\t  Account value: ${balances.allBalances.btcValue} BTC`)

              resolve(balances)
            } else {
              reject('Unable to retrieve balances or no balances available.')
            }
          })
      }).catch(err => console.error(`${Date().slice(16,24)}: ${err.message}`))
  })

}

// Takes the currency to get earnings for as an argument. Prints the Gross earnings, fees and net earnings (gross - fees)
// to console. Returns a promise (an empty object if rejected) containing gross earnings, fees, and net earnings.
const getLendingEarnings = (currency) => {
  return new Promise((resolve, reject) => {
    let earnings = {}
    loans.getLendingHistory().then((history) => {
      if (history.length === 0) {
        console.log(`${Date().slice(16,24)}: No lending history available.`)
        reject(earnings)
      } else {
        try {
          let gross = 0,
            fees = 0
          history.forEach((loan) => {
            if (loan.currency === currency) {
              gross += parseFloat(loan.earned)
              fees += parseFloat(loan.fee)
            }
          })
          console.log(`${Date().slice(16,24)}: Gross earnings: ${gross} ${currency}\n\t  Fees: ${fees} ${currency}\n\t  Net earnings: ${gross+fees} ${currency}`)
          earnings.gross = gross, earnings.fees = fees, earnings.net = gross + fees
          resolve(earnings)

        } catch (err) {
          console.log(`${Date().slice(16,24)}: Error getting lending history while calculating earnings!`)
        }

      }
    }).catch(err => console.error(err))
  })

}

const getOpenLoanOffers = (currency) => {
  return new Promise((resolve, reject) => {
    loans.getOpenLoanOffers().then((openOffers) => {
      //console.log('open offers', openOffers)
      if (openOffers[currency]) {
        openOffers[currency].forEach((offer) => {
        console.log(`${Date().slice(16,24)}: Open loan offer of ${offer.amount} ${currency} at rate of ${(offer.rate*100).toFixed(4)}% for ${offer.duration} days.`)
        })
        resolve(openOffers)
      } else {
        resolve({
          [currency]: openOffers
        })
        console.log(`${Date().slice(16,24)}: No open offers.`)
      }
    }).catch(err => reject(err))
  })
}

const makeLoanOffer = (currency, amount, duration, autoRenew, lendingRate) => {
  loans.createLoanOffer(currency, amount, duration, autoRenew, lendingRate)
    .then((loanOffer) => {
      loanOffer.success ? console.log(Date().slice(16, 24) + ':', loanOffer.message, 'With order ID:', loanOffer.orderID) : console.log(loanOffer.message)
    })
    .catch(err => console.error(err))
}

const cancelLoanOffer = (orderNumber) => {
  loans.cancelLoanOffer(orderNumber)
    .then(cancelledOrder => console.log(`${Date().slice(16, 24)}: ${cancelledOrder.message}`))
    .catch(err => console.error(err.message))
}




module.exports = {
  getMarketRate,
  getActiveLoans,
  getCompleteBalances,
  getLendingEarnings,
  getOpenLoanOffers,
  makeLoanOffer,
  cancelLoanOffer

}