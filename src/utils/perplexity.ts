// 文档：DeepSeek 接口适配器与困惑度计算工具
// 说明：该模块向 DeepSeek API 发送请求并从返回的 token 概率/对数概率计算困惑度。
// 注意：生产环境应通过后端代理隐藏 API Key；前端直接调用仅用于开发或受信环境。

export interface DeepSeekResult {
    tokens?: string[];
    logprobs?: number[]; // 期望为每个 token 的对数概率（自然对数）
    probs?: number[]; // 可选：概率值
}

// 将对数概率数组转换为困惑度值
export function perplexityFromLogProbs(logProbs: number[]): number {
    if (!logProbs || logProbs.length === 0) return Infinity;
    const sumLog = logProbs.reduce((s, v) => s + v, 0);
    const avgLog = sumLog / logProbs.length;
    // 困惑度定义：exp(-avg_log_prob)
    return Math.exp(-avgLog);
}

// 主要函数：向 DeepSeek 请求并计算困惑度
export async function computePerplexity(text: string, options?: { apiKey?: string; url?: string; model?: string; }): Promise<{ perplexity: number; tokenCount: number; tokens?: string[]; logprobs?: number[] }> {
    if (!text) return { perplexity: Infinity, tokenCount: 0 };

    const endpoint = options?.url || (import.meta as any).env?.VITE_DEEPSEEK_API_URL || "/api/deepseek";
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
        throw new Error(`DeepSeek API 请求失败: ${resp.status} ${resp.statusText}`);
    }

    const data: DeepSeekResult = await resp.json();

    let logprobs: number[] | undefined = data.logprobs;
    if (!logprobs && data.probs) {
        // 如果返回的是概率值，则取自然对数
        logprobs = data.probs.map(p => Math.log(Math.max(p, Number.EPSILON)));
    }

    if (!logprobs) {
        // 无法计算困惑度：DeepSeek 结果中未包含 logprobs 或 probs
        throw new Error("DeepSeek 返回结果中缺少对数概率或概率字段，无法计算困惑度。期待字段：logprobs 或 probs。");
    }

    const perplexity = perplexityFromLogProbs(logprobs);
    return { perplexity, tokenCount: logprobs.length, tokens: data.tokens, logprobs };
}

// 辅助：按句子或滑动窗口批量计算分段困惑度（逐段发送请求，适合可分段显示曲线）
export async function computePerplexitySegments(text: string, options?: { apiKey?: string; url?: string; model?: string; segmentDelimiter?: RegExp; }) {
    const delimiter = options?.segmentDelimiter || /[.!?。！？]+/;
    const segments = text.split(delimiter).map(s => s.trim()).filter(Boolean);
    const results: Array<{ label: string; perplexity: number; tokenCount: number }> = [];
    for (const seg of segments) {
        try {
            // 为了降低请求频率，可考虑合并短句或按窗口分割；此处逐句请求以便获得细粒度曲线
            const r = await computePerplexity(seg, options);
            results.push({ label: seg.slice(0, 30), perplexity: r.perplexity, tokenCount: r.tokenCount });
        } catch (err) {
            // 若某段计算失败，记录为 Infinity 并继续（不在此处做二次异常处理）
            results.push({ label: seg.slice(0, 30), perplexity: Infinity, tokenCount: 0 });
        }
    }
    return results;
}


