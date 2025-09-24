// 文本统计工具集
// 包含：词频、句子长度分布、标点统计

export function calculateWordFrequency(text: string): Record<string, number> {
    const freq: Record<string, number> = {};
    if (!text) return freq;
    // 简单分词：按非字母/数字/中文字符分割
    const words = text
        .toLowerCase()
        .split(/[^\p{L}\p{N}]+/u)
        .filter(Boolean);
    for (const w of words) {
        freq[w] = (freq[w] || 0) + 1;
    }
    return freq;
}

export function calculateSentenceLengthDistribution(text: string): number[] {
    if (!text) return [];
    // 按常见句子终结符切分
    const sentences = text.split(/[.!?。！？]+/).map(s => s.trim()).filter(Boolean);
    // 返回句子长度（以词为单位）的数组
    return sentences.map(s => {
        const words = s.split(/[^\p{L}\p{N}]+/u).filter(Boolean);
        return words.length;
    });
}

export function calculatePunctuationStats(text: string): Record<string, number> {
    const stats: Record<string, number> = {};
    if (!text) return stats;
    // 统计常见标点
    const punctuations = text.match(/[，。？！；：,\.\?!;:—–\-"'()\[\]{}]/g);
    if (!punctuations) return stats;
    for (const p of punctuations) {
        stats[p] = (stats[p] || 0) + 1;
    }
    return stats;
}

// 额外导出：将词频转换为排序数组，便于绘图使用
export function wordFreqToSortedArray(freq: Record<string, number>, topN = 20) {
    const arr = Object.entries(freq).map(([word, count]) => ({ word, count }));
    arr.sort((a, b) => b.count - a.count);
    return arr.slice(0, topN);
}


