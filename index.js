const express = require("express")
const { use } = require("express/lib/application")
const res = require("express/lib/response")
const { home } = require("nodemon/lib/utils")


const app = express()
const port = 8080

const db = require ("./connection/db")





app.set("view engine", "hbs")    //set view engine


app.use("/public", express.static(__dirname + "/public"))  //set path folder public
app.use(express.urlencoded({extended: false}))


app.get("/home", function(req, res){
   console.log(blogs);
   
    db.connect(function (err, client, done){
        if (err) throw err

        
        client.query("SELECT * FROM tb_projects", function(err, result){
            if (err) throw err
            let data = result.rows
            

            data = data.map(function (item) {
                return {

                    ...item,
                    projectName: item.name,
                    description: item.description,
                    startDate: item.start_date,
                    endDate: item.end_date,
                    duration: getDistanceTime(new Date(item.start_date), new Date(item.end_date)),
                    nodejs: checkboxes(item.technologies[0]),
                    reactjs: checkboxes(item.technologies[1]),
                    java: checkboxes(item.technologies[2]),
                    python: checkboxes(item.technologies[3]),
 
                } 
                
            })
            
            res.render("index", {blogs: data})
            console.log(result.rows);

        })
    })
})



let blogs = [      
    {
        projectName: "ini tittle",
        description: "test", 
    }
]


app.get("/add-blog", function(req, res){
    res.render("add-blog")
})

app.post("/add-blog", function(req, res){

    let data = req.body

    data = {
        projectName: data.projectName,
        startDate: data.startDate,
        endDate: data.endDate,
        description: data.description,
        duration: getDistanceTime(data.startDate, data.endDate),
        nodejs: checkboxes(data.nodejs),
        reactjs: checkboxes(data.reactjs),
        java: checkboxes(data.java),
        python: checkboxes(data.python),

    }

    blogs.push(data)
    // console.log(data);
    res.redirect("/home")

})

function getDistanceTime(start, end) {
    let startDate = new Date(start)
    let endDate = new Date(end)

let distance = endDate - startDate



let miliseconds = 1000
let secondInHours = 3600
let hoursInDay = 24 
let dayInMonth = 31
let monthInYear = 12


let distanceYear = Math.floor(distance / (miliseconds* secondInHours * hoursInDay * dayInMonth * monthInYear)) //math.ceil bulatkan ke atas 
let distanceMonth = Math.floor(distance / (miliseconds * secondInHours * hoursInDay * dayInMonth))
let distanceDay = Math.floor(distance / (miliseconds * secondInHours * hoursInDay))
let distanceHours = Math.floor(distance / (miliseconds * 60 * 60))
let distanceMinutes = Math.floor(distance / (miliseconds * 60))
let distanceSeconds = Math.floor(distance / miliseconds)



    if (distanceYear > 0) {
        return`${distanceYear} Year`
    } else if (distanceMonth > 0) {
        return`${distanceMonth} Month`
    } else if(distanceDay > 0) {
        return `${distanceDay} day`
    } else if(distanceHours > 0) {
        return `${distanceHours} hours`
    } else if(distanceMinutes > 0) {
        return `${distanceMinutes} minutes`
    } else {
        return `${distanceSeconds} seconds`
    }
}

function getFullTime(waktu) {

    let month = ['Januari', 'Febuari', 'March', 'April', 'May', 'June', 'July', 'August', 'Sept', 'October', 'November', 'December']

    let date = waktu.getDate()

    let monthIndex = waktu.getMonth()

    let year = waktu.getFullYear()

    let hours = waktu.getHours()

    let minutes = waktu.getMinutes()

    let dateTime = `${date} ${month[monthIndex]} ${year}`

    return dateTime
}


app.get("/detail-blog/:id", function(req, res){
    const id = parseInt (req.params.id)
    
    
    db.connect(function (err, client, done){
        if (err) throw err

        client.query("SELECT * FROM tb_projects WHERE id=$1",[id], function(err, result){
              let data = result.rows
            // if (err) throw err

            data = data.map(function (item) {
                return {

                    ...item,
                    projectName: item.name,
                    description: item.description,
                    startDate: getFullTime(item.start_date),
                    endDate: getFullTime(item.end_date),
                    duration: getDistanceTime(item.start_date,item.end_date),
                    nodejs: checkboxes(item.technologies[0]),
                    reactjs: checkboxes(item.technologies[1]),
                    java: checkboxes(item.technologies[2]),
                    python: checkboxes(item.technologies[3]),
 
                } 
                
            })
            
            res.render("detail-blog", {blogs: data})
            console.log(result.rows);

        })
    })
    

})

app.get("/detail-blog/:index", function(req, res){

   
    let index = req.params.index
    let detail = blogs[index]

    res.render("detail-blog", detail)

})

app.get("/update-blog/:index", function(req, res){
    let index = req.params.index
    let dataBlogs = blogs[index]
    res.render("update-blog", {project: dataBlogs,index})

    
})


app.post("/update-blog/:index", function(req, res){
    let data = req.body
    let index = req.params.index
    
   blogs[index].projectName = data.projectName;
   blogs[index].description = data.description;
   blogs[index].startDate = data.startDate
   blogs[index].endDate = data.endDate
   blogs[index].duration = getDistanceTime(data.startDate, data.endDate)
   blogs[index].nodejs = checkboxes(data.nodejs)
   blogs[index].reactjs = checkboxes(data.reactjs)
   blogs[index].java = checkboxes(data.java)
   blogs[index].python = checkboxes(data.python)

   
   res.redirect("/home")


})

// condition icon tech 
function checkboxes(render){
    if (render == "true") {
        return true
    } else {
        return false 
    }
}


app.get("/delete-blog/:id", function(req, res){

    const id = parseInt(req.params.id)
    blogs.splice(id,1)
    res.redirect("/home")  
})


app.get("/form", function(req, res){
    res.render("form")
})


app.listen(port, function(){
    console.log(`listening server on port ${port}`);
})