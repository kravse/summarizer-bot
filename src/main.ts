require('dotenv').config();
// const cohere = require('cohere-ai')
const request = require('request');
const { parse } = require('node-html-parser');
const sanitize = require('sanitize-html')
const key = process.env.COHERE_API_KEY

import { SlackEvents } from '@/services/slack-events';
import { SlackWebClient } from '@/services/slack-webclient';
let elToCleanText = (el) => {
  let clean = sanitize(el, {
    allowedTags: [],
    allowedAttributes: {}
  })
  if (clean.length > 5000) clean = clean.slice(0, 5000)
  return clean.replace(/\s+/g, ' ').trim()
}

let getSummaryFromLink = async (event) => {
  // const articleText = 'Hello this is what it isHello this is what it isHello this is what it isHello this is what it is';
  // cohere.init(key);
  // request(event.text, async (err, resp, body) => {
  //   let root = parse(body)
  //   let title = root.querySelector('title').innerHTML;
  //   console.log(`Title: "${title}"\n\nContent: "${elToCleanText(root)}"`)
  //   const generateResp = await cohere.generate("large", {
  //     prompt: `Title: "${title}" Content: "${elToCleanText(root)}" Summary:"`,
  //     max_tokens: 300,
  //     temperature: 1,
  //     k: 0,
  //     p: 0.75,
  //     frequency_penalty: 0,
  //     presence_penalty: 0,
  //     stop_sequences: [],
  //     return_likelihoods: 'NONE'
  //   });
  //   console.log('-------GENERATED RESPONSE----------')
  //   console.log(generateResp, generateResp.body?.generations)
  //   SlackWebClient.respond(event, generateResp.body?.generations[0].text);
  // })
}

let init = async () => {
  SlackEvents.init();
  SlackWebClient.init();

  await SlackEvents.slackEventsListener('message', (event: any) => {
    console.log(`Received a message event: user ${event.user} in channel ${event.channel} says ${event.text}`);
    if (!event.bot_id && event.text) {
      // getSummaryFromLink(event)
      SlackWebClient.respond(event, "HI");
    }
  });
}

(async () => {
  init();
  // getSummaryFromLink('https://www.bbc.com/news/world-asia-60995341');
})();

