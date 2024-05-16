require("dotenv").config();

import { generateTextResponse } from "./openai/chat";

const readline = require("node:readline").createInterface({
    input: process.stdin,
    output: process.stdout,
})

const getInputFromCLI = (prompt:string=""):Promise<string> => new Promise((resolve) => {
    readline.question(`${prompt}\n`, (cliInput:string) => {
        // readline.close()
        resolve(cliInput)
    })
})

async function askForInput() {
    const chatInput = await getInputFromCLI("\x1b[1mType something to the LLM\x1b[0m");
    const response = await generateTextResponse([{ role: "user", content: chatInput }]);
    console.log(`\x1b[32m${response}\x1b[0m`);
    askForInput();
}

askForInput();
