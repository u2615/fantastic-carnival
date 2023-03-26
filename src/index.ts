import {
  AutojoinRoomsMixin,
  ICryptoStorageProvider,
  LogLevel,
  LogService,
  MatrixClient,
  RichConsoleLogger,
  RustSdkCryptoStorageProvider,
  SimpleFsStorageProvider,
} from "matrix-bot-sdk";
import { getSecret } from "./helpers/getSecret";
import * as path from "path";
import config from "./config";
import CommandHandler from "./commands/handler";

// First things first: let's make the logs a bit prettier.
LogService.setLogger(new RichConsoleLogger());

// For now let's also make sure to log everything (for debugging)
LogService.setLevel(LogLevel.DEBUG);

// Also let's mute Metrics, so we don't get *too* much noise
LogService.muteModule("Metrics");

// Print something so we know the bot is working
LogService.info("index", "Bot starting...");

try {
  //get bot access token
  const accessToken = await getSecret(config.accessToken);

  // Prepare the storage system for the bot
  const storage = new SimpleFsStorageProvider(
    path.join(config.dataPath, "bot.json")
  );

  // Prepare a crypto store
  const cryptoStore: ICryptoStorageProvider = new RustSdkCryptoStorageProvider(
    path.join(config.dataPath, "encrypted")
  );

  // Now create the client
  const client = new MatrixClient(
    config.homeserverUrl,
    accessToken,
    storage,
    cryptoStore
  );

  // Setup the autojoin mixin (if enabled)
  AutojoinRoomsMixin.setupOnClient(client);

  // Prepare the command handler
  const commands = new CommandHandler(client);
  await commands.start();

  LogService.info("index", "Starting sync...");
  await client.start(); // This blocks until the bot is killed
} catch (e: any) {
  LogService.error(`⚠️ Error !: ${e.message}`);
}
