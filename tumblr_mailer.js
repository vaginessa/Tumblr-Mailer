var fs = require('fs');
var ejs = require('ejs');
var tumblr = require('tumblr.js');
var mandrill = require('mandrill-api/mandrill');
var mandrill_client = new mandrill.Mandrill('Dummy Key');

var csvFile = fs.readFileSync("friend_list.csv", "utf8");
var template = fs.readFileSync('email_template.ejs', 'utf-8');


function csvParse(file) {
	var data = [];

	var fileArray = csvFile.split('\n');

	var headers = fileArray.shift().split(',');

	fileArray.forEach(function(contact) {
		var arrayedContacts = contact.split(',');
		var contactObject = {};
		for (var i = 0; i < arrayedContacts.length; i++) {
				contactObject[headers[i]] = arrayedContacts[i];
			}
		data.push(contactObject);
		});
	return data;
}

 function sendEmail(to_name, to_email, from_name, from_email, subject, message_html){
    var message = {
        "html": message_html,
        "subject": subject,
        "from_email": from_email,
        "from_name": from_name,
        "to": [{
                "email": to_email,
                "name": to_name
            }],
        "important": false,
        "track_opens": true,    
        "auto_html": false,
        "preserve_recipients": true,
        "merge": false,
        "tags": [
            "Fullstack_Tumblrmailer_Workshop"
        ]    
    };
    var async = false;
    var ip_pool = "Main Pool";
    mandrill_client.messages.send({"message": message, "async": async, "ip_pool": ip_pool}, function(result) {
        // console.log(message);
        // console.log(result);   
    }, function(e) {
        // Mandrill returns the error as an object with name and message keys
        console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
        // A mandrill error occurred: Unknown_Subaccount - No subaccount exists with the id 'customer-123'
    });
 }


var friendList = csvParse(csvFile);
console.log(friendList);
var latestPosts = [];


// Authenticate via OAuth
var client = tumblr.createClient({ consumer_key: 'Dummy Key' });

client.posts('theroguedoge.tumblr.com', function (err, data) {
	for (var i = 0; i < data.posts.length; i++) {
		var dateDiff = data.posts[i].date.substring(8, 10) - 18
			if (dateDiff < 7) {
				latestPosts.push(data.posts[i]);
		}
	}
	friendList.forEach(function(row) {
    	var customisedTemplate = ejs.render(template, {
        	firstName: row['firstName'],
        	numMonthsSinceContact: row['numMonthsSinceContact'],
        	latestPosts: latestPosts
    	});
	
    sendEmail(row.firstName, row.emailAddress, 'Robbie Ferguson', 'robbieferguson139@gmail.com', 'Universities HATE him!', customisedTemplate);
    });
});

