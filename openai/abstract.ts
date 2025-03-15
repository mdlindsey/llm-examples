import "openai/shims/web";
import OpenAI from "openai";
import type { BaseFunctionsArgs } from "openai/lib/RunnableFunction";
import type { ChatCompletionToolRunnerParams } from "openai/lib/ChatCompletionRunner";

export type EmbeddingInput = OpenAI.EmbeddingCreateParams["input"];
export type EmbeddingModel = OpenAI.EmbeddingCreateParams["model"];
export type OpenAIChatMessage = OpenAI.Chat.Completions.ChatCompletionMessageParam;
export type OpenAITool = ChatCompletionToolRunnerParams<BaseFunctionsArgs>["tools"];

export const defaultChatModel = "gpt-3.5-turbo-0125";
export const defaultEmbeddingModel = "text-embedding-3-small";
export const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const trimPrompt = (prompt: string) => prompt.trim().replace(/^ +/gm, "");
