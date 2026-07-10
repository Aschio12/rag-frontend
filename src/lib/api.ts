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

export async function listDocuments() {
  const res = await fetch(`${API_BASE}/api/v1/documents`);
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

export async function renameConversation(conversationId: string, title: string) {
  const res = await fetch(`${API_BASE}/api/v1/conversations/${conversationId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });
  if (!res.ok) throw new Error(`Rename conversation error: ${res.status}`);
  return res.json();
}

export async function listConversations() {
  const res = await fetch(`${API_BASE}/api/v1/conversations`);
  if (!res.ok) throw new Error(`List conversations error: ${res.status}`);
  return res.json();
}

export async function deleteConversation(conversationId: string) {
  const res = await fetch(`${API_BASE}/api/v1/conversations/${conversationId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error(`Delete conversation error: ${res.status}`);
  return res.json();
}
