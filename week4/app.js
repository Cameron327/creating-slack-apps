const { App, ExpressReceiver } = require('@slack/bolt');
const express = require('express');
const { config } = require('dotenv');

config();

const receiver = new ExpressReceiver({signingSecret: process.env.SLACK_SIGNING_SECRET});
// This is the middleware to parse the json for req.body
receiver.router.use(express.json());

const app = new App({
    token: process.env.SLACK_BOT_TOKEN,
    // This needs to be receiver instead of the signingSecret now
    receiver,
});

// This is the custom url
// If that link is hit in our server, it's gonna call the async function
receiver.router.post('/github-starring', async (req, res) => {
    console.log(req.body);
    console.log('Hit my route for github stars');

    // Now we want to pull info out from the body
    const { action, repository, sender } = req.body
    const verb = action === 'deleted' ? 'unstarred' : 'starred';
    const text = `${sender.login} just ${verb} the ${repository.name} repository, bringing the star count to ${repository.stargazers_count}.`

    app.client.chat.postMessage({
        token: process.env.SLACK_BOT_TOKEN,
        channel: 'general', 
        text,
    })



    res.sendStatus(200);
});

(async ()=> {
    await app.start(process.env.PORT || 3000);
    console.log('Bolt app has started');
})(); // those parenthesis at the end makes it a function call


