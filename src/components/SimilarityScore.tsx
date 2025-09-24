import React from "react";

export default function SimilarityScore({ score }: { score?: number }) {
    return (
        <div className="p-3 bg-white shadow rounded-md">
            <div className="text-sm text-gray-500">与 green-list 相似度</div>
            <div className="text-2xl font-semibold text-green-600">{typeof score === 'number' ? `${(score*100).toFixed(1)}%` : "—"}</div>
        </div>
    );
}


