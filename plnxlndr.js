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
const ta = require('technicalindicators')
ta.setConfig('precision', 3)

let currency = 'BTC'
let requiredDepth = 33 // Rates will be checked at this market depth
let ratesToKeep = 5000 // Keep 5,000 lending rates
let refreshRate = 60000 // 60s default
let coinSplit = 0.25 // Lend 1/4 of available coins at a time
let minLoanRate = 0.0400 //Minimum rate to offer a loan for (0.04% is ~ 15.8% APY)

let file = path.join(__dirname, './public/data.json')
let loanMarketData = {
  rate: [],
}





const loadMarketData = () => {
  jsonfile.readFile(file, (err, data) => {
    if (err) {
      console.log(`Lending market data file does not exist. Creating "data.json" in ${path.join(__dirname +'/data')}`)
      jsonfile.writeFile(file, loanMarketData, (err) => {
        if (err) console.log('Error creating data.json')
      })
    } else {
      console.log('Found data.json')
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
        spaces: 1
      }, ((err) => {
        if (err) console.error(err)
      }))
      analyzeMarketData();
      userUpdate()
    })
    .catch(err => console.error(err))
  //worker.getCompleteBalances()
  setTimeout(main, refreshRate)
}

const analyzeMarketData = () => {
  let marketRates = []
  if (loanMarketData.rate.length > 1) {
    loanMarketData.rate.forEach((offer) => {
      marketRates.push(parseFloat(offer.rate))
    })
    loanMarketData.ema10=(ta.ema({period: 10, values: marketRates}))
    loanMarketData.ema50=(ta.ema({period: 50, values: marketRates}))
    loanMarketData.sma100=(ta.sma({period: 100, values: marketRates}))
    // Historical average since start
    loanMarketData.dataMean = stats.mean(marketRates).toFixed(4)
    // SD of historical average
    //loanMarketData.standardDeviation = stats.sampleStandardDeviation(marketRates)
    // zScore of last rate relative to historical average
    //loanMarketData.zScore = stats.zScore(loanMarketData.rate[loanMarketData.rate.length - 1], loanMarketData.mean, loanMarketData.standardDeviation).toFixed(4)
    // 5 period simple moving average, where period is refresh rate
    //loanMarketData.sma5 = stats.mean(marketRates.slice(-5)).toFixed(4)
    // 10 period simple moving average, where period is refresh rate
    //loanMarketData.sma10 = stats.mean(marketRates.slice(-10)).toFixed(4)
    //loanMarketData.sma10.push(stats.mean(marketRates.slice(-10)).toFixed(4))
    // 50 period simple moving average, where period is refresh rate
    //loanMarketData.sma50 = stats.mean(marketRates.slice(-50)).toFixed(4)
    //loanMarketData.sma50.push(stats.mean(marketRates.slice(-50)).toFixed(4))

  } else {
    console.log(`${Date().slice(16,24)}: More rates needed for statistical analysis.`)
  }

}

const lendingStrategy = () => {
  let offerTimeOut = 120000 // Max time to leave offer open for (120s)
  let offerLength = 2 // Number of days to offer loan for

}

const userUpdate = () => {
  //User called update prints the earnings from loans, open loan offers, and active loans
  //console.log('')
  worker.getLendingEarnings(currency)
  //worker.getOpenLoanOffers(currency)
  worker.getCompleteBalances(currency)
  worker.getActiveLoans(currency)
    .then(loans => loanMarketData.activeLoans = loans)
    .catch(err => console.error(err))
  //worker.makeLoanOffer('BTC', 0.25, 30, 0, 0.0339)
  //worker.cancelLoanOffer('534664991')
}


loadMarketData()
//userUpdate()
main()

// console.log(`${Date().slice(16,24)}: Account balance: ${JSON.stringify(balances['BTC'])}`))
// console.log(`${Date().slice(16,24)}: Available balances ${JSON.stringify(availableBalances)}`)
