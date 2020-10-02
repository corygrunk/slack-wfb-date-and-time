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
        block_id: "intro_section",
        text: {
          type: "plain_text",
          text:
            "This is a simple step that will output date and time as a variable. These are especially handy when writing values to a spreadsheet.",
          emoji: true
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
  execute: async ({ step, complete, fail, client }) => {
    
    try {

      console.log(client);

        let now = dayjs();
        var currentTimestamp = { date: now.format("dddd, MMMM D, YYYY - HH:mm:ss") };
        // TODO: Get user's locale - this won't work. What if there is no user? Maybe they should select a TZ in the config.
        // TODO: Set timestamp to user's local time
        const outputs = currentTimestamp;
        console.log(outputs);
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