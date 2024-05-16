import {
    openai,
    defaultChatModel,
    OpenAIChatMessage,
} from "./abstract";

// OpenAI.SetTools().SetResponseSchema().Query()

export async function generateTextResponse(
    messages: OpenAIChatMessage[],
    temperature: number = 0.3,
    model = defaultChatModel,
) {
    console.log("Message chain:", messages, "\n\n")
    const completion = await openai.chat.completions.create({
        model,
        temperature,
        messages,
        response_format: { type: "text" },
    });

    const llmResponse = completion.choices[0].message.content as string
    return llmResponse
}

import z from "zod";
import { chat } from "zod-gpt";
import { ChatRequestMessage, OpenAIChatApi } from "llm-api";

export async function generateStructuredResponse(
    messages: ChatRequestMessage[],
    schema: z.Schema,
    temperature: number = 0.3,
    model = defaultChatModel,
) {
    const openai = new OpenAIChatApi({ apiKey: process.env.OPENAI_API_KEY }, { temperature, model });
    const chatResponse = await chat(openai, messages, { schema });
    // console.log("Message chain:", messages, "\n\n")
    // console.log("Response object:", chatResponse, "\n\n")
    return chatResponse.data;
}
