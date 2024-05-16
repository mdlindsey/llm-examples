import { createHash } from "crypto";
import { loadDocuments, chunkDocument } from "../../langchain/documents";
import { generateEmbeddings } from "../../openai/embed";
import { upsertVectors } from "../../pinecone/upsert";
import { queryVectors } from "../../pinecone/query";
import { generateTextResponse } from "../../openai/chat";

type DocumentChunk = {
    metadata: { source: string, lines: [number, number] }
    content: string
};

export async function loadDocumentChunks(dirPath: string) {
    const docs = await loadDocuments(dirPath);
    const formattedChunks:DocumentChunk[] = [];
    for(const docIdx in docs) {
        const doc = docs[docIdx];
        const {
            pageContent: fullDocumentText,
            metadata: { source }
        } = doc;
        console.log(fullDocumentText.length, "|", source);
        const chunks = await chunkDocument(doc);
        for(const chunkIdx in chunks) {
            const chunk = chunks[chunkIdx];
            const {
                pageContent: chunkContent,
                metadata: { loc: { lines: { from:lineNumStart, to:lineNumEnd } } }
            } = chunk;
            const formattedChunk:DocumentChunk = {
                metadata: { source, lines: [lineNumStart, lineNumEnd] },
                content: chunkContent,
            };
            console.log("Chunk", chunkIdx, {
                length: formattedChunk.content.length,
                ...formattedChunk.metadata
            });
            formattedChunks.push(formattedChunk);
        }
    }
    return formattedChunks;
}

type DocumentChunkVector = {
    id: string
    vector: number[]
    chunk: DocumentChunk
};
function metadataToChunkId(metadata: DocumentChunk["metadata"]) {
    const { source, lines: [lineStart, lineEnd] } = metadata;
    return `${createHash("sha256").update(source).digest("hex")}-${lineStart}-${lineEnd}`;
}
async function embedAndUpsertChunkedDocument(chunks:DocumentChunk[], batchSize = 100) {
    const chunkVectors:DocumentChunkVector[] = [];
    let docPtr = 0;
    for(let ptr = 0; ptr <= chunks.length; ptr += batchSize) {
        if (ptr && chunks[ptr].metadata.source !== chunks[ptr-1].metadata.source) {
            docPtr = 0;
        } else {
            docPtr++;
        }
        const batch = chunks.slice(ptr, ptr+batchSize);
        const batchContents = batch.map(chunk => chunk.content.replace(/\n/g, " "));
        const batchVectors = await generateEmbeddings(batchContents);
        const formattedBatch: DocumentChunkVector[] = batch.map(({ metadata, content }, chunkIdx) => ({
            id: metadataToChunkId(metadata),
            vector: batchVectors[chunkIdx],
            chunk: { metadata, content },
        }));

        await upsertVectors(
            pineconeIndex,
            formattedBatch.map(({ id, vector:values, chunk: { metadata, content } }) => ({
                id,
                values,
                metadata: {
                    source: metadata.source,
                    lineStart: String(metadata.lines[0]),
                    lineEnd: String(metadata.lines[1]),
                    chunkContent: content,
                },
            }))
        );

        chunkVectors.push(...formattedBatch);
    }
    return chunkVectors;
}

export async function ragEmbeddingExample() {
    const formattedChunks = await loadDocumentChunks("./examples/rag/documents");
    await embedAndUpsertChunkedDocument(formattedChunks);
}

const pineconeIndex = "classic-books";
const incomingUserQuery = "Who is Mr. Gatsby?";
export async function ragQueryExample() {
    const [queryVector] = await generateEmbeddings(incomingUserQuery);
    const { matches } = await queryVectors(pineconeIndex, queryVector);
    console.log(matches.map(({ score, metadata }) => ({ score, metadata })));
    if (!matches.length) {
        console.log("No matches found; LLM will not be queried");
        return;
    }
    const ragContextChunks = matches.map((m,i) => (
        `RAG Context Chunk #${i+1}\n` +
        `Chunk metadata: ${JSON.stringify(m.metadata)}` +
        `Chunk contents: ${m.metadata?.chunkContent}`
    ));
    const ragContextStr = ragContextChunks.join("\n\n");
    const llmResponse = await generateTextResponse([
        { role: "system", content: "You are an expert on classic books." },
        // { role: "system", name: "RAG Context", content: ragContextStr },
        { role: "function", name: "getQueryContextFromRAG", content: ragContextStr },
        // { role: "user", content: `Use the following context to answer the question: ${ragContextStr}` },
        { role: "user", content: incomingUserQuery },
    ]);
    console.log(llmResponse);
}
