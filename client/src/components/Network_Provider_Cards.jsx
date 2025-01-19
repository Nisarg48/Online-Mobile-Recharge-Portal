/* eslint-disable react/prop-types */
import Image from "next/image";
import React, { useState } from "react";
import { cn } from "@/lib/utils";

// Individual Network Provider Card
export const NetworkProviderCard = React.memo(
    ({ provider, index, hovered, setHovered }) => (
        <div
            onMouseEnter={() => setHovered(index)}
            onMouseLeave={() => setHovered(null)}
            className={cn(
                "rounded-lg relative bg-gradient-to-tl from-bg-bg2 to-bg-bg3 overflow-hidden h-60 md:h-80 w-full transition-all duration-300 ease-out shadow-md",
                hovered !== null && hovered !== index && "blur-sm scale-[0.98]"
            )}
        >
            {/* Network Provider Image */}
            <Image
                src={`./Network_Provider/${provider.image}`}
                alt={provider.name}
                fill
                className="object-cover absolute inset-0"
            />
            {/* Overlay Content */}
            <div
                className={cn(
                    "absolute inset-0 bg-black/50 flex items-end py-6 px-4 transition-opacity duration-300",
                    hovered === index ? "opacity-100" : "opacity-0"
                )}
            >
                <div className="text-lg md:text-xl font-semibold text-white">
                    {provider.name}
                </div>
            </div>
        </div>
    )
);

NetworkProviderCard.displayName = "NetworkProviderCard";

// Main Network Provider Cards Grid
export function NetworkProviderCards({ providers }) {
    const [hovered, setHovered] = useState(null);

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto px-4 md:px-8 w-full">
            {providers.map((provider, index) => (
                <NetworkProviderCard
                    key={provider.name}
                    provider={provider}
                    index={index}
                    hovered={hovered}
                    setHovered={setHovered}
                />
            ))}
        </div>
    );
}
