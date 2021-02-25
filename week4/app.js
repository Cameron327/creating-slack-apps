const { App, ExpressReceiver } = require('@slack/bolt');
const express = require('express');
const axios = require('axios');

const { config } = require('dotenv');

config();

const receiver = new ExpressReceiver({signingSecret: process.env.SLACK_SIGNING_SECRET});
// This is the middleware to parse the json for req.body
receiver.router.use(express.json());

const app = new App({
    token: process.env.SLACK_BOT_TOKEN,
    // This needs to be receiver instead of the signingSecret now
    receiver
});

// This is the custom url
// If that link is hit in our server, it's gonna call the async function
receiver.router.post('/github-starring', async (req, res) => {
    // console.log(req.body);
    console.log('Hit my route for github stars');

    // Now we want to pull info out from the body
    const { comment, action, repository, sender } = req.body
    const verb = action === 'deleted' ? 'unstarred' : 'starred';
    const text = `${sender.login} just ${verb} the ${repository.name} repository, bringing the star count to ${repository.stargazers_count}.`

    // This is a different way to post a message to the channel because we are using express
    await app.client.chat.postMessage({
        token: process.env.SLACK_BOT_TOKEN,
        channel: 'general', 
        text,
    });
    res.sendStatus(200);
});

// This is our new event (listen for it and then do the function)
// The event property from the payload
// Client for making API calls to Slack
// We now use axios
// For app.event specifically, you don't need to acknowledge it
app.event('app_home_opened', async ({ event, client}) => {
    // The first argument is the url where you want to make the get request
    const GitHubUrl = 'https://api.github.com/repos/Cameron327/slack-bootcamp';
    // We want to pull out the issues from the data
    const { data: issues } = await axios.get(`${GitHubUrl}/issues`);
    console.log('App home opened');

    // We want to format our issues into a block
    // Map is a built in JS function that runs on arrays and for every item in the array, it will run the following function
    // This function will create that many objects and put them into an issueBlocks array
    const issueBlocks = issues.map(issue => ({
        type: 'section',
        text: {
            type: 'mrkdwn',
            // For Slack specifically, the markdown is <...>
            text: `<${issue.html_url}|${issue.title}> opened by <${issue.user.html_url}|${issue.user.login}>`,
        },
    }));

    // We want to show the issues in a view
    await client.views.publish({
        user_id: event.user,
        view: {
            type: 'home',
            blocks: [
                {
                    type: 'header',
                    text: {
                        type: 'plain_text',
                        text: 'Open Issues in the Github repo "slack-bootcamp"'
                    },
                },
                // Put in the issueBlocks array full of the issue objects
                ...issueBlocks,
            ]
        }
    });
});

(async ()=> {
    await app.start(process.env.PORT || 3000);
    console.log('Bolt app has started');
})(); // those parenthesis at the end makes it a function call


