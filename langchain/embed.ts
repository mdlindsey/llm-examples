import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { defaultEmbeddingModel, EmbeddingModel } from "../openai/abstract";

export async function generateEmbeddings(
    input:string | string[],
    model: EmbeddingModel = defaultEmbeddingModel,
) {
    const openaiEmbedding = new OpenAIEmbeddings({ model });
    if (Array.isArray(input)) {
        return openaiEmbedding.embedDocuments(input);
    }
    return openaiEmbedding.embedQuery(input);
}
