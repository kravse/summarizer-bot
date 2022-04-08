# responder-bot
Responder bot Slack app built with Node, Webpack and TypeScript.

Uses Slack's Event and Web APIs to respond to user questions. 

Get Started:

1. `npm install`
2. Create an `.env` file in the root:

```
SLACK_TOKEN=your_slack_token
SLACK_SIGNING_SECRET=your_slack_signing_secret
PORT=80
```

3. Go to [ngrok.com](https://ngrok.com) and make a free account & follow the setup instructions.
4. Run `npm start`.
5. Run `./ngrok http 80`.
6. Add the generated URL to your [slack app](https://api.slack.com/apps/) under event subscriptions.
