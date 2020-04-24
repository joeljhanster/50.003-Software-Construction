1. Getting Started
- `npm install -g rainbow-cli`
- `rbw commands`
- `rbw <command> --help`
- `rbw configure` is the fastest way to set up connection information
- `rbw login`
- Use the option `--json` to get JSON stringified result
- `brew install jq` if JSON command line processor not installed
- Piping output to a JSON process: e.g. extract the field loginEmail from user `rbw user 58e36805d45e61221b571363 --json | jq '.loginEmail' -r`
- Use the code below to pipe output to a NodeJS application:
```js
// file displayLogin.js
#!/usr/bin/env node

// Keep stdin open and wait for data
process.stdin.resume();
process.stdin.setEncoding('utf8');

let data = "";

// Get result asynchronously
process.stdin.on('data', function(chunk) {
    data += chunk;
});

process.stdin.on('end', function() {

    // Do something with the data received
    let json = JSON.parse(data);
    let loginEmail = json.loginEmail;
    ...

    // eg: Display the login email to the console
    console.log("Found", loginEmail);

});
```
- `rbw user 58e36805d45e61221b571363 --json | node displayLogin.js` to retrieve user from Rainbow CLI and pass the information to the second application

2. Mass Provisioning
- Mass-pro: This is the action of importing to Rainbow a list of users to provision from an input file (ie: generally a CSV file).
- CSV template: To ease the provisioning, you can download a template file that is in fact a sample of file that can be importing. In this sample, you will have an example of how to add a new user, how to remove it, etc...
- Getting the Mass-pro template
- User template: `rbw masspro template user`
- Device template: `rbw masspro template device`
- Checking your CSV file: `rbw masspro check agents.csv`
- Importing your CSV file: `rbw masspro import users.csv`
- Checking the list of operations done: `rbw masspro status company`
- Display detailed information: `rbw masspro status <reqId>`
  
3. Managing Test Accounts
- Sign in using developer account `rbw login <login> <password>`. Use `rbw configure` as mentioned above.
- `rbw users` to list the users in your company
- `rbw user <ID>` to display more information about the user
- `rbw activate user <ID>`
- `rbw initialize user <ID>`
- Log into https://web-sandbox.openrainbow.com/app/1.67.3/index.html#/main/home using agents' accounts