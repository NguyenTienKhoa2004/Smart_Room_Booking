import { LLMProvider } from "./llm.provider";

export class MockLLMProvider implements LLMProvider {
    async generate(prompt: string): Promise<string> {
        return JSON.stringify({
            answer: "Đây là câu trả lời mock.",
            citations: []
        });
    }
}