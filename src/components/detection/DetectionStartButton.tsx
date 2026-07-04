"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TestTube } from "lucide-react";

interface DetectionStartButtonProps {
  label: string;
  variant: "autism" | "dyslexia";
}

export function DetectionStartButton({ label, variant }: DetectionStartButtonProps) {
  const className =
    variant === "autism"
      ? "w-full bg-purple-600 hover:bg-purple-700"
      : "w-full bg-blue-600 hover:bg-blue-700";

  return (
    <div className="space-y-3 w-full">
      <Button className={className} disabled>
        {label}
        <TestTube className="ml-2 h-4 w-4" />
      </Button>
      <p className="text-xs text-center text-gray-500">
        Full screening flow coming soon.{" "}
        <Link href="/learn" className="text-violet-600 hover:underline font-medium">
          Try NeuroLearn
        </Link>{" "}
        or{" "}
        <Link href="/assistant" className="text-violet-600 hover:underline font-medium">
          ask the AI assistant
        </Link>{" "}
        in the meantime.
      </p>
    </div>
  );
}
