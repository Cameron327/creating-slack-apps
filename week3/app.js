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
    // This is basically all the things we can get from event
    const { item: { channel, ts }, reaction } = event;

    // now try to get language info from reactions
    // We will try to do: :flag-mx" as a reaction -> 'es', 'Spanish'
    // build a function to do it and put the function at the bottom of the code
    const language = getLanguageFromReaction(reaction);
    // If they react with an emoji that isn't a flag, then just ignore it.
    if (!language) return;

    // Then get the text to translate
    const historyResult = await client.conversations.history({
      // we already got the channel ID from the top by getting it from events
      channel: channel,
      // These 4 are just the paramters so we only get that message and nothing else. Inclusive is referring to between oldest and latest.
      oldest: ts,
      latest: ts,
      inclusive: true,
      limit: 1,
    });
    if (historyResult.messages.length <= 0) return; //because something probably went wrong
    // here, we are putting the message into a variable called textToTranslate
    const { text: textToTranslate } = historyResult.messages[0];
    // see if the message we are getting from Slack is correct
    console.log(textToTranslate);

    // Translate the text
    const translatedText = await translate(textToTranslate, language);


    // send the translated message back to slack
    try {
      // Call chat.postMessage with the built-in client
      const result = await client.chat.postMessage({
        channel: channel,
        thread_ts: ts,
        // The _ is just to put it in Italics
        text: `_Translation for :${reaction}:_\n${translatedText}`
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


/**
 * Get language info from Slack emoji reaction
 * @param {String} reaction 
 * @returns {Object} or undefined if unsupported emoji
 */
function getLanguageFromReaction(reaction) {
  // map of emoji codes to language info
  // Language codes: https://cloud.google.com/translate/docs/languages
  const reactionToLanguageMap = {
    // Syntax: First is the Slack's emoji name, and then provide an object that is useful for the Google translate API
    fr: { code: 'fr', name: 'French' },
    mx: { code: 'es', name: 'Spanish' },
    jp: { code: 'ja', name: 'Japnase' },
  };

  // Get the country codes of the language to translate
  // Some reactions have :flag-mx: while others are :fr: for some reason
  // So, we can split and grab the last element
  // If it has the flag, split. Else, nothing.
  const [prefix, emojiCode] = reaction.includes('flag-') ? reaction.split('-') : ['', reaction];
  // We dumped the prefix into the prefix up there and never use it and we dump the useful part into emojiCode.
  const language = reactionToLanguageMap[emojiCode];

  return language;

}

/**
 * Use the Google translate API to translate the text
 * @param {String} textToTranslate text to translate
 * @param {Object} language 'language.code'
 * @returns {String}
 */
async function translate(textToTranslate, language) {
  // Fix this function for homework
  return `:sparkles: Imagine this is in ${language.name}`;
}





