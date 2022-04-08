const { WebClient } = require('@slack/web-api');

interface SlackWebService {
  init();
  respond(event, msg:string)
}
class SlackWebServiceImpl implements SlackWebService {
  private web;

  public init() {
    this.web = new WebClient(process.env.SLACK_USER_TOKEN);
  }

  public async respond(event, msg:string) {
    try {
      await this.web.chat.postMessage({
        channel: event.user,
        text: msg
      });
    } catch (error) {
      console.log(error);
    }
  }
}

let SlackWebClient = new SlackWebServiceImpl()
export { SlackWebClient };