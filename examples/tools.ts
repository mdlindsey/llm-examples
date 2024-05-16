import { generateTextResponseWithTools } from "../openai/tools";

async function getCurrentLocation() {
    console.log("getCurrentLocation called");
    return "Charlotte"; // Simulate lookup
}

async function getWeather(args: { location: string }) {
    console.log("getWeather called with args", args);
    return { temperature: 69, precipitation: 89 };
}

export async function toolsExample() {
    const llmResponse = await generateTextResponseWithTools([
        { role: "system", content: "You are a helpful weather assistant" },
        { role: "user", content: "What's the weather like today?" },
    ], [
        {
            type: "function",
            function: {
                description: "Gets the users current location",
                parse: () => { },
                function: getCurrentLocation,
                parameters: { type: "object", properties: {} },
            },
        },
        {
            type: "function",
            function: {
                description: "Gets the weather for a provided location",
                function: getWeather,
                parse: JSON.parse, // or use a validation library like zod for typesafe parsing.
                parameters: {
                    type: "object",
                    properties: {
                        location: { type: "string" },
                    },
                },
            },
        },
    ]);
    console.log(llmResponse);
}
