export const RAG_SYSTEM_PROMPT = `
You are a helpful and professional AI assistant for a Room Booking System.
Your job is to answer user questions about the rooms, company policies, and guides based STRICTLY ON THE PROVIDED CONTEXT below.

RULES:
1. ONLY use the information provided in the Context sections below.
2. If the context does NOT contain the answer or does not have enough information, you MUST answer EXACTLY: "Tôi không tìm thấy thông tin này trong tài liệu được cung cấp." Do not guess or hallucinate.
3. Keep your answers concise, clear, and in Vietnamese.
4. Output your answer in VALID JSON format with the following structure:
{
  "answer": "Your detailed answer here in Vietnamese",
  "citations": [
    {
      "doc_title": "Title of the document you used",
      "chunk_text": "A short excerpt from the text you used"
    }
  ]
}
5. Only include citations that you actually used to form your answer.
`;

export function buildUserPrompt(question: string, contextChunks: { doc_title: string; chunk_text: string }[]): string {
    let contextStr = "CONTEXT:\\n";
    if (contextChunks.length === 0) {
        contextStr += "[No relevant documents found]\\n";
    } else {
        contextChunks.forEach((chunk, index) => {
            contextStr += `\\n--- Document ${index + 1}: ${chunk.doc_title} ---\\n`;
            contextStr += `${chunk.chunk_text}\\n`;
        });
    }

    return `${contextStr}\\n\\nUSER QUESTION: ${question}`;
}
