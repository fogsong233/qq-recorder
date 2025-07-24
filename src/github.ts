import { Octokit } from "@octokit/rest";
import GlobalConfig from "./config.js";
import { readFile } from "fs/promises";
import { dayDesc, ilog, monthDesc, wlog } from "./util.js";
import path from "path";

const octoKit = new Octokit({
  auth: GlobalConfig.githubToken,
});

export async function commitToGithub(groupId: number, filePath: string) {
  const owner = GlobalConfig.githubName;
  const repo = GlobalConfig.githubRepo[groupId];
  ilog(GlobalConfig.githubRepo[groupId]);
  ilog(groupId);
  if (!repo) return;
  const branch = "main";
  const localContent = await readFile(filePath);
  const contentBase64 = localContent.toString("base64");
  const targetPath = `summary/${monthDesc()}/${path.basename(filePath)}`;
  // 检查是否已有这个文件（获取 SHA，如果存在要用于更新）
  let sha: string | undefined = undefined;
  try {
    const { data: fileData } = await octoKit.repos.getContent({
      owner,
      repo,
      path: targetPath,
      ref: branch,
    });
    if (!Array.isArray(fileData) && fileData.sha) {
      sha = fileData.sha;
    }
  } catch (error: any) {
    wlog(`commit ${filePath} failed: ${error}`);
    return null;
  }

  const res = await octoKit.repos.createOrUpdateFileContents({
    owner,
    repo,
    path: targetPath,
    message: `Add ${dayDesc()} summary`,
    content: contentBase64,
    branch,
    sha,
  });

  ilog(`Github: uploaded status ${res.status}`);
  return res;
}
