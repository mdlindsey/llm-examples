import "openai/shims/web";
import OpenAI from "openai";

export type EmbeddingInput = OpenAI.EmbeddingCreateParams["input"];
export type EmbeddingModel = OpenAI.EmbeddingCreateParams["model"];
export type OpenAIChatMessage = OpenAI.Chat.Completions.ChatCompletionMessageParam;

export const defaultChatModel = "gpt-3.5-turbo-0125";
export const defaultEmbeddingModel = "text-embedding-3-small";
export const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
