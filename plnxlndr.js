/*
  Plnxlndr is a cryptocurrency trading bot for the Poloniex exchange written 
  in node. It features multiple lending methods using statistical analysis to determine
  the optimal lending rate to offer.
  If you are interested in how plnxlndr works, read more about it here: 
  https://github.com/suhailgme/plnxlndr/blob/master/README.md
  Disclaimer:
  USE AT YOUR OWN RISK!
  The author of this project is NOT responsible for any damage or loss caused 
  by this software. There can be bugs and the bot may not perform as expected 
  or specified. Please use discretion when using this software and lend responsibly.
*/

const worker = require('./worker')
const _ = require('lodash')
const jsonfile = require('jsonfile')

let currency = 'BTC'
let requiredDepth = 33
let file = './data.json'


let loanMarketData = {
    rate: [],
    average: 0,
    date: ''
}



const main = () => {
    worker.getMarketRate(currency, requiredDepth)
        .then((rate) => {
            loanMarketData.rate.push(rate)
            loanMarketData.date = Date()
            jsonfile.writeFile(file, loanMarketData, {
                spaces: 2
            }, ((err) => {
                if (err) console.error(err)
            }))
        })
        .catch(err => console.error(err))
    //console.log(loanMarketData)
    loanMarketData.average = (loanMarketData.rate.length >= 1 ? _.mean(loanMarketData.rate) : console.log('Getting additional lending rates...'))
    worker.getCompleteBalances()
    setTimeout(main, 60000)
}


main()
console.log('')
worker.getMarketRate(currency, requiredDepth)
// setInterval(getMarketRate, 10000, currency, requiredDepth)
worker.getLendingEarnings(currency)
worker.getActiveLoans(currency)
//main()

//getOpenLoanOffers(currency)

//getMarketDepth(currency)
//getCompleteBalances()
//getLendingEarnings(currency)