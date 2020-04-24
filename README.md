# 50.003-Software-Construction (Rainbow Project)
Under 50.003 Software Construction, our group is tasked to work with Alcatel-Lucent Enterprise to implement a call center routing engine for their Rainbow API. This repository aims to provide companies who use the Rainbow communicating platform for their call centers with an efficient routing engine service.

For this project, we will be exploring and implementing the MEVN framework, using MongoDB, Express, VueJS, and Node.js. MEVN is a free and open-source JavaScript software stack for building dynamic web sites and web applications. Because all components of the MEVN stack support programs that are written in JavaScript, MEVN applications can be written in one language for both server-side and client-side execution environments.

To run the backend server using Node.js and Express:
1. Change directory to the RainbowNodeJS folder: `cd RainbowNodeJS`
2. Install all the necessary dependencies using the following command: `npm install -g`
3. Run `npm start` to start the server
4. Wait up to a minute before Rainbow chatbot is set up

To access the API endpoints:
- The backend server is currently hosted on heroku app. All API endpoints can be accessed via limitless-sierra-11102.herokuapp.com/. If server is run locally, use localhost:5000/.
  1. To create guest account using first name and last name: limitless-sierra-11102.herokuapp.com/create_guest?firstName=&lastName=
  2. To check the availability using guest ID: limitless-sierra-11102.herokuapp.com/establish_connection?id=
  3. To check the total number of agents and the available number of agents: limitless-sierra-11102.herokuapp.com/availability
  4. To check the number of matched agents to customers: limitless-sierra-11102.herokuapp.com/matched

To access the MongoDB database:
- The MongoDB database is currently hosted on heroku app. Access is limited only to us who has the privileges to see the dashboard.
- To connect to the MongoClient, use the following url: mongodb://heroku_1whs0tq1:kq8e627o53cv9trrtd6q07n00i@ds119728.mlab.com:19728/heroku_1whs0tq1
- This database consists of all the agents' data. It has 3 collections, namely banking, investment and generalEnquiries, which are the list of skills possbily acquired by the agents. In each collection, the agents' data are stored as JSON documents, where their presence status, id, display name, as well as chats received can be seen with its values.

To execute the tests:
- For our backend testing, we mainly used JEST testing to test for two things:
  1. MongoDB Database (under `./RainbowNodeJS/tests/mongodb.test.js`)
     1. Connection to MongoClient
     2. Inserting of documents in a collection
     3. Counting of documents in a collection
     4. Changing the presence status of a particular agent
     5. Increasing and decreasing the agent's chatReceived count
   
  2. Express API endpoints (under `./RainbowNodeJS/tests/express.test.js`)
     1. `/create_guest` API endpoint
     2. `/establish_connection` API endpoint
     3. `/availability` API endpoint
     4. `/matched` API endpoint
- Run `npm run test` to execute JEST testing

- Also, for our stress testing, we wrote scripts under the `./RainbowNodeJS/stresstest` folder. The idea behind the `stresstest(i).js` scripts are such that each script does the following:
  1. Log into Guest Account
  2. Automate messages to be sent to the Rainbow Chatbot to send requests:
     1. #support
     2. Banking / Investment / General Enquiries
     3. Yes (to confirm)
  3. Check if account is matched to any agent

- At this point of the project, we generated 50 agents, of which, each of them have 2 skills, hence each skill has seeminlgy 100 agents available at the start, if all of them were to be online.
- To run the stresstesting, simply do the following under the `./RainbowNodeJS` folder:
  1. To execute 3 simple requests (1 for each skill): `npm run simpletest`
  2. To execute 30 requests (10 for each skill): `npm run stresstest`
  3. To execute 150 requests (50 for each skill): `npm run megastress`
- What to expect:
  - If the customers' requests exceed the current available agents, we will expect to see that all the agents are matched. Hence, the `/matched` API endpoint will churn out a result `{'count': numOfAgents}`
  - Else if the current available agents exceed customers' requests, we will expect to see that all the customers are matched. Hence, the `/matched` API endpoint will churn out a result `{'count': numOfCustomers}`


