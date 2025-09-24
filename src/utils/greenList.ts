// green-list 工具：维护本地人工写作样本并计算相似度
// 说明：示例中包含一个小型本地 green-list；在真实项目中可通过文件或数据库扩展

export interface GreenSample {
    id: string;
    text: string;
    embedding?: number[];
}

// 示例 green-list（可扩展）
export const greenList: GreenSample[] = [
    { id: "g1", text: "这是一个人工撰写的示例段落，用于测试与 AI 文本的相似度比较。" },
    { id: "g2", text: "在很久很久以前，人们在夜晚围坐篝火旁讲述故事。" },
];

// 计算余弦相似度
export function cosineSimilarity(a: number[], b: number[]): number {
    if (!a.length || !b.length || a.length !== b.length) return 0;
    let dot = 0, na = 0, nb = 0;
    for (let i = 0; i < a.length; i++) {
        dot += a[i] * b[i];
        na += a[i] * a[i];
        nb += b[i] * b[i];
    }
    const denom = Math.sqrt(na) * Math.sqrt(nb);
    return denom === 0 ? 0 : dot / denom;
}

// 调用 DeepSeek embedding API 获取 embedding 的辅助函数
export async function fetchEmbedding(text: string, options?: { apiKey?: string; url?: string; model?: string; }): Promise<number[]> {
    const endpoint = options?.url || (import.meta as any).env?.VITE_DEEPSEEK_EMBED_URL || "/api/deepseek/embedding";
    const apiKey = options?.apiKey || (import.meta as any).env?.VITE_DEEPSEEK_API_KEY;

    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (apiKey) headers["Authorization"] = `Bearer ${apiKey}`;

    const resp = await fetch(endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify({ text, model: options?.model || "default" }),
    });
    if (!resp.ok) throw new Error(`Embedding 请求失败: ${resp.status} ${resp.statusText}`);
    const data = await resp.json();
    // 期待 data.embedding 为 number[]
    if (!Array.isArray(data.embedding)) throw new Error("DeepSeek embedding 接口未返回 embedding 字段。");
    return data.embedding;
}

// 计算输入文本与 green-list 中每个样本的相似度，返回最高相似度
export async function computeSimilarityToGreenList(text: string, options?: { apiKey?: string; url?: string; model?: string; useLocal?: boolean; }) {
    // 如果 useLocal，为演示目的生成简单词向量（基于词频），避免调用外部 API
    let inputEmbedding: number[];
    if (options?.useLocal) {
        const freq = new Map<string, number>();
        text.split(/[^\p{L}\p{N}]+/u).filter(Boolean).forEach(w => freq.set(w, (freq.get(w) || 0) + 1));
        // 简单固定向量：取 top k 词的频率
        const top = Array.from(freq.entries()).slice(0, 50).map(([k, v]) => v);
        inputEmbedding = top;
    } else {
        inputEmbedding = await fetchEmbedding(text, options);
    }

    const scores: Array<{ id: string; score: number }> = [];
    for (const sample of greenList) {
        let emb = sample.embedding;
        if (!emb) {
            emb = options?.useLocal ? [1] : await fetchEmbedding(sample.text, options);
            // 不修改原数据以保持纯净；若需要可缓存
        }
        const score = cosineSimilarity(inputEmbedding, emb);
        scores.push({ id: sample.id, score });
    }

    scores.sort((a, b) => b.score - a.score);
    return scores[0] ?? { id: null, score: 0 };
}


