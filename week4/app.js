const { App, ExpressReceiver } = require('@slack/bolt');
const express = require('express');
const { config } = require('dotenv');

config();

const app = new App({
    token: process.env.SLACK_BOT_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET,
});

const receiver = new ExpressReceiver({signingSecret: process.env.SLACK_SIGNING_SECRET});
// This is the middleware to parse the json for req.body
receiver.router.use(express.json());

// This is the custom url
// If that link is hit in our server, it's gonna call the async function
receiver.router.post('/github-stars', async (req, res) => {
    console.log(req.body);
    console.log('Hit my route for github stars');
    res.sendStatus(200);
});

(async ()=> {
    await app.start(process.env.PORT || 3000);
    console.log('Bolt app has started');
})(); // those parenthesis at the end makes it a function call


