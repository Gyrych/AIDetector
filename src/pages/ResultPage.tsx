import React, { useState } from "react";
import TextInput from "../components/TextInput";
import { calculateWordFrequency, wordFreqToSortedArray, calculatePunctuationStats, calculateSentenceLengthDistribution } from "../utils/textStats";
import { computePerplexitySegments } from "../utils/perplexity";
import { modelJudge } from "../utils/modelJudge";
import { computeSimilarityToGreenList } from "../utils/greenList";
import { FrequencyBarChart, PunctuationPieChart } from "../components/Charts";
import PerplexityChart from "../components/PerplexityChart";
import ResultCard from "../components/ResultCard";
import SimilarityScore from "../components/SimilarityScore";

export default function ResultPage() {
    const [loading, setLoading] = useState(false);
    const [perplexitySegments, setPerplexitySegments] = useState<Array<{ label: string; perplexity: number }>>([]);
    const [aiResult, setAiResult] = useState<{ ai_probability?: number; reasoning?: string } | null>(null);
    const [similarity, setSimilarity] = useState<number | null>(null);
    const [wordFreqData, setWordFreqData] = useState<Array<{ name: string; value: number }>>([]);
    const [punctData, setPunctData] = useState<Array<{ name: string; value: number }>>([]);

    const handleDetect = async (text: string) => {
        setLoading(true);
        try {
            // 文本统计
            const freq = calculateWordFrequency(text);
            setWordFreqData(wordFreqToSortedArray(freq, 20).map(f => ({ name: f.word, value: f.count })));

            const punct = calculatePunctuationStats(text);
            setPunctData(Object.entries(punct).map(([k, v]) => ({ name: k, value: v })));

            // 困惑度分段计算（用于曲线展示）
            const pseg = await computePerplexitySegments(text);
            setPerplexitySegments(pseg);

            // 大模型判定
            const judge = await modelJudge(text);
            setAiResult({ ai_probability: judge.ai_probability, reasoning: judge.reasoning });

            // green-list 相似度
            const sim = await computeSimilarityToGreenList(text);
            setSimilarity(sim.score);

        } catch (err) {
            console.error("检测流程出错", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 relative">
            {/* 全局加载覆盖层 */}
            {loading && (
                <div className="absolute inset-0 bg-white/60 z-40 flex items-center justify-center">
                    <div className="flex items-center space-x-3">
                        <div className="animate-spin h-8 w-8 border-4 border-t-transparent rounded-full" />
                        <div className="text-lg font-medium">检测进行中...</div>
                    </div>
                </div>
            )}

            <h1 className="text-2xl font-bold mb-4">AI 文本检测</h1>
            <TextInput onDetect={handleDetect} loading={loading} />

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 space-y-4">
                    <div className="p-4 bg-white shadow rounded-md">
                        <div className="text-lg font-medium">基础统计</div>
                        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <div className="text-sm text-gray-600">词频</div>
                                <FrequencyBarChart data={wordFreqData} />
                            </div>
                            <div>
                                <div className="text-sm text-gray-600">标点分布</div>
                                <PunctuationPieChart data={punctData} />
                            </div>
                        </div>
                    </div>

                    <div className="p-4 bg-white shadow rounded-md">
                        <div className="text-lg font-medium">困惑度曲线</div>
                        <PerplexityChart data={perplexitySegments} />
                    </div>
                </div>

                <div className="space-y-4">
                    <ResultCard aiProbability={aiResult?.ai_probability} reasoning={aiResult?.reasoning} similarity={similarity ?? undefined} loading={loading} />
                    <SimilarityScore score={similarity ?? undefined} />
                </div>
            </div>
        </div>
    );
}


