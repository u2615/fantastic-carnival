import { Configuration, OpenAIApi, ChatCompletionRequestMessage } from "openai";
import { getSecret } from "../helpers/getSecret";
import { formatMessage } from "../helpers/createChatObject";
import config from "../config";
import { chatConfig } from "../config/chat";
import systemRole from "../helpers/systemRole";
import { FileHandle, open as openFile } from "node:fs/promises";

interface IRequest {
  model: string;
  messages: ChatCompletionRequestMessage[];
  temperature: number;
}

interface MessageConstruct {
  messages: ChatCompletionRequestMessage[];
  config: UserConfig;
}

interface Config {
  [key: string]: string | number;
}

type UsageResponse = {
  completion_tokens: number;
  prompt_tokens: number;
  total_tokens: number;
};

export interface UserConfig extends Config {
  model: string;
  temperature: number;
  role: string;
}

const APIKey = await getSecret(config.APIKeyPath);
const CONFIGURATION = new Configuration({
  apiKey: APIKey,
  organization: config.organization,
});

const createRequest = (
  { messages, config: { model, temperature, role } }: MessageConstruct,
  fn = systemRole
): IRequest => {
  return {
    model,
    temperature,
    messages: [fn(role), ...messages],
  };
};

const createMessages = async (
  message: ChatCompletionRequestMessage,
  fh: FileHandle,
  isReply: boolean
): Promise<ChatCompletionRequestMessage[]> => {
  try {
    return isReply
      ? [
          ...JSON.parse(await fh.readFile({ encoding: "utf-8" })).messages,
          message,
        ]
      : [message];
  } catch (e: any) {
    throw Error(`😔 Error reading file ${config.cacheFilePath}:\n${e.message}`);
  }
};

const writeToCache = async (
  chat: ChatCompletionRequestMessage[],
  answer: ChatCompletionRequestMessage | undefined,
  fh: FileHandle
): Promise<void> => {
  try {
    await fh.truncate();
    await fh.write(
      JSON.stringify({ messages: answer ? [...chat, answer] : chat }),
      0
    );
  } catch (e: any) {
    throw Error(`😔 Error writing file ${config.cacheFilePath}:\n${e.message}`);
  }
};

const callOpenai =
  (openai: OpenAIApi, defaultConfig = chatConfig) =>
  async ({
    userMessage,
    isReply,
    endConfig,
  }: {
    userMessage: string;
    isReply: boolean;
    endConfig: UserConfig;
  }): Promise<{ usage: UsageResponse | undefined; answer: string }> => {
    let fh;
    try {
      //open the cache file
      const filePath = new URL(config.cacheFilePath, import.meta.url);
      fh = await openFile(filePath, "r+");

      //get messages
      const messages = await createMessages(
        formatMessage("user", userMessage),
        fh,
        isReply
      );
      //request
      const request = createRequest({
        messages,
        config: endConfig,
      });
      //call API
      const {
        data: {
          usage,
          choices: [{ message }],
        },
      } = await openai.createChatCompletion(request);
      //cache current messages
      await writeToCache(messages, message, fh);
      return {
        usage,
        answer:
          message?.content ?? "💩 Something went wrong calling this damn API",
      };
    } catch (e: any) {
      throw Error(`😔 Error calling Openai API:\n${e.message}`);
    } finally {
      await fh?.close();
    }
  };

export default await callOpenai(new OpenAIApi(CONFIGURATION));
