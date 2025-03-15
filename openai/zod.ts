import z from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { generateTextResponseWithTools } from "./tools";
import { trimPrompt, type OpenAIChatMessage, type OpenAITool } from "./abstract";

function omitUnknownProps(schemaJson:Object) {
    const schemaCopy = <any>{ ...schemaJson };
    const knownProperties = ["type", "items", "properties", "description"];
    for(const prop in schemaCopy) {
        if (!knownProperties.includes(prop)) {
            delete schemaCopy[prop];
        }
        if (prop === "items") {
            schemaCopy[prop] = omitUnknownProps(schemaCopy[prop]);
        }
        if (prop === "properties") {
            for(const definedProp in schemaCopy[prop]) {
                schemaCopy[prop][definedProp] = omitUnknownProps(schemaCopy[prop][definedProp]);
            }
        }
    }
    const { type, description, properties, items } = schemaCopy;
    return { type, description, properties, items };
}

function zodToJson(schemaJson:z.Schema) {
    const rawSchema = zodToJsonSchema(schemaJson);
    const knownSchema = omitUnknownProps(rawSchema);
    console.log("Parsed zod schema into OpenAI function parameters:", knownSchema);
    return knownSchema;
}
export async function safelyGenerateStructuredResponse(
    schema:z.Schema,
    messages:OpenAIChatMessage[],
    functionName="print",
    functionDescription="Respond by calling this function to print your response",
    genericParse=true, // zod parsing breaks/returns nothing
    additionalTools=<OpenAITool>[],
) {

    console.log("Attempting to generate structured response...", schema);
    const rawResponse = await generateStructuredResponse(
        schema,
        messages,
        functionName,
        functionDescription,
        genericParse,
        additionalTools,
    );

    console.log("Attempting to safely parse raw response:", rawResponse);
    const { success, error } = schema.safeParse(rawResponse);
    if (success) {
        console.log("No parsing errors encountered; returning...");
        return rawResponse;
    }
    console.log("Encountered parsing errors:", error);
    const askNicelyPrompt = trimPrompt(`
        You improperly called the ${functionName} function.
        The parser gave the following errors contained within the triple quotes:
        """${JSON.stringify(error)}"""
        Your original response is contained within the next set of triple quotes:
        """${JSON.stringify(rawResponse)}"""

        Please reformat your response to properly adhere to the ${functionName}
        function schema and recall the ${functionName} function.
    `);
    console.log("Asking nicely:", askNicelyPrompt);
    const askNicelyResponse = await generateStructuredResponse(
        schema,
        [...messages, { role: "user", content: askNicelyPrompt }],
        functionName,
        functionDescription,
        genericParse,
        additionalTools,
    );
    return askNicelyResponse;

}
export const generateStructuredResponse = (
    schema:z.Schema,
    messages:OpenAIChatMessage[],
    functionName="print",
    functionDescription="Always call this function to print your response",
    genericParse=true, // zod parsing breaks/returns nothing
    additionalTools=<OpenAITool>[],
) => new Promise(async (resolve, reject) => 
    generateTextResponseWithTools(messages, [
        ...additionalTools,
        {
            type: "function",
            function: {
                name: functionName,
                parameters: zodToJson(schema),
                description: functionDescription,
                function: (args:any) => {
                    console.log("string args:", args);
                    // console.log("json args:", JSON.stringify(args, null, 2));
                    // console.log("zod args:", schema.parse(args));
                    resolve(args);
                    return args;
                },
                parse: genericParse ? JSON.parse : schema.parse,
            },
        },
]));
