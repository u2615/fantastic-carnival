import { chatConfig } from "../../config/chat";
import { UserConfig } from "./chat";

export const getUserConfigMessage = (
  bareMessage: string,
  defaultConfig: UserConfig
): {
  userMessage: string;
  userConfig: UserConfig;
  configError: string;
} => {
  const matches = bareMessage.match(/([^]+?)#{4,}([^]*)/);
  if (matches) {
    const [, configMessage, userMessage] = matches;

    if (!userMessage) {
      throw Error("No message beyond configuration...");
    }

    const reg = new RegExp(/^\/(.+?):(.+?)\//, "gsm");

    const { configuration, error } = [...configMessage.matchAll(reg)].reduce(
      (acc, [, key, value]) => {
        key = key.trim();
        let parsedValue: string | number = value.trim();
        if (["model", "temperature", "role"].includes(key)) {
          if (key == "temperature") {
            parsedValue = Number(value);
            if (isNaN(parsedValue) || parsedValue < 0 || parsedValue > 2) {
              acc.error += "Error: Invalid temperature value, discarded";
              return acc;
            }
          }
          if (key == "model" && value != "gpt-4") {
            acc.error += "Error: Invalid model value, discarded";
            return acc;
          }
          acc.configuration[key] = parsedValue;
        } else {
          acc.error += `Error : There is no ${key} option possible`;
        }
        return acc;
      },
      {
        configuration: {} as UserConfig,
        error: "",
      }
    );
    return {
      userMessage,
      configError: error,
      userConfig: Object.assign(defaultConfig, configuration),
    };
  }
  return {
    userConfig: defaultConfig,
    userMessage: bareMessage,
    configError: "",
  };
};
