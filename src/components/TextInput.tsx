import React, { useRef, useState } from "react";

interface TextInputProps {
    onDetect: (text: string) => void;
    loading?: boolean;
}

// 文本输入组件：支持粘贴、文本编辑、以及 .txt 文件上传
export default function TextInput({ onDetect, loading = false }: TextInputProps) {
    const [text, setText] = useState<string>("");
    const [fileName, setFileName] = useState<string>("");
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    // 处理文件读取（只接受 .txt）
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setFileName(file.name);
        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result;
            if (typeof result === "string") {
                setText(result);
            }
        };
        reader.onerror = () => {
            // 不在此处做二次异常处理（遵循库中异常策略）
            console.error("读取文件失败");
        };
        reader.readAsText(file, "utf-8");
    };

    // 处理粘贴事件（将粘贴内容添加到 textarea）
    const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
        const clipboardText = e.clipboardData.getData("text");
        if (clipboardText) {
            // 阻止默认粘贴行为并手动合并，以保持可控性
            e.preventDefault();
            setText((prev) => prev + clipboardText);
        }
    };

    const onDetectClick = () => {
        onDetect(text);
    };

    return (
        <div className="w-full max-w-3xl mx-auto p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">输入或粘贴文本</label>
            <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                onPaste={handlePaste}
                rows={10}
                disabled={loading}
                className="w-full p-3 border rounded-md resize-vertical focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-50"
                placeholder="在此处粘贴或输入待检测文本..."
            />

            <div className="flex items-center justify-between mt-3 space-x-2">
                <div className="flex items-center space-x-2">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".txt,text/plain"
                        onChange={handleFileChange}
                        className="hidden"
                        data-testid="file-input"
                        disabled={loading}
                    />
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-2 bg-gray-100 border rounded-md hover:bg-gray-200 disabled:opacity-50"
                        disabled={loading}
                    >
                        上传 .txt
                    </button>
                    <span className="text-sm text-gray-500">{fileName}</span>
                </div>

                <div className="flex items-center space-x-2">
                    <button
                        type="button"
                        onClick={() => setText("")}
                        className="px-3 py-2 bg-red-50 text-red-600 border rounded-md hover:bg-red-100 disabled:opacity-50"
                        disabled={loading}
                    >
                        清空
                    </button>
                    <button
                        type="button"
                        onClick={onDetectClick}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                        disabled={loading}
                    >
                        {loading ? "检测中..." : "检测"}
                    </button>
                </div>
            </div>
        </div>
    );
}


