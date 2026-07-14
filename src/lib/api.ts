const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface Source {
  doc_id: string;
  text: string;
  score: number;
  page_number?: number;
  filename?: string;
  bbox?: string;
}

export interface ChatResponse {
  answer: string;
  sources: Source[];
  conversation_id: string;
}

export interface ChatRequest {
  message: string;
  conversation_id?: string;
  top_k?: number;
  hybrid?: boolean;
  rerank?: boolean;
}

// ---- Core Chat ----
export async function sendMessage(req: ChatRequest): Promise<ChatResponse> {
  const res = await fetch(`${API_BASE}/api/v1/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });
  if (!res.ok) throw new Error(`Chat API error: ${res.status}`);
  return res.json();
}

export async function* sendMessageStream(req: ChatRequest, signal?: AbortSignal): AsyncGenerator<string> {
  const res = await fetch(`${API_BASE}/api/v1/chat/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
    signal,
  });
  if (!res.ok) throw new Error(`Chat stream error: ${res.status}`);
  const reader = res.body?.getReader();
  if (!reader) throw new Error("No response body from chat stream");
  const decoder = new TextDecoder();
  let buffer = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";
    for (const line of lines) {
      if (line.startsWith("data: ")) {
        const data = line.slice(6);
        if (data === "[DONE]") return;
        try {
          const parsed = JSON.parse(data);
          if (parsed.content) yield parsed.content;
          else if (parsed.answer) yield parsed.answer;
          else if (typeof parsed === "string") yield parsed;
        } catch {
          yield data;
        }
      }
    }
  }
}

// ---- Knowledge Bases ----
export async function listKnowledgeBases() {
  const res = await fetch(`${API_BASE}/api/v1/knowledge-bases`);
  if (!res.ok) throw new Error(`List KB error: ${res.status}`);
  return res.json();
}

export async function createKnowledgeBase(name: string, description?: string) {
  const form = new FormData();
  form.append("name", name);
  if (description) form.append("description", description);
  const res = await fetch(`${API_BASE}/api/v1/knowledge-bases`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) throw new Error(`Create KB error: ${res.status}`);
  return res.json();
}

export async function deleteKnowledgeBase(kbId: string) {
  const res = await fetch(`${API_BASE}/api/v1/knowledge-bases/${kbId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error(`Delete KB error: ${res.status}`);
  return res.json();
}

// ---- Collections ----
export async function listCollections(kbId?: string) {
  const params = kbId ? `?kb_id=${kbId}` : "";
  const res = await fetch(`${API_BASE}/api/v1/collections${params}`);
  if (!res.ok) throw new Error(`List collections error: ${res.status}`);
  return res.json();
}

export async function createCollection(kbId: string, name: string, description?: string) {
  const form = new FormData();
  form.append("kb_id", kbId);
  form.append("name", name);
  if (description) form.append("description", description);
  const res = await fetch(`${API_BASE}/api/v1/collections`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) throw new Error(`Create collection error: ${res.status}`);
  return res.json();
}

export async function deleteCollection(colId: string) {
  const res = await fetch(`${API_BASE}/api/v1/collections/${colId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error(`Delete collection error: ${res.status}`);
  return res.json();
}

// ---- Documents ----
export async function uploadDocument(file: File, collectionId?: string) {
  const form = new FormData();
  form.append("file", file);
  if (collectionId) form.append("collection_id", collectionId);
  const res = await fetch(`${API_BASE}/api/v1/documents/upload`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) throw new Error(`Upload error: ${res.status}`);
  return res.json();
}

export async function listDocuments(collectionId?: string) {
  const params = collectionId ? `?collection_id=${collectionId}` : "";
  const res = await fetch(`${API_BASE}/api/v1/documents${params}`);
  if (!res.ok) throw new Error(`List documents error: ${res.status}`);
  return res.json();
}

export async function deleteDocument(docId: string) {
  const res = await fetch(`${API_BASE}/api/v1/documents/${docId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error(`Delete document error: ${res.status}`);
  return res.json();
}

export async function getDocumentPreview(docId: string, page: number = 0): Promise<string> {
  return `${API_BASE}/api/v1/documents/${docId}/preview?page=${page}`;
}

// ---- OCR & Image ----
export async function ocrImage(file: File) {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${API_BASE}/api/v1/ocr`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) throw new Error(`OCR error: ${res.status}`);
  return res.json();
}

export async function understandImage(file: File) {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${API_BASE}/api/v1/understand-image`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) throw new Error(`Image understanding error: ${res.status}`);
  return res.json();
}

// ---- Query Enhancements ----
export async function expandQuery(query: string) {
  const form = new FormData();
  form.append("query", query);
  const res = await fetch(`${API_BASE}/api/v1/query-expand`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) throw new Error(`Query expand error: ${res.status}`);
  return res.json();
}

export async function rewriteQuery(query: string) {
  const form = new FormData();
  form.append("query", query);
  const res = await fetch(`${API_BASE}/api/v1/query-rewrite`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) throw new Error(`Query rewrite error: ${res.status}`);
  return res.json();
}

export async function decomposeQuery(query: string) {
  const form = new FormData();
  form.append("query", query);
  const res = await fetch(`${API_BASE}/api/v1/query-decompose`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) throw new Error(`Query decompose error: ${res.status}`);
  return res.json();
}

export async function rerankResults(query: string, results: Source[]) {
  const form = new FormData();
  form.append("query", query);
  form.append("results", JSON.stringify(results));
  const res = await fetch(`${API_BASE}/api/v1/rerank`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) throw new Error(`Rerank error: ${res.status}`);
  return res.json();
}

// ---- Knowledge Graph & Mind Map ----
export async function extractKnowledgeGraph(docId: string) {
  const form = new FormData();
  form.append("doc_id", docId);
  const res = await fetch(`${API_BASE}/api/v1/knowledge-graph`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) throw new Error(`Knowledge graph error: ${res.status}`);
  return res.json();
}

export async function generateMindMap(docId: string) {
  const form = new FormData();
  form.append("doc_id", docId);
  const res = await fetch(`${API_BASE}/api/v1/mind-map`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) throw new Error(`Mind map error: ${res.status}`);
  return res.json();
}

// ---- Study Tools ----
export async function summarizeDocument(docId: string) {
  const form = new FormData();
  form.append("doc_id", docId);
  const res = await fetch(`${API_BASE}/api/v1/summarize`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) throw new Error(`Summarize error: ${res.status}`);
  return res.json();
}

export async function generateFlashcards(docId: string, count: number = 5) {
  const form = new FormData();
  form.append("doc_id", docId);
  form.append("count", String(count));
  const res = await fetch(`${API_BASE}/api/v1/flashcards`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) throw new Error(`Flashcards error: ${res.status}`);
  return res.json();
}

export async function generateQuiz(docId: string, count: number = 5) {
  const form = new FormData();
  form.append("doc_id", docId);
  form.append("count", String(count));
  const res = await fetch(`${API_BASE}/api/v1/quiz`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) throw new Error(`Quiz error: ${res.status}`);
  return res.json();
}

export async function extractTimeline(docId: string) {
  const form = new FormData();
  form.append("doc_id", docId);
  const res = await fetch(`${API_BASE}/api/v1/timeline`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) throw new Error(`Timeline error: ${res.status}`);
  return res.json();
}

export async function extractTables(docId: string) {
  const form = new FormData();
  form.append("doc_id", docId);
  const res = await fetch(`${API_BASE}/api/v1/extract-tables`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) throw new Error(`Table extraction error: ${res.status}`);
  return res.json();
}

export async function relatedQuestions(query: string, answerText: string) {
  const form = new FormData();
  form.append("query", query);
  form.append("answer_text", answerText);
  const res = await fetch(`${API_BASE}/api/v1/related-questions`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) throw new Error(`Related questions error: ${res.status}`);
  return res.json();
}

// ---- Agentic AI Chat ----
export interface AgentStepEvent {
  event: "step_start" | "step_complete" | "step_error" | "complete";
  step?: string;
  label?: string;
  description?: string;
  duration?: number;
  error?: string;
  answer?: string;
  sources?: Source[];
  plan?: string;
  critique?: string;
  verification?: Array<{ claim: string; verdict: string; supported: boolean }>;
  search_queries?: string[];
  summary?: { plan_executed: boolean; searches_performed: number; sources_found: number; critique_applied: boolean; claims_verified: number };
  total_time?: number;
}

export async function* sendAgenticMessage(params: {
  message: string;
  conversation_id?: string;
  hybrid?: boolean;
}, signal?: AbortSignal): AsyncGenerator<AgentStepEvent> {
  const res = await fetch(`${API_BASE}/api/v1/agent/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: params.message,
      conversation_id: params.conversation_id || "",
      hybrid: params.hybrid || false,
      top_k: 5,
    }),
    signal,
  });
  if (!res.ok) throw new Error(`Agent chat error: ${res.status}`);

  const reader = res.body?.getReader();
  if (!reader) throw new Error("No response body");

  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";
    for (const line of lines) {
      if (line.startsWith("data: ")) {
        const data = line.slice(6);
        if (data === "[DONE]") return;
        try {
          yield JSON.parse(data) as AgentStepEvent;
        } catch { /* skip malformed */ }
      }
    }
  }
}

// ---- Legacy endpoints ----
export async function legacyListDocuments() {
  const res = await fetch(`${API_BASE}/api/v1/old-documents`);
  if (!res.ok) throw new Error(`List documents error: ${res.status}`);
  return res.json();
}
