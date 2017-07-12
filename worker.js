const loans = require('./loansWorking')
const _ = require('lodash')


let getMarketDepth = coin => {
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



const activeLoans = () => {
    loans.getActiveLoans()
        .then((activeLoans) => {
            if (activeLoans.provided.length === 0) {
                console.log('No active loans')
            }
        }).catch(err => console.error(err.message))
}

const getBalances = () => {
    loans.getBalances()
        .then(balances => console.log(balances))
        .catch(err => console.error(err))
}


var coin = 'BTC'
var requiredDepth = 33
getMarketDepth(coin)
activeLoans()