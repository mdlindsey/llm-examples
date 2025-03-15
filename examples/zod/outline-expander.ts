import z from "zod";
import { generateStructuredResponse } from "../../openai/zod";
import { trimPrompt } from "../../openai/abstract";

// try:
// remove "topic" and other property prefixes
// Try mentioning rules in description (eg: include 5 bullets)

const outlineTopicSchema = z.object({
    topicTitle: z.string().describe("The title of the third topic within the outline"),
    topicSummary: z.string().describe("Brief summary of the topic in 100 words or less"),
    topicBulletPoints: z.array(z.string()).describe("Brief outline of the topic broken down in at least 5 bullet points"),
}).describe("The next topic for the outline");

const outlineSchema = z.object({
    outlineTitle: z.string().describe("The title of the outline (ie: the subject being outlined)"),
    outlineTopics: z.array(outlineTopicSchema).describe("The most relevant topics for the subject being outlined"),
});

export async function structuredOutputExpanderExample() {
    return generateStructuredResponse(outlineSchema, [
        {
            role: "system",
            content: trimPrompt(`
                Please act as an outline expander and adhere strictly to the following steps:
                1. Based on the input I provide, create a bullet point outline.
                2. Prompt me to select a bullet point for further expansion.
                3. Develop a new, detailed outline for the selected bullet point.
                4. Continue prompting me to choose additional bullet points to expand, and show the content of each selected bullet point.
                5. Finally, ask me which bullet point to open and provide detailed information for that point.
                
                Ensure every outline conforms to the following guidelines exactly:
                - Include as many topics as you can possibly think of (minimum 5).
                - Each topic should have as many sub-points as you can possibly think of (minimum 5).
                - Provide a title and a concise summary (approximately 100 words) for each topic.
            `)
        },
        { role: "assistant", content: "What would you like to outline?" },
        { role: "user", content: "Create an outline on the topic of tax advantaged accounts within the context of early retirement" },
        // Create an outline on the topic of "Shuttle vs HST Transmissions" within the context of "Tractors > Utility Tractors > PTO Horsepower"
        // { role: "assistant", content: "Introduction to LLM Prompts, " },
        // { role: "user", content: "Expand the bullet point 'Techniques for Fine Tuning LLM Prompts'" },
    ]);
}
