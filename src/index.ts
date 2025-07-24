import napcat from "./napcat.js";
import { startMsgRecord } from "./msg-record.js";
import { ilog } from "./util.js";
import { initData, startDailyTask } from "./io.js";

async function main() {
  await initData();
  ilog("qq-recorder start");
  await napcat.connect();
  startDailyTask();
  ilog("successful connected");
  startMsgRecord();
}

main();
