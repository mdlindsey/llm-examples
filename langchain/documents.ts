import type { Document } from "@langchain/core/documents";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

export async function loadDocuments(dirPath:string):Promise<Document[]> {
    const loader = new DirectoryLoader(dirPath, {
        ".pdf": (path) => new PDFLoader(path),
        ".txt": (path) => new TextLoader(path),
    });
    const docs = await loader.load();
    return docs;
}

export async function chunkDocument(doc:Document, chunkSize = 1000) {
    console.log(`Chunking document: ${doc.metadata.source}`);
    const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize });
    const chunks = await textSplitter.createDocuments([doc.pageContent]);
    console.log(`Text split into ${chunks.length} chunks`);
    return chunks;
}
