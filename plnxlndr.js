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
const moment = require('moment')
ta.setConfig('precision', 3) //round all ta to 3 decimal places max

let currency = 'BTC'
let requiredDepth = 33 // Rates will be checked at this market depth
let ratesToKeep = 5000 // Keep 5,000 lending rates
let refreshRate = 60000 // 60s default
let minLoanRate = 0.0400 //Minimum rate to offer a loan for (0.04% is ~ 15.8% APY, 14.6% APR)
let offerAmount = 0.05 // Amount of currency to be lent per offer
let offerDuration = 2 // Number of days to offer loans for
let maxLoanOffers = 1 // Maximum number of open loan offers allowed
let offerTimeOut = 1200000 // Max time to leave offer open for (1200s or 20 min)

let file = path.join(__dirname, './public/data2.json')
let loanMarketData = {
  rate: [],
  wouldLend: []
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
    //Write the bot start date and time in user's timezone
    loanMarketData.runDate = Date()

  })
}

const writeMarketData = () => {
  jsonfile.writeFile(file, loanMarketData, {
    spaces: 1
  }, ((err) => {
    if (err) console.error(err)
  }))
}


const analyzeMarketData = () => {
  let marketRates = []
  if (loanMarketData.rate.length > 1) {
    loanMarketData.rate.forEach((offer) => {
      marketRates.push(parseFloat(offer.rate))
    })
    // 10 period exponential moving average, where period is refresh rate
    loanMarketData.ema10 = (ta.ema({
      period: 10,
      values: marketRates
    }))
    // 50 period exponential moving average
    loanMarketData.ema50 = (ta.ema({
      period: 50,
      values: marketRates
    }))
    loanMarketData.sma100 = (ta.sma({
      period: 100,
      values: marketRates
    }))
    // Historical average since start
    loanMarketData.dataMean = stats.mean(marketRates).toFixed(4)
    // SD of historical average
    //loanMarketData.standardDeviation = stats.sampleStandardDeviation(marketRates)
    // zScore of last rate relative to historical average
    //loanMarketData.zScore = stats.zScore(loanMarketData.rate[loanMarketData.rate.length - 1], loanMarketData.mean, loanMarketData.standardDeviation).toFixed(4)
  } else {
    console.log(`${Date().slice(16,24)}: More rates needed for statistical analysis.`)
  }
}

const lendingStrategy = () => {

  let analysisDepth = 50 //analyze last 50 rates 
  if (loanMarketData.rate.length > 1) {
    var rates = loanMarketData.rate.slice(-analysisDepth)
    var ema10 = loanMarketData.ema10.slice(-analysisDepth)
    var ema50 = loanMarketData.ema50.slice(-analysisDepth)

    console.log('EMA 10', ema10[ema10.length - 1], 'EMA 50', ema50[ema50.length - 1])
    console.log('EMA 10 > EMA 50?', ema10[ema10.length - 1] > ema50[ema50.length - 1]);
    console.log('Rate - 1 ', parseFloat(rates[rates.length - 1].rate), 'Rate - 2', parseFloat(rates[rates.length - 2].rate))
    console.log('Rate - 1 <= Rate - 2?', parseFloat(rates[rates.length - 1].rate) <= parseFloat(rates[rates.length - 2].rate))
    console.log('Rate - 1 > EMA 50?', parseFloat(rates[rates.length - 1].rate) > ema50[ema50.length - 1])

    // Check if open offers exceed the maximum offer time, and if so, cancel them.
    loanMarketData.openOffers[currency].forEach((offer) => {

      if ((Math.abs(moment.utc(offer.date).local().diff(moment()))) > offerTimeOut) {
        //console.log(Math.abs(moment.utc(offer.date).local().diff(moment())))
        worker.cancelLoanOffer(offer.id)
      }
    })

    // Offer loan if 10 EMA is greater than 50 EMA (uptrend) and the lending rates 
    // are not still rising (last rate must be less than or equal to the second to last rate).
    // The rate must also be greater than the ema 50 to ensure sudden drops in the rate are not offered.
    if ((ema10[ema10.length - 1] > ema50[ema50.length - 1] && parseFloat(rates[rates.length - 1].rate) <= parseFloat(rates[rates.length - 2].rate)) && parseFloat(rates[rates.length - 1].rate) > ema50[ema50.length - 1]) {
      console.log('Offering loan at: ', rates[rates.length - 1].rate)
      loanMarketData.wouldLend.push(rates[rates.length - 1].rate)
      // Loans are only offered if you have fewer than maximum user setting and your lending balance is greater
      // than the minimum offer amount 
      if (loanMarketData.openOffers[currency].length < maxLoanOffers && parseFloat(loanMarketData.balances.availableBalances.lending[currency]) >= offerAmount) {
        console.log('Offer rate > open offer rate?', parseFloat(rates[rates.length - 1].rate) > parseFloat(loanMarketData.openOffers[currency].rate))
        // If the latest rate is greater than an existing offer, cancel it and offer a loan at the higher rate.
        if (parseFloat(rates[rates.length - 1].rate) > parseFloat(loanMarketData.openOffers[currency].rate)) {
          worker.cancelLoanOffer(loanMarketData.openOffers[currency].id)
          worker.makeLoanOffer(currency, offerAmount, offerDuration, 0, parseFloat(rates[rates.length - 1].rate) / 100)
        } else {
          worker.makeLoanOffer(currency, offerAmount, offerDuration, 0, parseFloat(rates[rates.length - 1].rate) / 100)
        }
      }
    } else {
      loanMarketData.wouldLend.push(NaN)
    }
  }
}


const accountDetails = () => {
  //User called update prints the earnings from loans, open loan offers, and active loans
  //console.log('')
  worker.getLendingEarnings(currency)
    .then((earnings) => {
      loanMarketData.earnings = earnings
    })
    .catch(err => logErr(err))
  worker.getCompleteBalances(currency)
    .then(balances => loanMarketData.balances = balances)
    .catch(err => logErr(err))
  worker.getActiveLoans(currency)
    .then(loans => loanMarketData.activeLoans = loans)
    .catch(err => logErr(err))
  worker.getOpenLoanOffers(currency)
    .then(openOffers => loanMarketData.openOffers = openOffers)
    .catch(err => logErr(err))
}

const logErr = err => {
  console.error(err)
}

const main = () => {
  //get lending rate at user's required market depth and write it to file.
  worker.getMarketRate(currency, requiredDepth)
    .then((rate) => {
      loanMarketData.rate.push(rate)
      analyzeMarketData()
      accountDetails()
      writeMarketData()
      lendingStrategy()

    })
    .catch(err => console.error(err))
  //worker.getCompleteBalances()
  //lendingStrategy()
  setTimeout(main, refreshRate)
}

loadMarketData()
main()
