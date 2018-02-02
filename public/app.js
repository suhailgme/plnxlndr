const movingAverages = $("#movingAverages")
let currency = 'BTC'


//apy: ((%rate/100) + 1)^365-1) * 100 = %APY
let maxRender = 100 //Render up to this many rates and indicators, set lower for better performance.

const getAPY = rate => ((Math.pow((Number(rate) + 1), 365) - 1) * 100).toLocaleString('en')

const backFill = (indicator, totalLength) => {
  let backFilledIndicator = []
  let render
  maxRender > totalLength ? render = totalLength : render = maxRender
  if (indicator.length < render) {
    backFilledIndicator = Array(render - indicator.length).fill(NaN)
    indicator.forEach((element) => {
      backFilledIndicator.push(element)
    })
  } else {
    backFilledIndicator = indicator.slice(-render)
  }
  return backFilledIndicator
}

const getData = () => {

  $.getJSON('data2.json', (json) => {
    $(".lastRate").find('h2').text('|Last Rate: ' + json.rate[json.rate.length - 1].rate + '%' +
      ' |Last Rate APY: ' + getAPY(json.rate[json.rate.length - 1].rate / 100) + '%' +
      ' |Last Rate APR: ' + (parseFloat(json.rate[json.rate.length - 1].rate) * 365).toFixed(3) + '%' +
      ' |At Market Depth: ' + json.rate[json.rate.length - 1].atDepth + ' BTC')
    $('<h2>|Lending Balance: ' + Number(json.balances.availableBalances.lending["BTC"]).toFixed(4) + ' BTC' +
        ' |On Orders: ' + Number(json.balances.allBalances.onOrders).toFixed(4) + ' BTC' +
        ' |Account Value: ' + Number(json.balances.allBalances.btcValue).toFixed(4) + ' BTC' + '</h2>' +
        '<h2>|Gross Earnings: ' + json.earnings.gross.toFixed(4) + ' BTC' +
        ' |Fees: ' + json.earnings.fees.toFixed(4) + ' BTC' +
        ' |Net Earnings: ' + json.earnings.net.toFixed(4) + ' BTC' + ' (Last 30 days)' + '</h2>').appendTo('.lastRate') +


      console.log(json)
    let totalLength = json.rate.length
    let dataMean = []
    let maxOrders = json.rate.slice(-maxRender)
    let maxEma10 = backFill(json.ema10, totalLength)
    let maxEma50 = backFill(json.ema50, totalLength)
    let maxSma100 = backFill(json.sma100, totalLength)
    let maxWouldLend = backFill(json.wouldLend, totalLength)
    //maxWouldLend.push(maxWouldLend[maxWouldLend.length-2]), 
    maxWouldLend.push(maxWouldLend[maxWouldLend.length - 1]), maxWouldLend = maxWouldLend.slice(-maxRender)

    console.log(maxWouldLend)
    let lendingRate = []
    let axis = []

    maxOrders.forEach((rateObject) => {
      dataMean.push(json.dataMean)
      lendingRate.push(rateObject.rate)
      if (rateObject.retrieved.slice(0, 10) === axis[0]) {
        axis.push(rateObject.retrieved.slice(16, 21))
      } else {
        axis.push(rateObject.retrieved.slice(0, 10))
      }
    })




    // Add active loans to the table
    if (json.activeLoans.length >= 1) {
      json.activeLoans.forEach((loan) => {
        let days
        Number(loan.duration) <= 1 ? days = ' Day' : days = ' Days'
        $('.activeLoans tbody').append('<tr><td>' + parseFloat(loan.amount).toFixed(4) + ' ' + loan.currency + '</td>' +
          '<td>' + (loan.rate * 100).toFixed(4) + '%' + '</td>' +
          '<td>' + getAPY(loan.rate) + '%' + '</td>' +
          '<td>' + loan.duration + days + '</td>' +
          '<td>' + moment.utc(loan.date).from(moment()) + '</td>' +
          //'<td>' + moment.utc(loan.date).local().format('YYYY-M-DD hh:mm A') + '</td>' +
          '</tr>')
      })
    } else {
      $('.activeLoans').hide()
    }

    if (json.openOffers[currency].length >= 1) {
      json.openOffers[currency].forEach((offer) => {
        $('.openOffers tbody').append('<tr><td>' + parseFloat(offer.amount).toFixed(4) + ' ' + currency + '</td>' +
          '<td>' + (offer.rate * 100).toFixed(4) + '%' + '</td>' +
          '<td>' + getAPY(offer.rate) + '%' + '</td>' +
          '<td>' + offer.duration + ' days' + '</td>' +
          '<td>' + moment.utc(offer.date).from(moment()) + '</td>'
        )
      })
    } else {
      $('.openOffers').hide()
    }


    // Bar chart, line chart and scatter chart shown with the last n lending rates, and simple/exponential averages,
    // in addition to Xs to indicate rates at which loans would be offered at if authorized.
    let chart = new Chart(movingAverages, {
      type: 'bar',
      data: {
        labels: axis,
        datasets: [{
            backgroundColor: '#0080ff',
            fill: false,
            label: '10 EMA',
            pointHitRadius: 4,
            data: maxEma10,
            type: 'line',
            pointRadius: 0,
            lineTension: 0.7,
            borderColor: '#0080ff'
          }, {
            backgroundColor: '#0080c0',
            fill: false,
            label: '50 EMA',
            data: maxEma50,
            type: 'line',
            pointRadius: 0,
            lineTension: 0,
            borderColor: '#0080c0',
            spanGaps: true,
          }, {
            backgroundColor: '#19ff00',
            fill: false,
            label: '100 SMA',
            data: maxSma100,
            type: 'line',
            pointRadius: 0,
            lineTension: 0.7,
            borderColor: '#19ff00',
            spanGaps: true,
          }, {
            backgroundColor: '#0020a0',
            fill: false,
            label: 'Data Mean',
            data: dataMean,
            type: 'line',
            pointRadius: 0,
            lineTension: 0.7,
            borderColor: '#0020a0',
          },
          {
            type: 'scatter',
            label: 'Offered Loan',
            data: maxWouldLend,
            fill: false,
            borderWidth: 0,
            backgroundColor: 'black',
            borderColor: 'rgba(0, 0, 0 , 0)',
            pointBackgroundColor: 'black',
            pointBorderColor: 'black',
            pointStyle: 'crossRot'

          },
          {
            fill: true,
            lineTension: 0.2,
            label: "Rate",
            backgroundColor: 'rgb(255, 99, 132)',
            borderColor: 'rgb(255, 99, 132)',
            data: lendingRate
          },
        ]
      },
      options: {
        scales: {
          yAxes: [{
            scaleLabel: {
              display: true,
              labelString: 'Lending Rate (%)',
              fontSize: 18
            }
          }]
        }
      }
    })

  })
}

$(document).ready(() => {
  getData()
  console.log(moment())
  $('.time').append(moment().format('MMM-DD-Y hh:mm:ss A'))
})