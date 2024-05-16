import {
    openai,
    defaultEmbeddingModel,
    EmbeddingInput,
    EmbeddingModel,
} from "./abstract";

export async function generateEmbeddings(
    input: EmbeddingInput,
    model: EmbeddingModel = defaultEmbeddingModel,
    // dimensions: 1536,
    // encoding_format: "float",
) {
    const embedResponse = await openai.embeddings.create({ model, input });
    const embeddingsArray = embedResponse.data.map(({ embedding }) => embedding);
    return embeddingsArray;
}
