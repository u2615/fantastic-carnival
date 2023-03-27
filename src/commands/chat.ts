import { Configuration, OpenAIApi } from "openai";
import { getSecret } from "../helpers/getSecret";
import config from "../config";

const APIKey = await getSecret(config.APIKey);
const configuration = new Configuration({
  apiKey: APIKey,
});

const getSetCache = async () => {};
