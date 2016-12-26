# JTBot

## Bot Configuration
1. Go to https://api.slack.com/applications/new
2. Click "Create New App" button and give it a name
3. Choose Development Slack Team
4. You will get a Client ID and Client Secret
5. Add the Redirect URL, you can use the ngrok https://ngrok.com/
6. Add the Request URL, you can use the ngrok https://ngrok.com/
7. visiting the login page, http://localhost:3000/login

## Jenkins
1. Install Build Authorization Token Root Plugin
2. Select trigger builds remotely and add a token 
3. And you can trigger the URL (JENKINS_URL/job/jobname/build?token=TOKEN_NAME)

## Bot Script
1. git clone slack-bot
2. cd slack-bot
3. npm init
4. npm install
5. vim button_bot.js and paste the Client ID and Client Secret
6. job_url Insert your Jenkins's URL
