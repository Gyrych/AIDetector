import React from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function PerplexityChart({ data }: { data: Array<{ label: string; perplexity: number }> }) {
    // 将 Infinity 替换为 null 以便图表库处理
    const chartData = data.map((d, i) => ({ name: d.label || `seg${i + 1}`, value: Number.isFinite(d.perplexity) ? d.perplexity : null }));
    return (
        <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
                <LineChart data={chartData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="value" stroke="#8884d8" dot={false} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}


