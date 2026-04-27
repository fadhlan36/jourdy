export const moodConfig: Record<
    string,
    { bg: string; text: string; dot: string; pill: string }
> = {
    Senang: {
        bg: "bg-yellow-50",
        text: "text-yellow-700",
        dot: "bg-yellow-400",
        pill: "bg-yellow-50 text-yellow-700 border-yellow-200",
    },
    Sedih: {
        bg: "bg-blue-50",
        text: "text-blue-700",
        dot: "bg-blue-400",
        pill: "bg-blue-50 text-blue-700 border-blue-200",
    },
    Marah: {
        bg: "bg-red-50",
        text: "text-red-700",
        dot: "bg-red-400",
        pill: "bg-red-50 text-red-700 border-red-200",
    },
    Cemas: {
        bg: "bg-purple-50",
        text: "text-purple-700",
        dot: "bg-purple-400",
        pill: "bg-purple-50 text-purple-700 border-purple-200",
    },
    Netral: {
        bg: "bg-slate-50",
        text: "text-slate-600",
        dot: "bg-slate-300",
        pill: "bg-slate-50 text-slate-600 border-slate-200",
    },
};

export const getMoodConfig = (m: string) =>
    moodConfig[m] ?? moodConfig["Netral"];

export const categoryColor: Record<string, string> = {
    Work: "bg-blue-400",
    Ideas: "bg-amber-400",
    Urgent: "bg-red-400",
    Personal: "bg-indigo-400",
};

export const CATEGORIES = ["Personal", "Work", "Ideas", "Urgent"] as const;