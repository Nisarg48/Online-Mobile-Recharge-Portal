// Shared date formatting for values now stored as native Date/ISO on the server.

const toDate = (value) => {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
};

export const formatDate = (value) => {
    const date = toDate(value);
    if (!date) return "-";
    return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

export const formatDateTime = (value) => {
    const date = toDate(value);
    if (!date) return "-";
    const day = date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
    const time = date.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });
    return `${day}, ${time}`;
};

// Renders an extra benefit (object {type, description, icon} or a plain string).
export const benefitLabel = (benefit) => {
    if (!benefit) return "";
    if (typeof benefit === "string") return benefit;
    return benefit.description || benefit.type || "";
};
