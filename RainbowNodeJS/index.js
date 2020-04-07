// Import modules
require('dotenv').config();
const fs = require("fs");
const path = require('path');
const express = require ('express');
const bodyParser = require ('body-parser');
const favicon = require('express-favicon');
const app = express();
var MongoClient = require("mongodb").MongoClient;
var _ = require("underscore");
var cors = require('cors');

// Define variables
const url = 'mongodb://heroku_1whs0tq1:kq8e627o53cv9trrtd6q07n00i@ds119728.mlab.com:19728/heroku_1whs0tq1';    // Connection url
const dbName = 'heroku_1whs0tq1';           // Database Name
var matchedDict = {};                       // Initialize dictionary to check if agent is attached to a customer
var skillsDict = {};                        // Initialize dictionary to attach customer to a requested skill
var connChecked = {};                       // Initialize dictionary to check if connection has been checked where each value is Boolean

// Load the SDK
const ChatBot = require("rainbow-chatbot");
const RainbowSDK = require("rainbow-node-sdk");

// Define your configuration
const options = require("./options.json");

// Load the scenario for chatbot
const scenario = require("./scenario.json");

// Function to create new Guest Account
async function createGuest(firstName, lastName) {
    // create the guest account
    let language = "en-US";
    let ttl = 86400; // active for a day
    let guest = await nodeSDK.admin.createGuestUser(firstName, lastName, language, ttl);
    let guestId = guest.id;

    // initialize boolean dictionary
    connChecked[guestId] = false;

    // store guests' details into JSON file
    let filePath = path.join(__dirname,`${guestId}.json`)
    fs.writeFileSync(filePath, JSON.stringify(guest, null, 2));
    
    // chatbot to automatically send message to guest user
    let guestContact = await nodeSDK.contacts.getContactById(guestId, true);
    let conversation = await nodeSDK.conversations.openConversationForContact(guestContact);
    await nodeSDK.im.sendMessageToConversation(conversation, `Hello, I am the customer support bot for ABC Bank. If you require any assistance, please type #support.\nTo check for agents' availability, please type #availability.`);

    return filePath
}

// USING RAINBOW WEB SDK (BACKEND TO SIGNAL TO FRONT END)
// Function to establish connection between Agent and Customer
async function establishConnection(agentId, skill, customerName) {
    // open conversation between agent and customer
    console.log(`This is the agent's Id: ${agentId}`);
    let agentContact = await nodeSDK.contacts.getContactById(agentId, true);
    let conversation = await nodeSDK.conversations.openConversationForContact(agentContact);
    await nodeSDK.im.sendMessageToConversation(conversation, `Hello, I am ${customerName}. I need your help in ${skill}!`);
}

// Function to check for available agents via MongoDB
async function checkAgents (skill, customerId, count) {
    MongoClient.connect(url, {useUnifiedTopology: true}, async function(err, client) {
        const col = client.db(dbName).collection(skill);

        // check if any available agents
        result = await col.find({"presence": "online"}, {sort: {"chatsReceived": 1}, limit: 1}).toArray()
        console.log(result.length);
        if (result.length == 1) {
            console.log(result[0]["id"]);
            var agentId = result[0]["id"];
            if (matchedDict[agentId] == "") {
                matchedDict[agentId] = customerId;
                col.updateOne({"id": agentId}, {$set:{"presence": "busy"}});    // temporarily change agent's presence status
            }
        } else if (count <= 30) {
            console.log('No document matches the provided query.');
            count = count + 1;
            checkAgents (skill, customerId, count);
        }
    });
}

// Function to clear guest data
async function clearGuest(id, skill, agent) {
    let agentId;
    let customerId;

    if (agent) {
        agentId = id;
        customerId = matchedDict[id];
    }
    else {
        customerId = id;
        agentId = _.invert(matchedDict)[id];
    }
    
    console.log("Skill is: " + skill);

    MongoClient.connect(url, {useUnifiedTopology: true}, async function(err, client) {
        const col = client.db(dbName).collection(skill);
        col.updateOne({"id": agentId}, {$set:{"presence": "online"}})  // change back the presence of the agent on MongoDB
        .then (() => {
            matchedDict[agentId] = "";
            delete skillsDict[customerId]; 
        })
        .catch((err) => console.error(`Error: ${err}`))
    })
}

// Function to list the number of available agents in each skill category
async function availability(customerId, skill, content) {

    // Send customer a message indicating the number of agents available
    let customerContact = await nodeSDK.contacts.getContactById(customerId, true);
    console.log("Got customer contact")
    let conversation = await nodeSDK.conversations.openConversationForContact(customerContact);
    console.log("Got conversation")
    var totalCount;
    var availableCount;

    // Count the number of available agents
    MongoClient.connect(url, {useUnifiedTopology: true}, async function(err, client) {
        const col = client.db(dbName).collection(skill);

        await col.countDocuments(function (err, count) {
            if (!err) {
                console.log("Mongo Total Count is: " + count)
                totalCount = count;
            }
        })
        await col.countDocuments({"presence": "online"}, function (err, count) {
            if (!err) {
                console.log("Mongo Available Count is: " + count)
                availableCount = count;
                nodeSDK.im.sendMessageToConversation(conversation, `There are ${availableCount}/${totalCount} agents available in the ${content} category`);
            }
        })
    })
}

// Instantiate the SDK
nodeSDK = new RainbowSDK(options);
nodeSDK.start().then( () => {
    // Start the bot
    chatbot = new ChatBot(nodeSDK, scenario);
    return chatbot.start();
   
}).then( () => {
    // CREATE THE GUEST ACCOUNT
    app.use(cors());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());
    app.use(favicon(__dirname + '/public/favicon.ico'));

    // GET request when creating guest account
    app.get('/create_guest', function(req,res){
        res.setHeader('Access-Control-Allow-Origin', '*')
        console.log("This is the query: " + req.query);

        var firstName = req.query.firstName;
        var lastName = req.query.lastName;
        console.log (`First Name is ${firstName}, Last Name is ${lastName}`)
        createGuest(firstName, lastName).then ( (filePath) => {
            console.log(`This is the file path ${filePath}`)
            res.sendFile(filePath) 
        })
        .catch((err) => console.error(`Error: ${err}`));
    })

    // GET request for agent ID to establish connection
    app.get('/establish_connection', function(req,res) {
        res.setHeader('Access-Control-Allow-Origin', '*')
        console.log("This is the query: " + req.query);

        var customerId = req.query.id;
        let dict = {};
        dict["agentId"] = "";
        dict["skill"] = "";
        dict["message"] = "Not matched with Agent";
        dict["connection"] = false;

        console.log("Connection checked: " + connChecked[customerId]);
        // check if attempt to establish connection is done
        if (connChecked[customerId] == true) {
            // check if customer is assigned to an agent
            if (customerId in _.invert(matchedDict) && customerId != "") {
                dict["agentId"] = (_.invert(matchedDict)[customerId]);
                dict["skill"] = skillsDict[customerId];
                dict["message"] = `Customer with Id ${customerId} matched with Agent`;
            }
            dict["connection"] = true;
        }
        res.send(dict);
    })

    // Listen to Port
    app.listen(process.env.PORT || 5000, function(){
        console.log ("Started on PORT 5000");
    })

    // CHATBOT RESPONSES
    chatbot.onMessage((tag, step, content, from, done) => {
        // Select type of support, check for available agents
        if (tag === "support" && step === "selectType") {
            var skill;
            if (content === "Banking") {
                skill = "banking"
            }
            if (content === "Investment") {
                skill = "investment"
            }
            if (content === "General Enquiries") {
                skill = "generalEnquiries"
            }
            skillsDict[from.id] = skill;
            connChecked[from.id] = false;

            // Checks whether customer is mapped to an agent
            checkAgents(skillsDict[from.id], from.id, 0);
            done();
        } 
        
        // Customer to confirm type of support
        else if (tag === "support" && (step === "banking" || step === "investment" || step === "generalEnquiries")) {
            let agentId = (_.invert(matchedDict))[from.id]
            // Check that the customer is correctly matched to an agent
            if (content === "Yes" && Object.values(matchedDict).indexOf(from.id) > -1) {
                connChecked[from.id] = true;
                done ('agentFound');
            } else if (content === "No") {
                clearGuest(from.id, step, false)
                done ('selectType');
            } else {
                connChecked[from.id] = true;
                clearGuest(from.id, step, false)
                done();
            }
        } 
        
        // Establish connection between agent and customer, open one-to-one conversation
        else if (tag === "support" && step === "establishConnection") {
            console.log("Executing external");
   
            let agentId = _.invert(matchedDict)[from.id]
            let skill = skillsDict[from.id]

            MongoClient.connect(url, {useUnifiedTopology: true}, async function(err, client) {
                const col = client.db(dbName).collection(skill);
                col.updateOne({"id": agentId}, {$inc:{"chatsReceived": 1}})
            })
 
            establishConnection(agentId, skillsDict[from.id], from.displayName)
            .then(() => {
                done();
            })
            .catch((err) => console.error(`Error: ${err}`))
        }
        // TODO: NEEDS A WAY TO RESET VALUES WITHOUT CUSTOMERS PRESSING DONE
        // Reset values stored in the respective dictionaries, conversation ended
        // else if (tag === "support" && step === "done"){
        //     if (content === "Yes") {
        //         connChecked[from.id] = false;
        //         clearGuest(from.id, skillsDict[from.id], false);
        //         done();
        //     } else if (content === "No") {
        //         done("done");
        //     }
        // }
        else {
            done();
        }

        // Agent to confirm call ended and clears data
        if (tag === "done") {
            connChecked[from.id] = false;
            clearGuest(from.id, skillsDict[matchedDict[from.id]], true);
            console.log("Guest data cleared!")
        }

        // Check number of available agents in each category
        if (tag === "availability" && step === "availableMessage") {
            var skill;
            if (content === "Banking") {
                skill = "banking"
            }
            if (content === "Investment") {
                skill = "investment"
            }
            if (content === "General Enquiries") {
                skill = "generalEnquiries"
            }
            availability(from.id, skill, content)
            .then(()=> {
                done();
            })
        }
    }, this);

    chatbot.onTicket((tag, history, from, start, end, state, id) => {
        // Do something when a user has completed a scenario

    }, this);
});

// INITIALIZING THE MONGODB DATABASE
nodeSDK.events.on("rainbow_onready", () => {

    // Get your network's list of contacts
    let contacts = nodeSDK.contacts.getAll();

    // Store agents' information into a JSON file
    var banking_list = [];
    var genEnq_list = [];
    var investment_list = [];

    for (let contact of contacts) {
        // Initialize dictionary to store only necessary information of each agent
        var dict = {};
        dict["jid"] = contact["jid"];
        dict["id"] = contact["id"];
        dict["displayName"] = contact["_displayName"];
        dict["loginEmail"] = contact["loginEmail"];
        dict["presence"] = contact["presence"];
        dict["callsReceived"] = 0;
        dict["chatsReceived"] = 0;

        // Initialize dictionary that checks if agent is attached to a customer
        matchedDict[contact["id"]] = "";

        // Check if contact is an agent
        if (contact["jobTitle"] == "Agent") {

            // Add agent's information into their respective categories
            if (contact["tags"].includes('banking')) {
                banking_list.push(dict);
            }
            if (contact["tags"].includes('generalEnquiries')) {
                genEnq_list.push(dict);
            }
            if (contact["tags"].includes('investment')) {
                investment_list.push(dict)
            }
        }
    }

    // Create JSON documents for each category
    var banking = JSON.parse(JSON.stringify(banking_list));
    var genEnq = JSON.parse(JSON.stringify(genEnq_list));
    var investment = JSON.parse(JSON.stringify(investment_list));

    console.log("Banking: \n", banking);
    console.log("\nGeneral Enquiries: \n", genEnq);
    console.log("\nInvestment: \n", investment)
    
    // Connect using MongoClient
    MongoClient.connect(url, {useNewUrlParser: true, useUnifiedTopology: true}, function(err, client) {
        // Create a banking collection
        const bank_col = client.db(dbName).collection('banking');
        bank_col.countDocuments(function (err, count) {
            if (!err && count == 0) {
                bank_col.insertMany(banking);  // replace documents in collection
                console.log("Agents' Information Inserted for Banking")
            }
        })
        
        // Create a general enquiries collection
        const genEnq_col = client.db(dbName).collection('generalEnquiries');
        genEnq_col.countDocuments(function (err, count) {
            if (!err && count == 0) {
                genEnq_col.insertMany(genEnq);  // replace documents in collection
                console.log("Agents' Information Inserted for General Enquiries")
            }
        })

        // Create an investment collection
        const investment_col = client.db(dbName).collection('investment');
        investment_col.countDocuments(function (err, count) {
            if (!err && count == 0) {
                investment_col.insertMany(investment);  // replace documents in collection
                console.log("Agents' Information Inserted for Investment")
            }
        })
    });
});

// UPDATE THE DATABASE WHEN CONTACT PRESENCE OF AGENTS ARE CHANGED
nodeSDK.events.on("rainbow_oncontactpresencechanged", function(contact) {
    // do something when the connection to Rainbow is up
    var presence = contact.presence;    // Presence information
    var status = contact.status;        // Additionnal information if exists

    // Connect using MongoClient
    MongoClient.connect(url, {useNewUrlParser: true, useUnifiedTopology: true}, function(err, client) {
        // Update the agent's presence status for Banking
        const bank_col = client.db(dbName).collection('banking');
        if (contact.tags.includes('banking')) {
            bank_col.updateOne({"id": contact.id}, {$set:{"presence": presence}});
            console.log(contact._displayName, "updated presence to", presence, "for Banking");
        }

        // Update the agent's presence status for General Enquiries
        const genEnq_col = client.db(dbName).collection('generalEnquiries');
        if (contact.tags.includes('generalEnquiries')) {
            genEnq_col.updateOne({"id": contact.id}, {$set:{"presence": presence}});
            console.log(contact._displayName, "updated presence to", presence, "for General Enquiries");
        }

        // Update the agent's presence status for Investment
        const investment_col = client.db(dbName).collection('investment');
        if (contact.tags.includes('investment')) {
            investment_col.updateOne({"id": contact.id}, {$set:{"presence": presence}});
            console.log(contact._displayName, "updated presence to", presence, "for Investment");
        }
    });
});