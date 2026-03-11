"use client";

import { ChevronDown } from "lucide-react";
import { scrollToSection } from "@/lib/data";

export default function SectionArrow({ targetId }: { targetId: string }) {
    return (
        <div
            className="flex justify-center mt-20 mb-4 opacity-50 animate-bounce cursor-pointer hover:opacity-100 transition-opacity"
            onClick={() => scrollToSection(targetId)}
        >
            <ChevronDown size={32} className="text-[var(--jesuites-blue)]" />
        </div>
    );
}
