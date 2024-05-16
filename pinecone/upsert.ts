import { PineconeVector, pinecone } from "./abstract";

export async function upsertVectors(indexId: string, vectors: PineconeVector[]) {
    const pineconeIndex = pinecone.Index(indexId);
    console.log("Upserting vectors", vectors.map(({ id, metadata }) => ({ id, metadata })))
    await pineconeIndex.upsert(vectors);
}
