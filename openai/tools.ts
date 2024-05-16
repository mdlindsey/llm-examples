import {
  openai,
  defaultChatModel,
  OpenAIChatMessage,
} from "./abstract";
import type { BaseFunctionsArgs } from "openai/lib/RunnableFunction";
import type { ChatCompletionToolRunnerParams } from "openai/lib/ChatCompletionRunner";

export async function generateTextResponseWithTools(
  messages: OpenAIChatMessage[],
  tools: ChatCompletionToolRunnerParams<BaseFunctionsArgs>["tools"],
  temperature: number = 0.3,
  model = defaultChatModel,
) {
  const runner = openai.beta.chat.completions.runTools({ messages, model, tools, temperature });
    // .on("message", (message:any) => console.log(message))
  const finalContent = await runner.finalContent()
  return finalContent
}
