const express = require("express")
const https = require('https')
const bodyParser = require('body-parser')
const request = require('request')
const { text } = require("body-parser")
const app = express()
const mongoose = require('mongoose')

const _ = require('lodash')

// Old way to store data 
// var items = ["Buy Food", "Cook Food", "Eat Food"]
// var groceries = []

app.use(express.static("public")) // will allow express to look into the public folder for static files.
app.use(bodyParser.urlencoded({extended:true}))

app.set('view engine', 'ejs') // initialize the ejs module in the app

// Connecting app to database 
const urlDB = 'mongodb+srv://adam2053:adamMaratha@cluster0.xjrvkwb.mongodb.net/todolistDB'
mongoose.connect(urlDB)

// Creating list-items schema

const itemsSchema = {
    name:String
}

// list schema

const listSchema  = {
    name:String,
    items: [itemsSchema]
}

const List = mongoose.model('list', listSchema)


// Creating mongoose model 

const Item = mongoose.model('item', itemsSchema)
const Grocery = mongoose.model('grocery', itemsSchema)

const defaultItems = []

// Get request

// Home page get request 
app.get('/', function(req, res){

    Item.find({}, (err, foundItems)=>{
        res.render("list", {
            kindOfDay: 'Today',
            newListItems: foundItems
        })
    })

})


// Groceries page get request 
app.get('/groceries', (req, res)=>{
    Grocery.find({}, (err, foundItems)=>{
        res.render('groceries', {
            groc: foundItems
        })
    })
})

// Post requests


// Home page post req
app.post('/', function(req, res){

    var addItem = req.body.hasOwnProperty('button')
    const listName = req.body.button
    const lName = req.body.remove
    const itemName = req.body.newItem
    const item = new Item({
        name:itemName
    })


    if(addItem){
        if(listName === 'Today'){
            item.save()
            res.redirect('/')
        }else{
            List.findOne({name:listName}, (err, foundList)=>{
                foundList.items.push(item)
                foundList.save()
                res.redirect(`/${listName}`)
            })
        }
    }else{
        if(lName === 'Today'){
            Item.find({}, (err, found)=>{
                var lastElm = found[found.length-1]._id
                Item.findByIdAndDelete(lastElm, (err)=>{
                    if(err){
                        console.log(err);
                    }else{
                        console.log('done');
                    }
                })
            })
            
            res.redirect('/')
        }else{
            List.find({}, (err, found)=>{
                const array = found[found.length-1].items
                const lastId = array[array.length-1]._id
                List.findOneAndUpdate({name:lName}, {$pull: {items: {_id:lastId}}}, (err, foundList)=>{
                    if(!err){
                        res.redirect(`/${lName}`)
                    }
                })
            })
        }
    }

})

app.post('/delete', (req, res)=>{

    const checkedboxId = req.body.checkbox
    const listName = req.body.name

    if(listName==='Today'){
        Item.findByIdAndDelete(checkedboxId, (err)=>{
            if(err){
                console.log(err);
            }else{
                console.log('done');
            }
        })
        res.redirect('/')
    }else{
        List.findOneAndUpdate({name: listName}, {$pull: {items:{_id:checkedboxId}}}, (err, foundList)=>{
            if(!err){
                res.redirect(`/${listName}`)
            }
        })
    }

})


// Groceries page post req 

app.post('/groceries', function(req, res){
    var button = req.body.hasOwnProperty('button')
    var remove = req.body.hasOwnProperty('remove')
    // var lastElm = (groceries.length-1)
    if (button) {
        const itemName = req.body.newItem
        const groc = new Grocery({
            name:itemName
        })
        groc.save()

        res.redirect('/groceries')
    }else if (remove) {

        Grocery.find({}, (err, found)=>{
            Grocery.findByIdAndDelete(found[found.length-1]._id, (err)=>{
                if(err){
                    console.log(err);
                }else{
                    console.log('deleted');
                }
            })
        })

        res.redirect('/groceries')
    }else {
        Grocery.findByIdAndDelete(req.body.checkbox, (err)=>{
            if(err){
                console.log(err);
            }else{
                console.log('deleted via checkbox');
            }
        })
        res.redirect('/groceries')
    }
})

// Dynamic route parameters
app.get('/:customListName', (req, res)=>{
    const customListName = _.capitalize(req.params.customListName)
    

    List.findOne({name: customListName}, (err, foundList)=>{
        if(!err){
            if(!foundList){
                // create new list
                const list = new List({
                    name: customListName,
                    items: defaultItems
                })
                list.save()
                res.redirect(`/${customListName}`)

            }else{
                // show existing list
                res.render('list', {
                    kindOfDay: foundList.name,
                    newListItems: foundList.items
                })
            }
        }
    })

})


// Server
app.listen(process.env.PORT || 3000, function(req, res){
    console.log("Server is running on port 3000");
})

