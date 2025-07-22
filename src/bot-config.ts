export interface BotConfig {
  host: string;
  port: number;
  token: string;
  enableGroups: number[];
  debugMode: boolean;
  apiKey: string;
  baseURL: string;
  dataPath: string;
  userPrompt: string;
  systemPrompt: string;
  githubToken: string;
  githubRepo: { [K in BotConfig["enableGroups"][number]]: string };
  githubName: string;
  noticeMsg: string;
}
