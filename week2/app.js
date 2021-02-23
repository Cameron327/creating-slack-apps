const { App } = require('@slack/bolt');
const { config } = require('dotenv');

// load dotenv variables
config();

// process.env comes with node.js
const app = new App ({
    token: process.env.SLACK_BOT_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET
});

// the first part is the callback ID. Listen to when an event happens. Link an event to a view.
// for the parameters, whenever this is invoked, it will collect that data to build the app
// ack stands for acknowledged
// the main reason for this shortcut is to set the view
app.shortcut('poll_shortcut_modal', async ({ack, shortcut, client}) => {
    // you have to acknowledge that the event happened after 3 seconds of activation
    await ack();

    const {user, trigger_id} = shortcut;

    // this opens a modal
    // the view is like the package the is shown to the user in the form of a modal
    await client.views.open({
        trigger_id,
        view: {
            type: "modal",
            callback_id: "poll_shortcut",
            title: {
                type: "plain_text",
                text: "Create new poll",
            },
            // now we are going to specify the blocks in the view. What the viewer actually sees. We're going to have different section and 
            // each section will be represented by a block.
            // one for selecting the channel that you want to be in, second for the polling question, and the last one for a lot of options

            // channel selection
            blocks : [
                {
                    type: "input",
                    block_id: "target_conversation",
                    element: {
                        // allows users to select anything they want without us having to create anything
                        type: "conversations_select",
                        placeholder: {
                            type: "plain_text",
                            text: "select a conversation",
                            emoji: true
                        },
                        filter: {
                            include: [
                                "public",
                                // mpim is like a group instant message or a group "DM"
                                "mpim"
                            ],
                            exclude_bot_users: true
                        },
                        // look up what an action id is???
                        action_id: "selected_conversation",                        
                    },
                    // label the block
                    label: {
                        type: "plain_text",
                        text: "Select the conversation you want to send your poll to:",
                        emoji: true
                    }
                },
                // build the poll question
                {
                    type: "input",
                    block_id: "poll_question",
                    element : {
                        // now actually type our their own value instead of picking from a drop down
                        type: "plain_text_input",
                        action_id: "poll_question"
                    },
                    label: {
                        type: "plain_text",
                        text: "Poll question",
                        emoji: true
                    }
                },
                // now we are going to build a fixed number of options that they can pick. We'll do 3
                {
                    type: "input",
                    block_id: "option_1",
                    element: {
                        type: "plain_text_input",
                        action_id: "option_1"
                    },
                    label: {
                        type: "plain_text",
                        text: "Option 1",
                        emoji: true
                    }
                },
                {
                    type: "input",
                    block_id: "option_2",
                    element: {
                        type: "plain_text_input",
                        action_id: "option_2"
                    },
                    label: {
                        type: "plain_text",
                        text: "Option 2",
                        emoji: true
                    }
                },
                                {
                    type: "input",
                    block_id: "option_3",
                    element: {
                        type: "plain_text_input",
                        action_id: "option_3"
                    },
                    label: {
                        type: "plain_text",
                        text: "Option 3",
                        emoji: true
                    }
                }
            ],
            // and, you also have to submit the view
            submit: {
                type: "plain_text",
                text: "start poll"
            }
        }
    })
});


// we need to acknowledge it using another view using the same callback ID. It will be posted into the chat.
// The arrow is what we want to happen in that case
app.view('poll_shortcut', async ({ack, body, view, client}) => {
    // always acknowledge that the even occured
    await ack();
    // get the user info from the body
    const { user } = body; 

    const {
        target_conversation,
        poll_question,
        option_1,
        option_2,
        option_3,
    // the data is from the view in the staties in the values
    } = view.state.values;

    // now to post the message, ts = timestamp
    const { channel, ts} = await client.chat.postMessage(
        {
            // you want to get the channel that you are posting this message to
            // the target_convo has a seclected_convo but inside is the actual selected_convo
            channel: target_conversation.selected_conversation.selected_conversation,
            blocks: [
                // each block should be its own object
                {
                    type: "section",
                    text: {
                        type: "mrkdwn",
                        // The dollar sign and open bracket thing is a way to substitute values inside of a string. In Slack,
                        // the <> will make the name into a 'full mention'
                        // For getting the value, when you console.log(poll_question), you see that the only properties it has is type and value.
                        // SO, you just access the value by doing poll_question.poll_question.value instead of poll_question.input.value.
                        // Same for the 3 options below
                        text: `<@${user.id}> wants to know: *${poll_question.poll_question.value}`
                    }
                },
                // you also need to write what the user wants in their options
                {
                    type: "section",
                    text: {
                        type: "plain_text",
                        // those tick marks allow you to get the data into the string while still being a string
                        // we call the action id and then the type that it is and then get the value
                        // When you do the double colon like that, it shows up as the 1 emoji on Slack
                        text: `:one: ${option_1.option_1.value}`,
                        emoji: true
                    }
                },
                {
                    type: "section",
                    text: {
                        type: "plain_text",
                        // those tick marks allow you to get the data into the string while still being a string
                        text: `:two: ${option_2.option_2.value}`,
                        emoji: true
                    }
                },
                {
                    type: "section",
                    text: {
                        type: "plain_text",
                        // those tick marks allow you to get the data into the string while still being a string
                        text: `:three: ${option_3.option_3.value}`,
                        emoji: true
                    }
                }
            ]
        }
    )
    // need to wait for client reactions. Put this outside of the postMessage
    await client.reactions.add({
        channel,
        name: "one",
        timestamp: ts
    });
    await client.reactions.add({
        channel,
        name: "two",
        timestamp: ts
    });
    await client.reactions.add({
        channel,
        name: "three",
        timestamp: ts
    });
});

(async () => {
    await app.start(process.env.PORT || 3000);

    console.log('Bolt has started');
})();



