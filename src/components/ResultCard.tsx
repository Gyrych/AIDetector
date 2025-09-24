import React, { useState } from "react";

interface ResultCardProps {
    aiProbability?: number;
    reasoning?: string;
    similarity?: number; // 与 green-list 的相似度
    loading?: boolean;
}

export default function ResultCard({ aiProbability, reasoning, similarity, loading }: ResultCardProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        const payload = {
            ai_probability: aiProbability ?? null,
            reasoning: reasoning ?? "",
            similarity: similarity ?? null,
        };
        try {
            await navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("复制失败", err);
        }
    };

    return (
        <div className="p-4 bg-white shadow rounded-md">
            <div className="flex items-center justify-between">
                <div>
                    <div className="text-sm text-gray-500">AI 生成概率</div>
                    <div className="flex items-center space-x-3">
                        <div className="text-3xl font-semibold text-indigo-600">{loading ? "计算中..." : (typeof aiProbability === 'number' ? `${(aiProbability*100).toFixed(1)}%` : "—")}</div>
                        {loading && (
                            <div className="animate-spin h-5 w-5 border-2 border-t-transparent rounded-full" aria-hidden="true" />
                        )}
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-sm text-gray-500">与人类相似度</div>
                    <div className="text-lg font-medium">{typeof similarity === 'number' ? `${(similarity*100).toFixed(1)}%` : "—"}</div>
                </div>
            </div>

            <div className="mt-4">
                <div className="text-sm font-medium text-gray-600">判定说明</div>
                <div className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">{loading ? "正在等待模型返回说明..." : (reasoning || "无说明")}</div>
            </div>

            <div className="mt-4 flex items-center justify-end space-x-2">
                <button onClick={handleCopy} className="px-3 py-1 bg-gray-100 rounded-md hover:bg-gray-200 text-sm">
                    {copied ? "已复制" : "复制结果"}
                </button>
            </div>
        </div>
    );
}


