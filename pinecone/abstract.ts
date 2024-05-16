import { Pinecone, RecordMetadata } from "@pinecone-database/pinecone";

export type PineconeVector = {
    id: string
    values: number[]
    metadata: RecordMetadata
}
export const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY || "" });
