import { dayDesc, delay, elog, getGroupImgDir, ilog, wlog } from "./util.js";
import { constants, createWriteStream } from "fs";
import {
  access,
  appendFile,
  mkdir,
  readdir,
  rm,
  stat,
  writeFile,
} from "fs/promises";
import GlobalConfig from "./config.js";
import { CronJob } from "cron";
import path from "path";
import { request } from "undici";
import { pipeline } from "stream/promises";
import { mdToPdf } from "md-to-pdf";
import { hash } from "crypto";
import { uploadPdfToAI } from "./ai.js";
import { commitToGithub } from "./github.js";
import napcat from "./napcat.js";

export async function initData() {
  try {
    await access(GlobalConfig.dataPath, constants.W_OK | constants.R_OK);
  } catch (err: any) {
    if (err.code === "ENOENT") {
      await mkdir(GlobalConfig.dataPath, { recursive: true });
      ilog(`${GlobalConfig.dataPath} has been maded.`);
    } else {
      elog("error when init data");
    }
  }
  try {
    for (const groupId of GlobalConfig.enableGroups) {
      await mkdir(getGroupImgDir(groupId), {
        recursive: true,
      });
    }
  } catch {}
}

export async function saveImg(
  groupId: number,
  url: string,
  type: string
): Promise<string> {
  const { body, statusCode } = await request(url);
  if (statusCode != 200) {
    return "";
  }
  const fileName = `${hash("sha1", url)}-${Date.now()}.${type}`;
  const filePath = path.join(getGroupImgDir(groupId), fileName);
  await pipeline(body, createWriteStream(filePath));
  return path.join(".", "/img", fileName);
}

export async function appendMsgToday(groupId: number, msg: string) {
  const basePath = path.join(GlobalConfig.dataPath, "" + groupId);
  const filePath = path.join(basePath, dayDesc() + ".md");
  await appendFile(filePath, "\n" + msg + "\n");
}

export async function toPdf(
  fileDirPath: string,
  fileName: string
): Promise<boolean> {
  try {
    const pdf = await mdToPdf({
      path: path.join(fileDirPath, fileName + ".md"),
    });
    if (pdf) {
      await writeFile(path.join(fileDirPath, fileName + ".pdf"), pdf.content);
      return true;
    }
  } catch {
    return false;
  }
  return false;
}

export async function dailyWork() {
  const dirs = (await readdir(GlobalConfig.dataPath))
    .filter(async (file) =>
      (await stat(path.join(GlobalConfig.dataPath, file))).isDirectory()
    )
    .filter((dir) => dir !== "img");
  for (const dir of dirs) {
    ilog(`start daily task of ${dir}`);

    const filePath = path.join(GlobalConfig.dataPath, dir);
    const groupId = parseInt(path.basename(filePath), 10);
    const fileName = `${dayDesc()}`;
    const summaryMdPath = path.join(filePath, fileName) + ".md";

    const pdfResult = await toPdf(filePath, fileName);
    const pdfPath = path.join(filePath, fileName) + ".pdf";
    if (!pdfResult) {
      wlog(`${pdfPath} do not convert to pdf!!!`);
      continue;
    }

    // upload to ai
    ilog("ready to upload pdf to ai");
    const mdValue = await uploadPdfToAI(pdfPath);
    await writeFile(summaryMdPath, mdValue);

    ilog("commit to github");
    const commitResult = await commitToGithub(groupId, summaryMdPath);
    if (commitResult != null) {
      ilog("commited successful");
      await napcat.send_group_msg({
        group_id: groupId,
        message: [
          {
            type: "text",
            data: { text: GlobalConfig.noticeMsg + commitResult.url },
          },
        ],
      });
    }
    await delay(2000);
  }
  if (new Date().getDay() === 4) {
    ilog("delete file cache");
    await rm(GlobalConfig.dataPath, { recursive: true, force: true });
    await initData();
    ilog("delete successfully");
  }
  ilog("end daily task");
}

export async function startDailyTask() {
  new CronJob("0 40 3 * * *", dailyWork, null, true);
}
