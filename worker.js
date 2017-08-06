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
            console.log(`${Date().slice(16,24)}: Active loan of ${loan.amount}${currency} at rate of ${(loan.rate*100).toFixed(4)}% for ${loan.duration} days accepted on ${loan.date} (auto renew is ${loan.autoRenew === 0 ? 'off).' : 'on).'}`)
          })
          resolve(activeLoans.provided)
        }
      }).catch(err => console.error(`${Date().slice(16,24)}: ${err.message}`))
  })

}

// Prints complete account balance for all accounts (exchange, margin, lending) to console.
const getCompleteBalances = currency => {
  let balances = {}
  loans.getAllBalances()
    .then((allBalances) => {
      balances.allBalances = allBalances[currency]
      loans.getAvailableBalances()
        .then((availableBalances) => {
          balances.availableBalances = availableBalances

          console.log(`${Date().slice(16,24)}:`, JSON.stringify(balances, null, 1))
        })
    }).catch(err => console.error(err))
}

// Takes the currency to get earnings for as an argument. Prints the Gross earnings, fees and net earnings (gross - fees)
// to console.
const getLendingEarnings = (currency) => {
  loans.getLendingHistory().then((history) => {
    //console.log('History start ',history,'History End')
    if (history.length === 0) {
      console.log(`${Date().slice(16,24)}: No lending history available.`)
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

      } catch (err) {
        console.log(`${Date().slice(16,24)}: Error getting lending history while calculating earnings!`)
      }

    }
  }).catch(err => console.error(err))
}

const getOpenLoanOffers = (currency) => {
  loans.getOpenLoanOffers().then((openOffers) => {
      //console.log('open offers', openOffers)
      if (openOffers[currency]) {
        console.log('Open loan offer: ', openOffers)
      } else {
        console.log(`${Date().slice(16,24)}: No open offers.`)
      }
    })
    .catch(err => console.error(err))
}

const makeLoanOffer = (currency, amount, duration, autoRenew, lendingRate) => {
  loans.createLoanOffer(currency, amount, duration, autoRenew, lendingRate)
    .then(loanOffer => loanOffer)
    .catch(err => console.error(err))
}

const cancelLoanOffer = (orderNumber) => {
  loans.cancelLoanOffer(orderNumber)
    .then(cancelledOrder => console.log(cancelledOrder))
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
