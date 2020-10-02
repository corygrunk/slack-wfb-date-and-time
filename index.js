require('dotenv').config()

var dayjs = require('dayjs')

const { App, WorkflowStep } = require("@slack/bolt");

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET
});


const ws = new WorkflowStep("date_and_time", {

  edit: async ({ ack, step, configure }) => {
    await ack();

    const blocks = [
      {
        type: "section",
        block_id: "intro-section",
        text: {
          type: "plain_text",
          text:
            "This is a simple step that will output date and time as a variable. A few different formats are available. These are especially handy when writing values to a spreadsheet.",
          emoji: true
        }
      },
      {
        "type": "divider"
      },
      {
        "type": "section",
        "text": {
            "type": "mrkdwn",
            "text": "*Choose a format*"
        },
        "accessory": {
            "type": "radio_buttons",
            "options": [
                {
                    "text": {
                        "type": "plain_text",
                        "text": "October 31, 2020 at 9:00 AM",
                        "emoji": true
                    },
                    "value": "value-0"
                },
                {
                    "text": {
                        "type": "plain_text",
                        "text": "2020-10-31T09:00:00+00:00",
                        "emoji": true
                    },
                    "value": "value-1"
                }
            ]
        }
      }
    ];

    await configure({ blocks });
  },
  save: async ({ ack, step, update, view }) => {
    await ack();

    const outputs = [
        {
            type: "text",
            name: "date",
            label: "Date & time"
        }
    ];

    await update({ outputs });
  },
  execute: async ({ step, complete, fail,  }) => {
    try {
        let now = dayjs();
        var currentTimestamp = { date: now.format("dddd, MMMM D, YYYY - HH:mm:ss") };
        const outputs = currentTimestamp;
        
      await complete({ outputs });

    } catch (e) {
      // TODO if something went wrong, fail the step ...
      app.logger.error("Error completing step", e.message);
    }
  }
});

app.step(ws);

(async () => {
  // Start your app
  const port = process.env.PORT || 3000;
  await app.start(port);

  console.log(`⚡️ Bolt app is running on port ${port}!`);

})();