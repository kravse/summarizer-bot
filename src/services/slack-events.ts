const { createEventAdapter } = require('@slack/events-api');

interface SlackEventService {
  init():void
  slackEventsListener(type:string, callback)
}

class SlackEventsImpl implements SlackEventService{
  private slackEvents = createEventAdapter(process.env.SLACK_SIGNING_SECRET);
  private port = process.env.PORT || 3000;
  static slackEvents: any;

  public async init () {
    const server = await this.slackEvents.start(this.port);
    console.log(`Listening for events on ${server.address().port}`);
  }

  public slackEventsListener(type, callback) {
    this.slackEvents.on(type, (event: any) => {
      return callback(event)
    });
  }
}

let SlackEvents = new SlackEventsImpl()
export { SlackEvents} ;