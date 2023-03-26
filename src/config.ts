import { config } from "../config/default";

interface IConfig {
  homeserverUrl: string;
  dataPath: string;
  accessToken: string;
}

export default <IConfig>config;
