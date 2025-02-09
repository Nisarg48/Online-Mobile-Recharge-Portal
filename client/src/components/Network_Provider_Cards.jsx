/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import Image from "next/image";
import React, { useState } from "react";
import { motion } from "framer-motion";

export const NetworkProviderCard = React.memo(
    ({ provider, index, hovered, setHovered }) => (
        <motion.div
            onMouseEnter={() => setHovered(index)}
            onMouseLeave={() => setHovered(null)}
            className="relative bg-[#1e1e1e] overflow-hidden rounded-lg h-60 md:h-80 w-full transition-all duration-300 ease-out shadow-md hover:shadow-xl hover:scale-105"
            whileHover={{ scale: 1.05 }}
        >
            <Image
                src={`./Network_Provider/${provider.image}`}
                alt={provider.name}
                fill
                className="object-cover absolute inset-0 transition-transform duration-300 ease-in-out"
            />
            <div className="absolute inset-0 bg-black/50 flex items-end py-6 px-4 transition-opacity duration-300 ease-in-out">
                <div className="text-lg md:text-xl font-semibold text-white shadow-md">
                    {provider.name}
                </div>
            </div>
        </motion.div>
    )
);

NetworkProviderCard.displayName = "NetworkProviderCard";

export function NetworkProviderCards({ providers }) {
    const [hovered, setHovered] = useState(null);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto px-4 md:px-8 w-full">
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