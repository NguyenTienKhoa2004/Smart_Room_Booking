import { retrieveChunks } from './retriever';
import { RAG_SYSTEM_PROMPT, buildUserPrompt } from './prompts';
import { MockLLMProvider } from '../providers/mock.llm';
import { logger } from '../../config/logger';

const llmProvider = new MockLLMProvider();

export interface RAGResponse {
    answer: string;
    citations: {
        doc_title: string;
        chunk_text: string;
    }[];
}

export async function generateAnswer(question: string, topK: number = 5): Promise<RAGResponse> {
    const retrievalResult = await retrieveChunks(question, { topK });
    const userPrompt = buildUserPrompt(question, retrievalResult.chunks);
    const fullPrompt = `${RAG_SYSTEM_PROMPT}\n\n${userPrompt}`;
    try {
        const llmResponseStr = await llmProvider.generate(fullPrompt, { temperature: 0.3 });
        const parsedResponse = JSON.parse(llmResponseStr) as RAGResponse;
        const validCitations = parsedResponse.citations.filter(citation =>
            retrievalResult.chunks.some(chunk => chunk.doc_title === citation.doc_title)
        );

        return {
            answer: parsedResponse.answer,
            citations: validCitations
        };
    } catch (error) {
        logger.error('Failed to parse LLM Response as JSON or generation failed', error);

        return {
            answer: "Xin lỗi, hệ thống đang gặp sự cố khi tổng hợp thông tin. Vui lòng thử lại sau.",
            citations: []
        };
    }
}
