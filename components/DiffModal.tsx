import React from "react";
import { X } from "lucide-react";

interface DiffModalProps {
    // 已提交的 JSON 內容 (Staged)
    committedJson: string;
    // 當前編輯中的 JSON 內容 (Uncommitted)
    uncommittedJson: string;
    onClose: () => void;
}

// 類型定義：差異行
interface DiffLine {
    type: "add" | "delete" | "equal"; // 移除 "context"
    content: string;
}

// 修正後的 JSON 差異比對函式：使用簡易的行級別 sequential diff
// 此邏輯旨在確保修改 (Delete + Add) 緊密相鄰，而不是將所有 Delete 行集中在最前面。
const getJsonDiff = (originalJson: string, newJson: string): DiffLine[] => {
    // 將 JSON 字串轉換為行陣列
    const linesA = originalJson.trim().split("\n"); // Committed/Original
    const linesB = newJson.trim().split("\n"); // Uncommitted/New

    const finalDiff: DiffLine[] = [];
    let i = 0; // linesA index
    let j = 0; // linesB index

    while (i < linesA.length || j < linesB.length) {
        const lineA = linesA[i];
        const lineB = linesB[j];

        // 1. Matched Lines (Equal)
        if (lineA === lineB) {
            finalDiff.push({ type: "equal", content: lineA });
            i++;
            j++;
            continue;
        }

        // 2. Detect Deletion (A[i] deleted, B[j] matches A[i+1])
        // 檢查 A 的下一行是否與 B 的當前行匹配 (暗示 A[i] 被刪除)
        if (
            i < linesA.length &&
            j < linesB.length &&
            i + 1 < linesA.length &&
            linesA[i + 1] === lineB
        ) {
            finalDiff.push({ type: "delete", content: "- " + lineA });
            i++; // 消耗 A[i] (deleted)
            continue;
        }

        // 3. Detect Addition (B[j] added, A[i] matches B[j+1])
        // 檢查 B 的下一行是否與 A 的當前行匹配 (暗示 B[j] 被新增)
        if (
            i < linesA.length &&
            j < linesB.length &&
            j + 1 < linesB.length &&
            linesB[j + 1] === lineA
        ) {
            finalDiff.push({ type: "add", content: "+ " + lineB });
            j++; // 消耗 B[j] (added)
            continue;
        }

        // 4. End of A reached (Remaining lines in B are additions)
        if (i >= linesA.length && j < linesB.length) {
            finalDiff.push({ type: "add", content: "+ " + lineB });
            j++;
            continue;
        }

        // 5. End of B reached (Remaining lines in A are deletions)
        if (j >= linesB.length && i < linesA.length) {
            finalDiff.push({ type: "delete", content: "- " + lineA });
            i++;
            continue;
        }

        // 6. Default to Modification (A[i] modified to B[j])
        // 這是最常見的修改情況：A[i] 被刪除，並以 B[j] 取代
        if (i < linesA.length && j < linesB.length) {
            finalDiff.push({ type: "delete", content: "- " + lineA });
            finalDiff.push({ type: "add", content: "+ " + lineB });
            i++;
            j++;
            continue;
        }

        // Fallback for safety (shouldn't be hit with the logic above)
        if (i < linesA.length) i++;
        if (j < linesB.length) j++;
    }

    const rawDiff = finalDiff;

    // --- 新增後處理邏輯：合併連續的 'modify' 區塊 ---
    const MIN_ALTERNATING_LINES = 5; // 您要求的 '5個以上'，代表 >= 5 行
    const processedDiff: DiffLine[] = [];
    let currentChunk: DiffLine[] = [];

    for (const line of rawDiff) {
        // 1. 如果當前行是 'equal'
        if (line.type === "equal") {
            // 處理累積的 currentChunk
            if (currentChunk.length > 0) {
                // 檢查是否達到重排門檻
                if (currentChunk.length >= MIN_ALTERNATING_LINES) {
                    // 重排：將 delete 和 add 分開
                    const deletes = currentChunk.filter(
                        (l) => l.type === "delete",
                    );
                    const adds = currentChunk.filter((l) => l.type === "add");
                    processedDiff.push(...deletes, ...adds);
                } else {
                    // 未達門檻：保留原始的交錯順序
                    processedDiff.push(...currentChunk);
                }
                currentChunk = []; // 清空區塊
            }
            // 推入當前的 'equal' 行
            processedDiff.push(line);
        } else {
            // 2. 如果當前行是 'add' 或 'delete'，則加入當前區塊
            currentChunk.push(line);
        }
    }

    // 3. 循環結束後，處理最後一個累積的 currentChunk
    if (currentChunk.length > 0) {
        if (currentChunk.length >= MIN_ALTERNATING_LINES) {
            const deletes = currentChunk.filter((l) => l.type === "delete");
            const adds = currentChunk.filter((l) => l.type === "add");
            processedDiff.push(...deletes, ...adds);
        } else {
            processedDiff.push(...currentChunk);
        }
    }

    // 將 finalDiff 替換為 processedDiff
    return processedDiff;
};

export const DiffModal: React.FC<DiffModalProps> = ({
    committedJson,
    uncommittedJson,
    onClose,
}) => {
    // 只有在 committedJson 和 uncommittedJson 都不為空時才計算差異
    const diffResult = React.useMemo(() => {
        if (!committedJson || !uncommittedJson) return [];
        return getJsonDiff(committedJson, uncommittedJson);
    }, [committedJson, uncommittedJson]);

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-panel w-full max-w-5xl h-[90vh] rounded-xl shadow-2xl flex flex-col border border-gray-600">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-700">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        JSON Diff Comparison (差異比對)
                        <span className="text-sm font-normal text-gray-400">
                            (Committed vs. Uncommitted)
                        </span>
                    </h2>
                    <button
                        onClick={onClose}
                        className="cursor-pointer p-2 text-gray-400 hover:text-white rounded-full hover:bg-gray-700 transition"
                        title="Close"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Diff Viewer */}
                <div className="flex-1 overflow-y-auto bg-[#1e1e1e] p-4 text-sm font-mono leading-relaxed">
                    <pre className="whitespace-pre-wrap">
                        {!diffResult.find(
                            (x) => x.type == "delete" || x.type == "add",
                        ) && (
                            <div className="text-amber-300 bg-emerald-700 rounded-2xl text-center py-4 mb-4">
                                No differences found between committed and
                                uncommitted versions.
                            </div>
                        )}
                        {diffResult.map((line, index) => {
                            let colorClass = "text-gray-300"; // 預設

                            if (line.type === "add") {
                                colorClass = "bg-green-900/40 text-green-400";
                            } else if (line.type === "delete") {
                                colorClass = "bg-red-900/40 text-red-400";
                            }
                            return (
                                <div
                                    key={index}
                                    className={`px-1 rounded ${colorClass} flex`}
                                    style={{ whiteSpace: "pre-wrap" }}
                                >
                                    {/* 為了美觀，為每一行添加行號占位符。
                                            注意：這裡的 index 只是 diff 陣列的索引，不是原始文件的行號。
                                        */}
                                    <span className="text-gray-600 select-none pr-3 min-w-[30px] text-right">
                                        {line.type === "equal"
                                            ? index + 1
                                            : " "}
                                    </span>
                                    {line.content}
                                </div>
                            );
                        })}
                    </pre>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-700 flex justify-end">
                    <button
                        onClick={onClose}
                        className="cursor-pointer bg-primary hover:bg-teal-300 text-dark font-bold px-6 py-2 rounded shadow transition"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};
