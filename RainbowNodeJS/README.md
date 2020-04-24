# HEROKU GUIDE (Need to create first and make a Procfile)
1. `git add .`
2. `git commit -m "node.js tenth commit"`
3. `git push heroku master`
4. `heroku ps:scale web=1`
5. `heroku open`
6. `heroku logs`
7. `heroku ps -a limitless-sierra-11102` (to check dyno usage)