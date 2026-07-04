import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { Navbar } from "@/components/ui/navbar";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Button } from "@/components/ui/button";

interface ModuleComingSoonProps {
  title: string;
  description: string;
  hubHref: string;
  hubLabel: string;
  accent?: "purple" | "blue" | "green";
}

const accentMap = {
  purple: "from-purple-600 to-violet-600 border-purple-200 bg-purple-50",
  blue: "from-blue-600 to-indigo-600 border-blue-200 bg-blue-50",
  green: "from-green-600 to-emerald-600 border-green-200 bg-green-50",
};

export function ModuleComingSoon({
  title,
  description,
  hubHref,
  hubLabel,
  accent = "purple",
}: ModuleComingSoonProps) {
  const styles = accentMap[accent];

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex flex-1 items-center justify-center px-4 py-16">
        <div
          className={`max-w-lg w-full rounded-2xl border p-8 text-center shadow-lg ${styles.split(" ").slice(2).join(" ")}`}
        >
          <div
            className={`mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br text-white ${styles.split(" ").slice(0, 2).join(" ")}`}
          >
            <Sparkles className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <p className="mt-3 text-gray-600 leading-relaxed">{description}</p>
          <p className="mt-4 text-sm text-gray-500">
            This module is in development. Try NeuroLearn for adaptive, sensory-aware
            learning today.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/learn">
              <Button className="w-full sm:w-auto">Open NeuroLearn</Button>
            </Link>
            <Link href={hubHref}>
              <Button variant="outline" className="w-full sm:w-auto gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to {hubLabel}
              </Button>
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
