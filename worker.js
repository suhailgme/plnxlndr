const loans = require('./loansWorking')
const _ = require('lodash')

var coin = 'BTC'
var requiredDepth = 33


let loanMarketData = {
    rate: [],
    average: 0
}

// Takes the coin and required market depth (default 33) to get loan offers for. 
// Prints the market depth, loan rate and number of offers parsed at the requested depth and
// returns a promise with the market rate.
const getMarketRate = (coin, requiredDepth, ) => {
    return new Promise((resolve, reject) => {
        var marketDepth = loans.getDepth(coin).then((ticker) => {
            let depth = 0,
                count = 0,
                rate
            ticker.offers.forEach((offer) => {
                count++
                if (depth <= requiredDepth) {
                    //console.log(`Depth: ${depth} BTC, Offer Amount: ${offer.amount} BTC, Rate: ${offer.rate}%`)
                    depth += Number(offer.amount)
                    rate = parseFloat(offer.rate*100)
                }
            })
            //console.log(`Required Market Depth is: ${requiredDepth}`)
            console.log(`Market depth is ${depth} ${coin}. Total offers parsed: ${count}. Rate is: ${rate}%`);
            depth ? resolve(rate):reject('Couldn\'t reach Poloniex')
        }).catch(err => console.error(err.message))
    })

}


// Takes the coin to check active loans for as argument and prints all current, ongoing loans including
// amount loaned,rate, date accepted and whether auto renew is on or off.
const activeLoans = (coin) => {
    loans.getActiveLoans()
        .then((activeLoans) => {
            //console.log(activeLoans)
            if (activeLoans.provided.length === 0) {
                console.log('No active loans')
            } else {
                activeLoans.provided.forEach((loan) => {
                    console.log(`Loan of ${loan.amount}${coin} at rate of ${(loan.rate*100).toFixed(4)}% for ${loan.duration} days accepted on ${loan.date} (auto renew is ${loan.autoRenew === 0 ? 'off).' : 'on).'}`)
                })
            }
        }).catch(err => console.error(err.message))
}

// Prints complete account balance for all accounts (exchange, margin, lending) to console.
const getCompleteBalances = () => {
    loans.getAllBalances()
        .then(balances => console.log(balances))
        .catch(err => console.error(err))
}

// Takes the coin to get earnings for as an argument. Prints the Gross earnings, fees and net earnings (gross - fees)
// to console.
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

const getOpenLoanOffers = (coin) => {
    loans.getOpenLoanOffers().then((openOffers) =>{
        if (openOffers.length){
            console.log(openOffers)
        }else{
            console.log('No open offers.')
        }
    })
}


const main = () => {
    getMarketRate(coin, requiredDepth)
    .then(rate =>loanMarketData.rate.push(rate))
    .catch(err => console.log(err))
    console.log(loanMarketData)
    loanMarketData.average = (loanMarketData.rate.length >= 1 ? _.mean(loanMarketData.rate) : console.log('Getting additional lending rates...'))
    setTimeout(main, 10000)


}

getMarketRate(coin, requiredDepth)
// setInterval(getMarketRate, 10000, coin, requiredDepth)
getLendingEarnings(coin)
activeLoans(coin)
//main()
//getOpenLoanOffers(coin)

//getMarketDepth(coin)
//getCompleteBalances()
//getLendingEarnings(coin)