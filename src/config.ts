import { config } from "../config/default";

interface IConfig {
  homeserverUrl: string;
  dataPath: string;
  accessToken: string;
  APIKeyPath: string;
  organization: string;
}

export default <IConfig>config;
