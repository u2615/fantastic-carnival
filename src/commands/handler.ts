import {
  LogService,
  MatrixClient,
  MessageEvent,
  RichReply,
  UserID,
} from "matrix-bot-sdk";
import xss from "xss";
import { helpText } from "../helpers/help";
import { getUserConfigMessage } from "./parser";

// The prefix required to trigger the bot. The bot will also respond
// to being pinged directly.
//export const COMMAND_PREFIX = "!bot";

// This is where all of our commands will be handled
export default class CommandHandler {
  // Just some variables so we can cache the bot's display name and ID
  // for command matching later.
  private displayName!: string;
  private userId!: string;
  private localpart!: string;

  constructor(private client: MatrixClient) {}

  public async start() {
    // Populate the variables above (async)
    await this.prepareProfile();

    // Set up the event handler
    this.client.on("room.message", this.onMessage.bind(this));
  }

  private async prepareProfile() {
    this.userId = await this.client.getUserId();
    this.localpart = new UserID(this.userId).localpart;

    try {
      const profile = await this.client.getUserProfile(this.userId);
      if (profile && profile["displayname"])
        this.displayName = profile["displayname"];
    } catch (e) {
      // Non-fatal error - we'll just log it and move on.
      LogService.warn("CommandHandler", e);
    }
  }

  private async onMessage(roomId: string, ev: any) {
    const event = new MessageEvent(ev);
    if (event.isRedacted) return; // Ignore redacted events that come through
    if (event.sender === this.userId) return; // Ignore ourselves
    if (event.messageType !== "m.text") return; // Ignore non-text messages

    // Ensure that the event is a command before going on. We allow people to ping
    // the bot as well as using our COMMAND_PREFIX.
    const prefixes = [
      `${this.localpart}:`,
      `${this.displayName}:`,
      `${this.userId}:`,
    ];
    const prefixUsed = prefixes.find((p) => event.textBody.startsWith(p));
    if (!prefixUsed) return; // Not a command (as far as we're concerned)

    // get rest of command
    const message = event.textBody.substring(prefixUsed.length).trim();

    try {
      if (message.startsWith("/help")) {
        //return runHelloCommand(roomId, event, args, this.client);
        const text = `Help menu:\n${helpText}`;
        const html = `<b>Help menu:</b><br /><pre><code>${xss(
          helpText
        )}</code></pre>`;
        const reply = RichReply.createFor(roomId, ev, text, html); // Note that we're using the raw event, not the parsed one!
        reply["msgtype"] = "m.notice"; // Bots should always use notices
        return this.client.sendMessage(roomId, reply);
      } else {
        const { configError, userMessage, userConfig } =
          getUserConfigMessage(message);
      }
    } catch (e) {
      // Log the error
      LogService.error("CommandHandler", e);

      // Tell the user there was a problem
      const message = "There was an error processing your command";
      return this.client.replyNotice(roomId, ev, message);
    }
  }
}
