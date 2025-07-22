import OpenAI from "openai";
import GlobalConfig from "./config.js";
import { createReadStream } from "fs";
import { Content } from "openai/resources/containers/files.mjs";
import { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { delay, elog, ilog, wlog } from "./util.js";
import { FileCreateParams } from "openai/resources";

const client = new OpenAI({
  apiKey: GlobalConfig.apiKey,
  baseURL: GlobalConfig.baseURL,
});

export async function uploadPdfToAI(filePath: string): Promise<string> {
  try {
    ilog(`upload pdf ${filePath}`);
    let pdfFile = await client.files.create({
      file: createReadStream(filePath),
      purpose: "file-extract",
    } as unknown as FileCreateParams); // kimi still use it
    let fileContent = await (await client.files.content(pdfFile.id)).text();

    const messages: ChatCompletionMessageParam[] = [
      { role: "system", content: GlobalConfig.systemPrompt },
      { role: "system", content: fileContent },
      { role: "user", content: GlobalConfig.userPrompt },
    ];
    const completion = await client.chat.completions.create({
      model: "kimi-k2-0711-preview",
      messages: messages,
      temperature: 0.6,
    });
    return completion.choices[0].message.content ?? "Something went errors...";
  } catch {
    wlog(`${filePath}.pdf is not uploaded to AI!`);
    return "Something went errors...";
  }
}
