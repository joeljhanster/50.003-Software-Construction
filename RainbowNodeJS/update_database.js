// Import modules
var fs = require("fs");
var MongoClient = require("mongodb").MongoClient;
var _ = require("underscore");

// Define variables
const url = 'mongodb://localhost:27017';    // Connection url
const dbName = 'agents';                    // Database Name
var matchedDict = {};                       // Initialize dictionary to check if agent is attached to a customer
var skillsDict = {};                        // Initialize dictionary to attach customer to a requested skill
var guestDict = {};                         // Initialize dictionary to contain email and password of guest accounts

// Load the SDK
const ChatBot = require("rainbow-chatbot");
const RainbowSDK = require("rainbow-node-sdk");

// Define your configuration
const options = require("./options.json");

// Load the scenario
const scenario = require("./scenario.json");

// Function to create new Guest Account
async function createGuest(firstName, lastName) {
    // create the guest account
    let language = "en-US";
    let ttl = 300;  // active for 5min
    //let ttl = 86400; // active for a day
    guest = await nodeSDK.admin.createGuestUser(firstName, lastName, language, ttl);
    guestId = guest.id;
    guestEmail = guest.loginEmail;
    guestPassword = guest.password;
    console.log (`Id is ${guestId}`)
    console.log (`Email is ${guestEmail}`)
    console.log (`Password is ${guestPassword}`)
    
    // store guests' login details into dictionary
    guestDict[guestId] = [guestEmail, guestPassword];

    // chatbot to automatically send message to guest user
    let guestContact = await nodeSDK.contacts.getContactById(guestId, true);
    let conversation = await nodeSDK.conversations.openConversationForContact(guestContact);
    await nodeSDK.im.sendMessageToConversation(conversation, `Hello, I am the customer support bot for ABC Bank. If you require any assistance, please type #support :)`);
    //return guestId, guestEmail, guestPassword
}

// USING RAINBOW WEB SDK
// Function to establish connection between Agent and Customer
async function establishConnection(agentId, customerName, skill, customerId) {
    // sign into guest account to initiate conversation with matched agent
    customerEmail = guestDict[customerId][0]
    customerPassword = guestDict[customerId][1]
    console.log (`This is customer email ${customerEmail}`)
    console.log (`This is customer password ${customerPassword}`)

    results = await rainbowSDK.connection.signin(customerEmail, customerPassword);
    console.log(`This is the results: ${results}`);

    // results = await rainbowSDK.admin.askTokenOnBehalf(customerEmail, customerPassword)
    // token = JSON.stringify(results.token)
    // await rainbowSDK.connection.signinSandBoxWithToken(token);
    // nodeSDK.connection.signinSandBoxWithToken(token).then((result) => {
    //     if (result) {
    //         console.log(result)
    //     }
    //     else {
    //         console.log ("Failed to login successfully")
    //         console.log (`This is the results: ${result}`)
    //     }
    // })
    // .catch((err) => console.error (`Failed to login successfully due to: ${err}`))

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
        // doc = await col.find({"presence": "online"}).sort({"chatsReceived":1}).limit(1).toArray(result);
        // col.find({"presence:": "online"}, {sort: {chatsReceived: 1}, limit: 1}, function )
        // console.log(doc);"
        // .then((result) => {
        //     if (result) {
        //         var agentId = result["id"];
        //         console.log(agentId);
        //         if (matchedDict[agentId] == "") {
        //             console.log("Matching agent to customer");
        //             matchedDict[agentId] == customerId;
        //         }
        //     } else {
        //         console.log('No document matches the provided query.');
        //     }
        // })
        // .catch((err) => console.error(`Failed to find document: $(err)`))
        col.findOne({"presence": "online"})
        .then((result) => {
            if (result) {
                var agentId = result["id"];
                if (matchedDict[agentId] == "") {
                    matchedDict[agentId] = customerId;
                    col.updateOne({"id": agentId}, {$set:{"presence": "busy"}});    // temporarily change agent's presence status
                }
            } else if (count <= 10000) {
                console.log('No document matches the provided query.');
                count = count + 1;
                checkAgents (skill, customerId, count);
            }
        })
        .catch((err) => console.error(`Failed to find document: ${err}`))
        
    });
}

// Instantiate the SDK
nodeSDK = new RainbowSDK(options);
nodeSDK.start().then( () => {
    // Start the bot
    chatbot = new ChatBot(nodeSDK, scenario);
    return chatbot.start();
   
}).then( () => {
    // Create the guest account (link to frontend - create guest account button)
    let firstName = "Guest";
    let lastName = "17";
    console.log("Creating guest account");
    createGuest(firstName, lastName);
    //var guestId, guestEmail, guestPassword = createGuest(firstName, lastName);

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
            checkAgents(skillsDict[from.id], from.id, 0);
            done();
        } 
        
        // Customer to confirm type of support
        else if (tag === "support" && (step === "banking" || step === "investment" || step === "generalEnquiries")) {
            // Check that the customer is correctly matched to an agent
            if (content === "Yes" && Object.values(matchedDict).indexOf(from.id) > -1) {
                done ('agentFound');
            } else if (content === "No") {
                matchedDict[(_.invert(matchedDict))[from.id]] = "";
                delete skillsDict[from.id];
                // change back the presence of the agent on MongoDB
                // get presence of agent using agent's ID
                // 

                done ('selectType');
            } else {
                matchedDict[(_.invert(matchedDict))[from.id]] = "";
                delete skillsDict[from.id];
                done();
            }
        } 
        
        // Establish connection between agent and customer, open one-to-one conversation
        else if (tag === "support" && step === "establishConnection") {
            console.log("Executing external");
            establishConnection((_.invert(matchedDict))[from.id], from._displayName, skillsDict[from.id], from.id)
            .then(() => {
                done();
            })
        } 

        // Reset values stored in the respective dictionaries, conversation ended
        else if (tag === "support" && step === "done"){
            if (content === "Yes") {
                matchedDict[(_.invert(matchedDict))[from.id]] = "";
                delete skillsDict[from.id];
                done();
            } else if (content === "No") {
                done("done");
            }
        }
        else {
            done();
        }
    }, this);

    chatbot.onTicket((tag, history, from, start, end, state, id) => {
        // Do something when a user has completed a scenario

    }, this);
});

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

    fs.writeFileSync("banking.json",banking);
    fs.writeFileSync("general_enquiries.json",genEnq);
    fs.writeFileSync("investment.json",investment);

    console.log("Banking: \n", banking);
    console.log("\nGeneral Enquiries: \n", genEnq);
    console.log("\nInvestment: \n", investment)
    
    // Connect using MongoClient
    MongoClient.connect(url, {useUnifiedTopology: true}, function(err, client) {

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

nodeSDK.events.on("rainbow_oncontactpresencechanged", function(contact) {
    // do something when the connection to Rainbow is up
    var presence = contact.presence;    // Presence information
    var status = contact.status;        // Additionnal information if exists

    // Connect using MongoClient
    MongoClient.connect(url, {useUnifiedTopology: true}, function(err, client) {

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