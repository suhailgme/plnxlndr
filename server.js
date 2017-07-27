const express = require('express')
const path = require('path')
const jsonfile = require('jsonfile')
const plnxlndr = require('./plnxlndr')

let marketData = path.join(__dirname, './data/data.json')


const app = express()

app.get('/', (req, res) => {
    data = jsonfile.readFile(marketData, (err, marketData) =>{
        res.send(marketData)
    })
})



app.listen(3000, () => {
    console.log('App listening on port 3000')
})