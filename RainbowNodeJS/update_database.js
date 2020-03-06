// import modules
var fs = require("fs");
var MongoClient = require("mongodb").MongoClient;

const url = 'mongodb://localhost:27017';    // Connection url
const dbName = 'agents';                    // Database Name

// Load the SDK
let RainbowSDK = require("rainbow-node-sdk");

// Define your configuration
let options = {
    rainbow: {
        host: "sandbox"
    },
    credentials: {
        login: "", // To replace by your developer credendials
        password: "" // To replace by your developer credentials
    },
    // Application identifier
    application: {
        appID: "",
        appSecret: ""
    },
    // Logs options
    logs: {
        enableConsoleLogs: false,
        enableFileLogs: false,
        "color": true,
        "level": 'debug',
        "customLabel": "vincent01",
        "system-dev": {
            "internals": false,
            "http": false,
        }, 
        file: {
            path: "/var/tmp/rainbowsdk/",
            customFileName: "R-SDK-Node-Sample2",
            level: "debug",
            zippedArchive : false/*,
            maxSize : '10m',
            maxFiles : 10 // */
        }
    },
    // IM options
    im: {
        sendReadReceipt: true
    }
};

// Instantiate the SDK
let rainbowSDK = new RainbowSDK(options);

// Start the SDK
rainbowSDK.start();

rainbowSDK.events.on("rainbow_onready", () => {

    // Get your network's list of contacts
    let contacts = rainbowSDK.contacts.getAll();

    // Store agents' information into a JSON file
    var banking_list = [];
    var genEnq_list = [];
    var investment_list = [];

    for (let contact of contacts) {
        // Initialize dictionary to store only necessary information of each agent
        var dict = {};
        dict["id"] = contact["id"];
        dict["_displayName"] = contact["_displayName"];
        dict["presence"] = contact["presence"];

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
    var banking = JSON.stringify(banking_list);
    var genEnq = JSON.stringify(genEnq_list);
    var investment = JSON.stringify(investment_list);

    fs.writeFileSync("banking.json",banking);
    fs.writeFileSync("general_enquiries.json",genEnq);
    fs.writeFileSync("investment.json",investment);

    console.log("Banking: \n", banking_list);
    console.log("\nGeneral Enquiries: \n", genEnq_list);
    console.log("\nInvestment: \n", investment_list)
    
    // Connect using MongoClient
    MongoClient.connect(url, {useUnifiedTopology: true}, function(err, client) {

        // Create a banking collection
        const bank_col = client.db(dbName).collection('banking');
        bank_col.deleteMany({});                                    // removes documents from collection
        bank_col.insertMany(banking_list);                          // insert new documents into collection
        console.log("Agents' Information Inserted for Banking")

        // Create a general enquiries collection
        const genEnq_col = client.db(dbName).collection('generalEnquiries');
        genEnq_col.deleteMany({});                                  // removes documents from collection
        genEnq_col.insertMany(genEnq_list);                         // insert new documents into collection
        console.log("Agents' Information Inserted for General Enquiries")

        // Create an investment collection
        const investment_col = client.db(dbName).collection('investment');
        investment_col.deleteMany({});                              // removes documents from collection
        investment_col.insertMany(investment_list);                 // insert new documents into collection
        console.log("Agents' Information Inserted for Investment")
    });
});

rainbowSDK.events.on("rainbow_oncontactpresencechanged", function(contact) {
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