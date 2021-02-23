const { App } = require('@slack/bolt');
const { config } = require('dotenv');

// load dotenv variables
config();

// initialize the slack app
const app = new App({
    token: process.env.SLACK_BOT_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET
});

// When a reaction is added
// find the exact name of the event from the list in my google doc
app.event('reaction_added', async ({ event, client }) => {
    // Use this console log statment to see the actual payload. For testing and starting.
    // The Payload is what comes with the event so that you know how to access its objects later (i.e. event.user)
    console.log('event:', event);

    // Now we need the channelID and we could do it like this
    // Get info from the event, like the channelID and timestamp
    const { item: { channel, ts } } = event;

    try {
      // Call chat.postMessage with the built-in client
      const result = await client.chat.postMessage({
        channel: channel,
        thread_ts: ts,
        text: `Thanks for the reaction, <@${event.user}>! 🎉`
      });
      console.log('result:', result);
    }
    catch (error) {
      console.error('error:', error);
    }
  });

// start the slack app
(async () => {
    await app.start(process.env.PORT || 3000);
    console.log('Bolt app is running');
})();