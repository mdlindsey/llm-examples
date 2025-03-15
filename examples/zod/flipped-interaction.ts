import z from "zod";
import { trimPrompt } from "../../openai/abstract";
import { safelyGenerateStructuredResponse } from "../../openai/zod";

const questionSchema = z.object({
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

export async function structuredFlippedInteractionExample() {
    return safelyGenerateStructuredResponse(questionSchema, [
        {
            role: "system",
            content: trimPrompt(`
                Please ask me multiple choice questions to accurately determine 
                how to best pay off my debts. You should ask me questions until you have all the information 
                you need to help me pay off my debt. Ask me the questions one at a time. 

                Each question you ask must include the following information:
                1. The most critical question to ask next based on previous Q&A
                2. Multiple choice answers to your question
                3. Whether manual input is allowed (eg: "other" choice)
                   If manual input is allowed you must provide the choice label for the manual input option (eg: "other")
                   You must also include the format for this manual input (eg: "text" or "number")
                4. Are any more questions required to determine my car's value? ie: is this the final question?
            `)
        },
        { role: "user", content: "Ask me the first question" },
        // { role: "assistant", content: "What is the total amount of debt you currently have?" },
        // { role: "user", content: "More than $100,000" },
    ]);
}
