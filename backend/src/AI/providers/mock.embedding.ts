import { EmbeddingProvider } from "./embedding.provider";

export class MockEmbeddingProvider implements EmbeddingProvider {
    embed(text: string): Promise<number[]> {
        return Promise.resolve(
            Array(1536).fill(0).map(() => Math.random())
        );
    }

    embedBatch(texts: string[]): Promise<number[][]> {
        return Promise.all(texts.map(t => this.embed(t)));
    }

    getDimension(): number {
        return 1536;
    }
}