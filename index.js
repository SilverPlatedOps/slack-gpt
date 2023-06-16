require('dotenv').config();
const { App, LogLevel } = require("@slack/bolt");
const axios = require('axios');

const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN;
const SLACK_APP_TOKEN = process.env.SLACK_APP_TOKEN;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const app = new App({
  token: SLACK_BOT_TOKEN,
  appToken: SLACK_APP_TOKEN,
  socketMode: true,
  logLevel: LogLevel.DEBUG,
});

app.event('app_mention', async ({ event, client }) => {
  // Log message
  console.log(event.text.split(">")[1]);

  // Create prompt for ChatGPT
  const prompt = event.text.split(">")[1];

  // Let the user know that we are busy with the request
  let response = await client.chat.postMessage({
    channel: event.channel,
    thread_ts: event.ts,
    text: "Hello from your bot! :robot_face: \nThanks for your request, I'm on it!",
  });

  // // Check ChatGPT
  // response = await axios.post('https://api.openai.com/v1/engines/davinci-codex/completions', {
  //   prompt: prompt,
  //   max_tokens: 1024,
  //   temperature: 0.5,
  // }, {
  //   headers: {
  //     'Authorization': `Bearer ${OPENAI_API_KEY}`
  //   }
  // });

  const { Configuration, OpenAIApi } = require("openai");
  const configuration = new Configuration({
    apiKey: OPENAI_API_KEY,
  });
  const openai = new OpenAIApi(configuration);
  const chat_completion = await openai.createChatCompletion({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }],
  });

  console.log('response-get-done', chat_completion);
  const chatGptResponse = chat_completion.data.choices[0].message.content;

  // Reply to thread
  console.log('event-response-post', JSON.stringify(event))
  response = await client.chat.postMessage({
    channel: event.channel,
    thread_ts: event.ts,
    text: `Here you go: \n${chatGptResponse}`,
  });
});

(async () => {
  // Start your app
  await app.start();
  console.log('App is running!');
})();