import Link from "next/link";
import { Brain } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t bg-slate-50">
      <div className="container flex flex-col gap-4 py-10 md:flex-row md:gap-8 md:py-12">
        <div className="flex flex-col gap-2 md:gap-4 lg:flex-1">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Brain className="h-6 w-6" />
            <span>NeuroLearn</span>
          </Link>
          <p className="text-sm text-gray-500 md:text-base">
            Detection, therapy modules, and NeuroLearn — adaptive learning for
            neurodiverse minds.
          </p>
        </div>
        <div className="grid flex-1 grid-cols-2 gap-8 sm:grid-cols-3">
          <div className="flex flex-col gap-2">
            <h3 className="font-semibold">Explore</h3>
            <nav className="flex flex-col gap-2">
              <Link href="/learn" className="text-sm hover:underline">
                NeuroLearn
              </Link>
              <Link href="/autism" className="text-sm hover:underline">
                Autism Modules
              </Link>
              <Link href="/dyslexia" className="text-sm hover:underline">
                Dyslexia Modules
              </Link>
            </nav>
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="font-semibold">Support</h3>
            <nav className="flex flex-col gap-2">
              <Link href="/assistant" className="text-sm hover:underline">
                AI Assistant
              </Link>
              <Link href="/detection" className="text-sm hover:underline">
                Detection Tests
              </Link>
              <Link href="/about" className="text-sm hover:underline">
                About Us
              </Link>
            </nav>
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="font-semibold">Settings</h3>
            <nav className="flex flex-col gap-2">
              <Link href="/profile" className="text-sm hover:underline">
                Accessibility
              </Link>
              <Link href="/AuthPage" className="text-sm hover:underline">
                Login / Sign up
              </Link>
            </nav>
          </div>
        </div>
      </div>
      <div className="border-t py-6">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-center text-sm text-gray-500 md:text-left">
            © {new Date().getFullYear()} NeuroLearn. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
