# QQ-Bot-Recorder
> powered by NapcatQQ & node-napcat-qq
Made by fogsong233 ♡
### Usage
Create a `config.ts` in  `src` and write as follow:
```ts
import { readFile } from "fs/promises";
import { BotConfig } from "./bot-config.js";

const GlobalConfig: BotConfig = {
  host: "", // ws server of napcatQQ
  port: ,
  token: , // napcatQQ token
  enableGroups: [/*enabled qq groups*/],
  debugMode: false,
  apiKey: /**Kimi recommended */,
  baseURL: "https://api.moonshot.cn/v1",
  dataPath: "./data/", //or others
  userPrompt: await readFile("prompt.md", { encoding: "utf-8" }),
  systemPrompt:
    " 你是一位资深计算机技术专家，精通各种前后端、\
    运维、数据库、算法与架构等领域，擅长从海量对话中快速提炼核心问题与解决方案， \
    并能用清晰、结构化的格式输出总结报告。",
  githubToken: token,
  githubRepo: { groupId: repoName ... },
  githubName: ...,
  noticeMsg: "早上好喵，昨天的的讨论内容汇总在这里了:",
};

export default GlobalConfig;

```.