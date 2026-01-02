"use client"

import { motion } from "motion/react";

export function ImageSection() {
    return (
        <div className="relative mx-auto mt-12 aspect-[1280/720] w-full max-w-[1280px] overflow-hidden">
            {/* Background layer */}
            <img
                src="/assets/360_F_658494014_q8nJAByf6cxkYyXBMpXB6R.webp"
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
            />

            {/* Product overlay with slide up and fade in */}
            <motion.div
                className="mt-auto flex h-full items-end px-6 md:px-10"
                initial={{ y: 150, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{
                    duration: 0.5,
                    ease: "easeOut",
                }}
            >
                <img
                    src="/assets/SCR-20260102-kufd.png"
                    alt="sajn product screenshot"
                    className="relative w-full rounded-t-md object-contain"
                />
            </motion.div>
        </div>
    );
}
