import z from "zod";
import { generateStructuredResponse } from "../openai/chat";

const zodQuestionSchema = z.object({
    question: z.string().describe("The next question you want to ask"),
    choices: z.array(z.string()).describe("Multiple choice answers to your next question"),
    multiSelect: z.boolean().describe("Denotes whether the user can select multiple choices"),
    manualInput: z.object({
        allowed: z.boolean().describe("Denotes whether manual input (aka \"other\" multiple choice answer) is allowed/required to answer the question"),
        inputChoice: z.string().describe("The multiple choice answer from above that appears next to the manual input field; eg: \"Other\", etc"),
        inputFormat: z.enum(["text", "number"]).describe("Denotes the optimal formatting of manual input when allowed/required"),
    }),
    isFinalQuestion: z.boolean().describe("Set to true if this is the last question required"),
});

type ZodQuestionSchema = z.infer<typeof zodQuestionSchema>;
export async function zodQuestionExample() {
    const formattedQuestion = await generateStructuredResponse([
        { role: "system", content: "You are a car value expert" },
        { role: "user", content: "Ask me the first question" },
    ], zodQuestionSchema)
    console.log(JSON.stringify(formattedQuestion, null, 2));
}
const trimPrompt = (prompt: string) => prompt.trim().replace(/^ +/gm, "");

const topicSchema = z.object({
    label: z.string().describe("The label for this topic"),
    summary: z.string().describe("Comprehensive summary of this topic"),
});

const expandableTopicSchema = topicSchema.extend({
    subTopics: z.array(topicSchema).describe("Expandable sub-topics for the main topic")
});

export const outlineSchema = z.object({
    title: z.string().describe("The main topic of the outline and bullet points"),
    topics: z.array(expandableTopicSchema).describe("The topics for the current outline section"),
});
export async function zodOutlineExample() {
    const formattedOutline = await generateStructuredResponse([
        { role: "system", content: trimPrompt(`
            Act as an outline expander.

            Generate a bullet point outline then ask me for which bullet point you should expand on.
            Your outline must contain at least 3 bullet points.

            Create a new outline for the bullet point that I selected.

            Then, ask me for what bullet point to expand next, and show me the content of that bullet point.

            Finally, ask me what bullet point to open and show me the detailed information associated with the label of that bullet point within the outline.
        `) },
        { role: "user", content: "Create an outline on the topic of understanding the value of cars" },
    ], outlineSchema)
    console.log(JSON.stringify(formattedOutline, null, 2));
}
