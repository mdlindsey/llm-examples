import { pinecone } from "./abstract";

export async function queryVectors(indexId: string, vector:number[], topK=10) {
    const pineconeIndex = pinecone.Index(indexId);
    return pineconeIndex.query({
        topK,
        vector,
        includeMetadata: true,
        includeValues: true,
    });
}
