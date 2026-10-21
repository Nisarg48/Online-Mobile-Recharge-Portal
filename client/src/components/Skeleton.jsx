/* eslint-disable react/prop-types */
export function Skeleton({ className = "" }) {
    return <div className={`animate-pulse rounded bg-[#2a2a2a] ${className}`} />;
}

export function TableSkeleton({ rows = 5, cols = 5 }) {
    return (
        <div className="rounded-lg bg-[#1e1e1e] p-6 shadow-lg">
            <div className="space-y-4">
                {Array.from({ length: rows }).map((_, rowIndex) => (
                    <div
                        key={rowIndex}
                        className="grid gap-4"
                        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
                    >
                        {Array.from({ length: cols }).map((__, colIndex) => (
                            <Skeleton
                                key={colIndex}
                                className={`h-4 ${colIndex === 0 ? "w-3/4" : "w-1/2"}`}
                            />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}
