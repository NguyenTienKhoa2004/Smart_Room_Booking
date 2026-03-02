import { LLMProvider } from "./llm.provider";

export class MockLLMProvider implements LLMProvider {
    async generate(prompt: string, options?: any): Promise<string> {
        return JSON.stringify({
            answer: "For now this only for mock",
            citations: []
        });
    }
}