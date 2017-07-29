/*
  Plnxlndr is a cryptocurrency trading bot for the Poloniex exchange written 
  in node. It features lending methods using statistical analysis to determine
  the optimal lending rate to offer.
  If you are interested in how plnxlndr works, read more about it here: 
  https://github.com/suhailgme/plnxlndr/blob/master/README.md
  Disclaimer:
  USE AT YOUR OWN RISK!
  The author of this project is NOT responsible for any damage or loss caused 
  by this software. There can be bugs and the bot may not perform as expected 
  or specified. Please use discretion when using this software and lend responsibly.
*/
const path = require('path')
const worker = require('./worker')
const jsonfile = require('jsonfile')
const stats = require('simple-statistics')
const fs = require('fs')

let currency = 'BTC'
let requiredDepth = 33 // Rates will be checked at this market depth
let ratesToKeep = 5000 // Keep 5,000 lending rates
let refreshRate = 10000 // 60s default
let coinSplit = 0.25 // Lend 1/4 of available coins at a time
let file = path.join(__dirname, './data/data.json')
let loanMarketData = {
    rate: []
}



const loadMarketData = () => {
    jsonfile.readFile(file, (err, data) => {
        if (err) {
            console.log(`Lending market data file does not exist. Creating "data.json" in ${path.join(__dirname +'/data')}`)
            jsonfile.writeFile(file, loanMarketData, (err) => {
                if (err) console.log('Error creating data.json')
            })
        } else {
            loanMarketData = data
        }

    })
}



const main = () => {
    //get lending rate at user's required market depth and write it to file.
    worker.getMarketRate(currency, requiredDepth)
        .then((rate) => {
            loanMarketData.rate.push(rate)
            //Write the date and time of the last call to getMarketRate in user's timezone
            loanMarketData.date = Date()
            jsonfile.writeFile(file, loanMarketData, {
                spaces: 2
            }, ((err) => {
                if (err) console.error(err)
            }))
            lendingStrategy();
            userUpdate()
        })
        .catch(err => console.error(err))
    //worker.getCompleteBalances()
    setTimeout(main, refreshRate)
}

const lendingStrategy = () => {
    let offerTimeOut = 120000 // Max time to leave offer open for (120s)
    let offerLength = 2 // Number of days to offer loan for
    if (loanMarketData.rate.length > 1) {
        loanMarketData.mean = stats.mean(loanMarketData.rate).toFixed(4)
        loanMarketData.standardDeviation = stats.sampleStandardDeviation(loanMarketData.rate)
        loanMarketData.zScore = stats.zScore(loanMarketData.rate[loanMarketData.rate.length - 1], loanMarketData.mean, loanMarketData.standardDeviation).toFixed(4)
        let sma5 = stats.mean(loanMarketData.rate.slice(-5)).toFixed(4)
        loanMarketData.sma5 = sma5

    } else {
        console.log(`${Date().slice(16,24)}: More rates needed for statistical analysis.`)
    }
}

const userUpdate = () => {
    //User called update prints the earnings from loans, open loan offers, and active loans
    //console.log('')
    worker.getMarketRate(currency, requiredDepth)
    worker.getLendingEarnings(currency)
    worker.getOpenLoanOffers(currency)
    worker.getCompleteBalances()
    worker.getActiveLoans(currency)


}

loadMarketData()
main()
//userUpdate()