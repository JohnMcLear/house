# USRF

## Wind Turbine

### Getting started

* apt-get install nodejs python 
* follow this guide: https://github.com/abelectronicsuk/deltasigmapi
* clone the repo git://github.com/JohnMcLear/house.git
* cd house/turbine
* npm install request
* sudo up (or become root, it's sad but this is required) ;(
* create a settings.js file that looks like the settings.js section below
* test with node turbine.js
* create job to run however often you want, sadly the cron job will have to run as root :(

### example settings.js file
```
/* Change me */
var settings = {};
settings.estWindSpeedOfWindy = 5; // Change me to the mph you expect your turbine will generate energy at
settings.metOfficeLocation = 3344; // Your Met Office location -- get this from the met office wesite
settings.metOfficeKey = "8jklsjdfklsjdf-sdf--sdf-s-df-sd-f"; // Your met office datapoint API key
settings.fromEmail = "mygmail@gmail.com"; // The email addy we're sending from
settings.emailAddress = "john@mclear.co.uk"; // The email addy to send to
settings.gmailUsername = "mygmsdfklj"; // our gmail username
settings.gmailPassword = "s3re3t"; // our gmail passwd
/* End of Change me section */
module.exports = settings;
```
