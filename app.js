const express = require("express")
const https = require('https')
const bodyParser = require('body-parser')
const request = require('request')
const { text } = require("body-parser")
const app = express()

var items = ["Buy Food", "Cook Food", "Eat Food"]
var groceries = []

app.use(express.static("public"))
app.use(bodyParser.urlencoded({extended:true}))
app.use(express.static("public"))

app.set('view engine', 'ejs') // initialize the ejs module in the app


// Get request

// Home page get request 
app.get('/', function(req, res){

    var today = new Date() // this method initialises the Date and Time Object 
    var currentDay = today.getDay() // getDate() is used to get today's date 
    
    var options = {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
    }
    
    var day = today.toLocaleDateString('en-us', options)
    
    res.render("list", {
        kindOfDay: day,
        newListItems: items,
    })  // will look for views folder in the directory and then look for the file name provided as first parameter and second parameter is a java script object to store variable to be is used via html code using ejs....
})


// Groceries page get request 
app.get('/groceries', (req, res)=>{
    res.render('groceries', {
        groc: groceries
    })
})

// Post request 


// Home page post req
app.post('/', function(req, res){

    var addItem = req.body.hasOwnProperty('button')
    var lastElm = (items.length-1)

    if (addItem){
        items.push(req.body.newItem)
    }else{
        items.pop(lastElm)
    }
    res.redirect('/')

})


// Groceries page post req 
app.post('/groceries', (req, res)=>{
    var addItem = req.body.hasOwnProperty('button') // Has own property checks if a key exists in an object
    var lastElm = (groceries.length-1)

    if (addItem){
        groceries.push(req.body.newItem)
    }else{
        groceries.pop(lastElm)
    }
    res.redirect('/groceries')

})


// Server
app.listen(process.env.PORT || 3000, function(req, res){
    console.log("Server is running on port 3000");
})


// previous logic for add button 

// app.post('/', function(req, res){
//     items.push(req.body.newItem)
//     res.redirect('/')
// })