// const worker = require('worker_threads');
const axios = require('axios')
const RainbowSDK = require("rainbow-node-sdk");

async function stresstest(loginEmail) {
    // let loginEmail = "customer1@sutd.edu.sg"; // TODO: customer1 - customer1000 (worker thread needs to input this value)
    let password = "P@ssword123";
    let botId = "5e3298a2e9f12730636949d2";

    // Log into Rainbow guest account
    let options = {
        "rainbow": {
            "host": "sandbox.openrainbow.com",
            "mode": "xmpp"
        },
        "credentials": {
            "login": loginEmail,
            "password": password
        },

        "application": {
            "appID": "ecb354505ef711ea9a6dcf004cf8c14e", 
            "appSecret": "8qXAAAXSKPN2JirciZwpoTkkzqLX8AWx55kg55WRFSmVGrIfb2xEleTeuwp44qVB" 
        },
        "logs": {
            "enableConsoleLogs": false,
            "enableFileLogs": false,
            "color": true,
            "level": "debug",
            "customLabel": "jiehan_97@hotmail.com",
            "system-dev": {
            "internals": true,
            "http": true
            }, 
            "file": {
                "path": "/var/tmp/chatbot/",
                "customFileName": "R-SDK-Node-ChatBot",
                "level": "debug",
                "zippedArchive" : false
            }
        },
        "im": {
            "sendReadReceipt": false,
            "messageMaxLength": 1024,
            "sendMessageToConnectedUser": true,
            "conversationsRetrievedFormat": "small",
            "storeMessages": false,
            "nbMaxConversations": 15,
            "rateLimitPerHour": 1000
        }
    }

    // Instantiate the SDK
    nodeSDK = new RainbowSDK(options);
    nodeSDK.start().then( () => {
        console.log("LOGGED INTO USER ACCOUNT");

        // Send message to chatbot
        automateMessages(botId).then(() => {
            let contact = nodeSDK.contacts.getConnectedUser();
            // Check if attached to agent
            checkMatch(contact.id);
        })
    })
}

// Function to delay
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Function to automate messages
async function automateMessages(botId) {
    let botContact = await nodeSDK.contacts.getContactById(botId, true);
    console.log("Got bot contact")
    let conversation = await nodeSDK.conversations.openConversationForContact(botContact);
    nodeSDK.im.sendMessageToConversation(conversation, "#support");
    console.log("Message sent: #support");
    await sleep(7000);
    // nodeSDK.im.sendMessageToConversation(conversation, "Banking");
    nodeSDK.im.sendMessageToConversation(conversation, "Investment");
    console.log("Message sent: Investment");
    // nodeSDK.im.sendMessageToConversation(conversation, "General Enquiries");
    await sleep(7000);
    nodeSDK.im.sendMessageToConversation(conversation, "Yes");
    console.log("Message sent: Yes");
}

// Function to check matched agents
async function checkMatch(id) {
    let result = await axios.get(`https://limitless-sierra-11102.herokuapp.com/establish_connection?id=${id}`);
    let message = result.data.message;
    let agentId = result.data.agentId;
    console.log("Message: " + message);
    if (agentId != "") {
        console.log ("Agent ID is : " + agentId);
    }
}

stresstest("customer177@sutd.edu.sg")