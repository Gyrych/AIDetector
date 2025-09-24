// 大模型裁判适配器（DeepSeek）
// 功能：向 DeepSeek 发送判定请求，返回 ai_probability 与 reasoning
export interface ModelJudgeResult {
    ai_probability: number;
    reasoning: string;
    raw?: any;
}

export async function modelJudge(text: string, options?: { apiKey?: string; url?: string; model?: string; }) : Promise<ModelJudgeResult> {
    if (!text) {
        return { ai_probability: 0, reasoning: "空文本无法判定", raw: null };
    }

    const endpoint = options?.url || (import.meta as any).env?.VITE_DEEPSEEK_API_URL || "/api/deepseek/judge";
    const apiKey = options?.apiKey || (import.meta as any).env?.VITE_DEEPSEEK_API_KEY;

    const body = {
        model: options?.model || "default",
        text,
    };

    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (apiKey) headers["Authorization"] = `Bearer ${apiKey}`;

    const resp = await fetch(endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
    });
    if (!resp.ok) {
        throw new Error(`DeepSeek 判定接口请求失败: ${resp.status} ${resp.statusText}`);
    }

    const data = await resp.json();

    // 期待 DeepSeek 返回结构：{ ai_probability: number, reasoning: string }
    if (typeof data.ai_probability === "number" && typeof data.reasoning === "string") {
        return { ai_probability: data.ai_probability, reasoning: data.reasoning, raw: data };
    }

    // 兼容性处理：尝试从可能的字段中解析概率或文本
    if (data.probability !== undefined && data.explanation) {
        return { ai_probability: Number(data.probability), reasoning: String(data.explanation), raw: data };
    }

    // 如果无法解析，抛出错误以便上层处理
    throw new Error("DeepSeek 返回的判定结果缺少预期字段 (ai_probability/reasoning)。");
}


