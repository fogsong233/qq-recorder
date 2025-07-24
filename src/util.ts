import { error, group, warn } from "console";
import path from "path";
import { exit } from "process";
import GlobalConfig from "./config.js";

export function ilog(message?: any) {
  console.log(`[application]${message}`);
}
export function elog(message?: any) {
  error(`[application:err]${message}`);
  exit();
}
export function wlog(message?: any) {
  warn(`[application:err]${message}`);
}

export function mdImg(path: string) {
  return `\n![](${path})\n`;
}

export function dayDesc(): string {
  const today = new Date();
  let hour = today.getHours();
  let year = today.getFullYear();
  let month = today.getMonth() + 1;
  let day = today.getDate();

  // 如果当前时间在 0:00 到 3:59 之间，日期应该是前一天
  if (hour < 4) {
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    day = yesterday.getDate();
    year = yesterday.getFullYear();
    month = yesterday.getMonth() + 1;
  }

  return `${year}-${month}-${day}`;
}

export function monthDesc(): string {
  const today = new Date();
  let hour = today.getHours();
  let year = today.getFullYear();
  let month = today.getMonth() + 1;

  // 如果当前时间在 0:00 到 3:59 之间，日期应该是前一天
  if (hour < 4) {
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    year = yesterday.getFullYear();
    month = yesterday.getMonth() + 1;
  }

  return `${year}-${month}`;
}

export function getGroupImgDir(groupId: number) {
  return path.join(GlobalConfig.dataPath, groupId + "/img");
}

export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
