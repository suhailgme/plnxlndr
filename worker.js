const loans = require('./loansWorking')
const _ = require('lodash')

var coin = 'BTC'
var requiredDepth = 33


const getMarketRate = coin => {
    var marketDepth = loans.getDepth(coin).then((ticker) => {
        let depth = 0,
            count = 0,
            rate
        ticker.offers.forEach((offer) => {
            depth += Number(offer.amount)
            count++
            rate = offer.rate
        })
        console.log(`Required Market Depth is: ${requiredDepth}`)
        console.log(`Market depth is ${depth} ${coin}. Total offers: ${count}. Rate is: ${_.round(rate,6) * 100}%`);
        return ticker
    }).catch(err => console.error(err.message))
}


const activeLoans = (coin) => {
    loans.getActiveLoans()
        .then((activeLoans) => {
            console.log(activeLoans)
            if (activeLoans.provided.length === 0) {
                console.log('No active loans')
            } else {
                activeLoans.provided.forEach((loan) => {
                    console.log(`Loan of ${loan.amount}${coin} at rate of ${(loan.rate*100).toFixed(4)}% for ${loan.duration} days accepted on ${loan.date} (auto renew is ${loan.autoRenew === 0 ? 'off).' : 'on).'}`)
                })
            }
        }).catch(err => console.error(err.message))
}

const getBalances = () => {
    loans.getBalances()
        .then(balances => console.log(balances))
        .catch(err => console.error(err))
}

const getLendingEarnings = (coin) => {
    loans.getLendingHistory().then((history) => {
        if (history.length === 0) {
            console.log("No lending history available.")
        } else {
            let gross = 0,
                net = 0,
                fees = 0
            history.forEach((loan) => {
                if (loan.currency === coin) {
                    gross += parseFloat(loan.earned)
                    fees += parseFloat(loan.fee)
                }
            })
            console.log(`Gross earnings: ${gross} ${coin}\nFees: ${fees} ${coin}\nNet earnings: ${gross+fees} ${coin}`)
        }
    }).catch(err => console.error(err))
}

// const openLoanOffers = () => {
//     loans.getOpenLoanOffers().then(openOffers => console.log(openOffers))
// }


// getMarketRate(coin)
activeLoans(coin)


//getMarketDepth(coin)
//getBalances()
//getLendingEarnings(coin)