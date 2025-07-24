import { NCWebsocket } from "node-napcat-ts";
import GlobalConfig from "./config.js";

const napcat = new NCWebsocket(
  {
    protocol: "ws",
    host: GlobalConfig.host,
    port: GlobalConfig.port,
    accessToken: GlobalConfig.token,
    reconnection: {
      enable: true,
      attempts: 10,
      delay: 5000,
    },
  },
  GlobalConfig.debugMode
);

export default napcat;
