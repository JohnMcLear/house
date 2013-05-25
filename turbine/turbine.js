/* 
Edit Settings.js, providing your email settings etc.
Set this up as a cron job to run every 5 minutes.
You need Internet access, an ADC board, a Pi, A wind Turbine, A way to get a 5v signal onto the ADC from the turbine, I use a Car USB charger... 
*/
var request = require("request"), async = require("async"), email = require("emailjs"), sys = require('sys'), settings = require("./settings.js"), exec = require('child_process').exec;
var date = new Date();
var time = date.toISOString();
var metOfficeUrl = "http://datapoint.metoffice.gov.uk/public/data/val/wxobs/all/json/"+settings.metOfficeLocation+"?res=hourly&key="+settings.metOfficeKey + "&time="+time;

// console.log(metOfficeUrl);
console.log("Est wind speed turbine should spin at: " +settings.estWindSpeedOfWindy + "mph");
async.waterfall([
  
  /* Should it be windy?  We make a call to the met office and ask them */
  function shouldItBeWindy(callback){
    request(metOfficeUrl, function (error, response, body) { // HTTP API Request
      if (!error && response.statusCode == 200) {
        body = JSON.parse(body); // Response
        if ( body.SiteRep.DV.Location.Period.Rep.S >= settings.estWindSpeedOfWindy){
          console.log("Wind speed outside according to met office is:", times[i]["S"]);
          console.log("Do We expect the turbine to be spinning?", times[i]["S"] >= settings.estWindSpeedOfWindy);
          callback(null, true); // calls back if its windy or not
        }else{
          console.log("It is not even windy enough to care");
          callback(null, false); // ist not even windy enough to care
        } 
      }
      if(error){
        callback("HTTP Request Error", error);
      }
    });
  },
  
  /* Is the Pi recieving a message from the ADC Board that we have a successful power read */
  function isItWindyAccordingToTurbine(shouldBeWindy, callback){
    if(shouldBeWindy){
      exec("python turbineGenerating.py 0 0x68", function (error, stdout, stderr) { 
        if (error === null) { 
          console.log("The turbine is generating power, yay :)"); // it is, so no drama :)
          callback(null, true);
        }else{
          console.log("The turbine should be generating power but isn't...."); // it isn't so let the owner know
          callback(null, false);
        }
      });
    }else{
      callback(null, true); // it shouldnt be windy anyway..
    }
  },
  
  /* Send an Email to me to let me know something is b0rked */
  function sendEmail(isWindy, callback){
    if(!isWindy){
      server.send(message, function(err, message) { 
        console.log(err || message); 
        if(err){
          callback("Email error sending", err);
        }
      });
    }
  }
], function(err, result){
  if(err){
    throw new Error(err);
  }
});

var server  = email.server.connect({
   user:    settings.gmailUsername, 
   password:settings.gmailPassword, 
   host:    "smtp.gmail.com", 
   ssl:     true
});
var message = {
   text:    "The turbine isn't working properly..", 
   from:    "Wind Turbine <"+settings.fromEmail+">", 
   to:      "someone <"+settings.emailAddress+">",
   subject: "Turbine isn't generating when it should be"
};
