export interface LLMProvider {
    generate(
        prompt: string,
        options?: { temperature?: number; maxTokens?: number }
    ): Promise<string>;
}