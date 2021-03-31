var express = require('express');
var router = express.Router();
var customerData = require('../data/customer.json');
var visitData = require('../data/visit.json');
var locationData = require('../data/location.json');

const SqliteToJson = require('sqlite-to-json');
const sqlite3 = require('sqlite3');
const exporter = new SqliteToJson({
  client: new sqlite3.Database('/Users/rudra/OneDrive/Desktop/Face Log Project/Face Log/Database/final.db')
});

let db=new sqlite3.Database('/Users/rudra/OneDrive/Desktop/Face Log Project/Face Log/Database/final.db');
const queryString = require('querystring');

// Refreshes the JSON file after every 5 seconds
const interval = setInterval(function () {
    //console.log("called after 5 seconds");
    exporter.save('customer_master', './data/customer.json', function (err) {
    });
    
    
    exporter.save('location_master', './data/location.json', function (err) {
      // no error and you're good.
    });
    exporter.save('visit_register', './data/visit.json', function (err) {
      // no error and you're good.
    });
  }, 5000);

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('home');
});

router.get('/customerData', (req, res)=> {

  res.sendFile('/Users/rudra/OneDrive/Desktop/Face Log Project/Website/data/customer.json');
});

router.get('/visitData', (req, res)=> {

  res.sendFile('/Users/rudra/OneDrive/Desktop/Face Log Project/Website/data/visit.json');
});

router.get('/locationData', (req, res)=> {

  res.sendFile('/Users/rudra/OneDrive/Desktop/Face Log Project/Website/data/location.json');
});

router.get('/maleVfemale', (req, res) => {
  let date = req.query.date;
  
  let sql = `SELECT  COUNT(CASE WHEN GENDER='Male' THEN 1 END) AS MALE, COUNT(CASE WHEN GENDER='Female' THEN 1 END) AS FEMALE FROM
  (SELECT DISTINCT visit_register.Customer_ID, customer_master.Gender FROM visit_register JOIN customer_master ON customer_master.Customer_ID= visit_register.Customer_ID)`;

  if(date == "week"){
    sql =  sql.slice(0,-1);
    sql = sql + ` WHERE Visit_Date >= strftime('%d/%m/%Y', 'now', '-7 days'));`;
  }

  else if(date == "month"){
    sql =  sql.slice(0,-1);
    sql = sql + ` WHERE Visit_Date >= strftime('%d/%m/%Y', 'now', '-12 days'));`;
  }

  else if(date == "year"){
    sql =  sql.slice(0,-1);
    sql = sql + ` WHERE Visit_Date >= strftime('%d/%m/%Y', 'now', '-12 days'));`;
  }
  

  db.all(sql, [], (err, rows) => {
    if (err) {
      throw err;
    }
    res.send(rows);
  });

});

router.get('/sentimentStatistics', (req, res) => {
  let date = req.query.date;
  let sql = `SELECT  COUNT(CASE WHEN Sentiment='happy' THEN 1 END) AS Happy, COUNT(CASE WHEN Sentiment='sad' THEN 1 END) AS Sad, COUNT(CASE WHEN Sentiment='neutral' THEN 1 END) AS Neutral, COUNT(CASE WHEN Sentiment='fear' THEN 1 END) AS Fear, COUNT(CASE WHEN Sentiment='angry' THEN 1 END) AS Angry, COUNT(CASE WHEN Sentiment='Surprise' THEN 1 END) AS Surprise, COUNT(CASE WHEN Sentiment='disgust' THEN 1 END) AS Disgust FROM (Select distinct Customer_ID, Visit_Date, Sentiment from visit_register) `;
  if(date == "week"){
    sql = sql +  `WHERE Visit_Date >= strftime('%d/%m/%Y', 'now', '-3 days');`;
  }

  //SELECT  COUNT(CASE WHEN Sentiment='happy' THEN 1 END) AS Happy, COUNT(CASE WHEN Sentiment='sad' THEN 1 END) AS Sad, COUNT(CASE WHEN Sentiment='neutral' THEN 1 END) AS Neutral, COUNT(CASE WHEN Sentiment='fear' THEN 1 END) AS Fear, COUNT(CASE WHEN Sentiment='angry' THEN 1 END) AS Angry, COUNT(CASE WHEN Sentiment='Surprise' THEN 1 END) AS Surprise, COUNT(CASE WHEN Sentiment='disgust' THEN 1 END) AS Disgust FROM visit_register WHERE Visit_Date >= strftime('%d/%m/%Y', 'now', '-3 days');
  else if(date == "month"){
    sql = sql +  `WHERE Visit_Date >= strftime('%d/%m/%Y', 'now', '-12 days');`;
  }
  else if(date == "year"){
    sql = sql +  `WHERE Visit_Date >= strftime('%d/%m/%Y', 'now', '-12 days');`;
  }
 

  db.all(sql, [], (err, rows) => {
    if (err) {
      throw err;
    }
    res.send(rows);
  });

});


router.get('/newVold', (req, res) => {
  let date = req.query.date;
  let sql = `SELECT  COUNT(CASE WHEN New_Customer='YES' THEN 1 END) AS NEW, COUNT(CASE WHEN New_Customer='NO' THEN 1 END) AS REPEATED from (SELECT DISTINCT Customer_ID, New_Customer, Visit_Date from visit_register) `;
  //SELECT  COUNT(CASE WHEN New_Customer='YES' THEN 1 END) AS NEW, COUNT(CASE WHEN New_Customer='NO' THEN 1 END) AS REPEATED FROM visit_register 
  if(date == "week"){
    sql = sql + `WHERE Visit_Date >= strftime('%d/%m/%Y', 'now', '-3 days');`;
  }
  else if(date == "month"){
    sql = sql + `WHERE Visit_Date >= strftime('%d/%m/%Y', 'now', '-12 days');`;
  }
  else if(date == "year"){
    sql = sql+  `WHERE Visit_Date >= strftime('%d/%m/%Y', 'now', '-12 days');`;
  }
 

  

  db.all(sql, [], (err, rows) => {
    if (err) {
      throw err;
    }
    res.send(rows);
  });

});

router.get('/ageDistribution', (req, res) => {
  let date = req.query.date;

  let sql =  `SELECT COUNT( CASE WHEN Age='0-2' THEN 1 END ) AS Age1,
  COUNT( CASE WHEN Age='4-6' THEN 1 END ) AS Age2,
  COUNT( CASE WHEN Age='6-8' THEN 1 END ) AS Age3,
  COUNT( CASE WHEN Age='8-12' THEN 1 END ) AS Age4,
  COUNT( CASE WHEN Age='15-20' THEN 1 END ) AS Age5,
  COUNT( CASE WHEN Age='25-32' THEN 1 END ) AS Age6,
  COUNT( CASE WHEN Age='38-43' THEN 1 END ) AS Age7,
  COUNT( CASE WHEN Age='48-53' THEN 1 END ) AS Age8,
  COUNT( CASE WHEN Age='60-100' THEN 1 END ) AS Age9 FROM (SELECT DISTINCT visit_register.Customer_ID, customer_master.Age FROM visit_register JOIN customer_master ON customer_master.Customer_ID= visit_register.Customer_ID)`;
   

  if(date == "week"){
     sql =  sql.slice(0,-1);
     sql = sql + ` WHERE Visit_Date >= strftime('%d/%m/%Y', 'now', '-3 days'));`;
  }

  else if(date == "month"){
    sql =  sql.slice(0,-1);
    sql = sql + ` WHERE Visit_Date >= strftime('%d/%m/%Y', 'now', '-12 days'));`;
  }

  else if(date == "year"){
    sql =  sql.slice(0,-1);
    sql = sql + ` WHERE Visit_Date >= strftime('%d/%m/%Y', 'now', '-12 days'));`;
  }



  db.all(sql, [], (err, rows) => {
    if (err) {
      throw err;
    }
    res.send(rows);
  });

});





module.exports = router;
