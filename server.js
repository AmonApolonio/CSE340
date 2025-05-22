/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/
/* ***********************
 * Require Statements
 *************************/
const express = require("express")
const env = require("dotenv").config()
const app = express()
const static = require("./routes/static")
const inventoryRoute = require("./routes/inventoryRoute")
const expressLayouts = require("express-ejs-layouts")
const baseController = require("./controllers/baseController")
const errorRoute = require("./routes/errorRoute")
const utilities = require("./utilities/")
const session = require("express-session")
const pool = require('./database/')

/* ***********************
 * Middleware
 * ************************/
 app.use(session({
  store: new (require('connect-pg-simple')(session))({
    createTableIfMissing: true,
    pool,
  }),
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  name: 'sessionId',
}))

// Express Messages Middleware
app.use(require('connect-flash')())
app.use(function(req, res, next){
  res.locals.messages = require('express-messages')(req, res)
  next()
})

/* ***********************
 * View Engine and Templates
 *************************/
app.set("view engine", "ejs")
app.use(expressLayouts)
app.set("layout", "./layouts/layout") // not at views root

/* ***********************
 * Routes
 *************************/
app.use(static)
// Index route
app.get("/", baseController.buildHome)
// Inventory routes
app.use("/inv", inventoryRoute)
// Error route
app.use("/error", errorRoute)

/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT
const host = process.env.HOST

// Error handling middleware
app.use(async (err, req, res, next) => {
  const status = err.status || 500
  let nav = await utilities.getNav()
  res.status(status)
  res.render("error", {
    title: "Server Error",
    error: err,
    nav
  })
})

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`)
})
