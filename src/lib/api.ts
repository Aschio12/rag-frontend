const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface Source {
  doc_id: string;
  text: string;
  score: number;
}

export interface ChatResponse {
  answer: string;
  sources: Source[];
  conversation_id: string;
}

export interface ChatRequest {
  message: string;
  conversation_id?: string;
}

export async function sendMessage(req: ChatRequest): Promise<ChatResponse> {
  const res = await fetch(`${API_BASE}/api/v1/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });
  if (!res.ok) {
    throw new Error(`Chat API error: ${res.status}`);
  }
  return res.json();
}

export async function* sendMessageStream(
  req: ChatRequest,
): AsyncGenerator<string> {
  const res = await fetch(`${API_BASE}/api/v1/chat/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });
  if (!res.ok) {
    throw new Error(`Chat stream error: ${res.status}`);
  }
  const reader = res.body?.getReader();
  if (!reader) return;
  const decoder = new TextDecoder();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    yield decoder.decode(value, { stream: true });
  }
}

export async function uploadDocument(file: File) {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${API_BASE}/api/v1/documents/upload`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) {
    throw new Error(`Upload error: ${res.status}`);
  }
  return res.json();
}
