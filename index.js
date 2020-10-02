require('dotenv').config()

var dayjs = require('dayjs')
var utc = require('dayjs/plugin/utc')
dayjs.extend(utc)

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
            "This is a simple step that will output the date and time that the step is executed as a variable. These are especially handy when writing values to a spreadsheet.",
          emoji: true
        }
      },
      {
        type: "input",
        block_id: "tz_select",
        element: {
          type: "static_select",
          action_id: "tz_selection",
          placeholder: {
            type: "plain_text",
            text: "Select a timezone",
            emoji: true
          },
          options: [
            {
              text: {
                type: "plain_text",
                text: "PST - Pacific Standard Time - UTC-8",
                emoji: true
              },
              value: "5"
            },
            {
              text: {
                type: "plain_text",
                text: "MST - Mountain Standard Time - UTC-7",
                emoji: true
              },
              value: "6"
            },
            {
              text: {
                type: "plain_text",
                text: "CST - Central Standard Time - UTC-6",
                emoji: true
              },
              value: "7"
            },
            {
              text: {
                type: "plain_text",
                text: "EST - Eastern Standard Time - UTC-5",
                emoji: true
              },
              value: "8"
            }
          ]
        },
        label: {
          type: "plain_text",
          text: "Select your timezone",
          emoji: true
        }
      }
    ];

    await configure({ blocks });
  },
  save: async ({ ack, step, update, view }) => {
    await ack();

    const {
      tz_select
    } = view.state.values;

    const tz = tz_select.tz_selection.selected_option.value;

    const inputs = {
      tz: { value: tz }
    }

    const outputs = [
        {
            type: "text",
            name: "date",
            label: "Date & time"
        }
    ];

    await update({ inputs, outputs });
  },
  execute: async ({ step, complete, fail }) => {
    
    try {
      const { tz } = step.inputs;

        var currentTimestamp = dayjs().utcOffset(step.inputs.tz.value).format("dddd, MMMM D, YYYY - HH:mm:ss");
        const outputs = { date: currentTimestamp }

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