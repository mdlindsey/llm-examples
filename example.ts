require("dotenv").config();
import { toolsExample } from "./examples/tools";
import { ragQueryExample, ragEmbeddingExample } from "./examples/rag";
import { structuredOutputExpanderExample } from "./examples/zod/outline-expander";
import { structuredFlippedInteractionExample } from "./examples/zod/flipped-interaction";

structuredOutputExpanderExample
async function runExample() {
    const startTime = new Date().getTime();
    const structuredQuestion = await structuredFlippedInteractionExample();
    console.log("Structured question:", structuredQuestion);
    // const structuredOutline = await structuredOutputExpanderExample();
    // console.log("Structured outline:", structuredOutline);
    // ragQueryExample();
    // ragEmbeddingExample();
    // zodQuestionExample();
    // zodOutlineExample();
    const endTime = new Date().getTime();
    console.log(`Execution took ${endTime - startTime}ms`);
}

runExample();
