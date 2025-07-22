import { log } from "console";
import napcat from "./napcat.js";
import GlobalConfig from "./config.js";
import { ilog, mdImg } from "./util.js";
import { Receive } from "node-napcat-ts";
import { text } from "stream/consumers";
import { appendMsgToday, saveImg } from "./io.js";

async function getMsgContentMd(
  groupId: number,
  msg: Receive[keyof Receive][]
): Promise<string> {
  let res = "";
  for (const item of msg) {
    switch (item.type) {
      case "text":
        res += item.data.text;
        break;
      case "at":
        if (item.data.qq === "all") {
          res += "@所有人";
        } else {
          const userInfo = await napcat.get_group_member_info({
            user_id: parseInt(item.data.qq, 10),
            group_id: groupId,
          });
          res += `@${userInfo.nickname}`;
        }
      case "image":
      case "file":
        if (
          "file" in item.data &&
          item.data.file !== undefined &&
          "url" in item.data &&
          item.data.url !== undefined
        ) {
          const type = item.data.file.split(".").slice(-1)[0];
          const filePath = await saveImg(groupId, item.data.url, type);
          res += mdImg(filePath);
        }
        break;
      case "dice":
      case "reply":
      case "record":
      case "forward":
      default:
        break;
    }
  }
  return res;
}

export function startMsgRecord() {
  napcat.on("message.group", async (msg) => {
    if (GlobalConfig.enableGroups.includes(msg.group_id)) {
      // parse to md
      const contentMd = await getMsgContentMd(msg.group_id, msg.message);
      ilog(contentMd);
      const headerMd = `**${msg.sender.nickname}**  _${msg.sender.user_id}_ : \n\n`;
      await appendMsgToday(msg.group_id, headerMd + contentMd);
    }
  });
}
