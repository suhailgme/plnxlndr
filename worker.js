const loans = require('./loansWorking')


// Takes the currency and required market depth (default 33) to get loan offers for. 
// Prints the market depth, loan rate and number of offers parsed at the requested depth and
// returns a promise with the market rate.
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
                    rate = parseFloat(offer.rate * 100)
                    //count++
                }
            })
            //console.log(`Required Market Depth is: ${requiredDepth}`)
            console.log(`Market depth is ${depth} ${currency}. Total offers parsed: ${totalCount}. Offers until required depth: ${ordersUntilRequiredDepth} Rate is: ${rate}%`);
            depth ? resolve(rate) : reject('Couldn\'t reach Poloniex. Check arguments.')
        }).catch(err => console.error(err.message))
    })

}


// Takes the currency to check active loans for as argument and prints all current, ongoing loans including
// amount loaned,rate, date accepted and whether auto renew is on or off.
const getActiveLoans = (currency) => {
    loans.getActiveLoans()
        .then((activeLoans) => {
            //console.log(activeLoans)
            if (activeLoans.provided.length === 0) {
                console.log('No active loans')
            } else {
                activeLoans.provided.forEach((loan) => {
                    console.log(`Loan of ${loan.amount}${currency} at rate of ${(loan.rate*100).toFixed(4)}% for ${loan.duration} days accepted on ${loan.date} (auto renew is ${loan.autoRenew === 0 ? 'off).' : 'on).'}`)
                })
            }
        }).catch(err => console.error(err.message))
}

// Prints complete account balance for all accounts (exchange, margin, lending) to console.
const getCompleteBalances = () => {
    loans.getAllBalances()
        .then(balances => console.log(balances['BTC']))
        .catch(err => console.error(err))
}

// Takes the currency to get earnings for as an argument. Prints the Gross earnings, fees and net earnings (gross - fees)
// to console.
const getLendingEarnings = (currency) => {
    loans.getLendingHistory().then((history) => {
        if (history.length === 0) {
            console.log("No lending history available.")
        } else {
            let gross = 0,
                net = 0,
                fees = 0
            history.forEach((loan) => {
                if (loan.currency === currency) {
                    gross += parseFloat(loan.earned)
                    fees += parseFloat(loan.fee)
                }
            })
            console.log(`Gross earnings: ${gross} ${currency}\nFees: ${fees} ${currency}\nNet earnings: ${gross+fees} ${currency}`)
        }
    }).catch(err => console.error(err))
}

const getOpenLoanOffers = (currency) => {
    loans.getOpenLoanOffers().then((openOffers) => {
        if (openOffers.length) {
            console.log(openOffers)
        } else {
            console.log('No open offers.')
        }
    })
}


module.exports = {
    getMarketRate,
    getActiveLoans,
    getCompleteBalances,
    getLendingEarnings,
    getOpenLoanOffers

}