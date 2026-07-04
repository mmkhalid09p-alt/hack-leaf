import Link from "next/link";
import {
  ArrowRight,
  Brain,
  BookOpen,
  TestTube,
  Sparkles,
  SlidersHorizontal,
  VolumeX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/ui/navbar";
import { SiteFooter } from "@/components/layout/SiteFooter";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-slate-50 via-white to-violet-50/40">
      <Navbar />

      <main className="flex-1 pt-8">
        {/* NeuroLearn hero */}
        <section className="relative overflow-hidden border-b border-violet-100 bg-gradient-to-br from-[#0a0614] via-[#130d2a] to-[#1a0f35] text-white">
          <div className="container px-4 md:px-6 py-16 md:py-24">
            <div className="mx-auto max-w-3xl text-center space-y-6">
              <span className="inline-flex items-center gap-2 rounded-full border border-violet-500/40 bg-violet-950/50 px-4 py-1.5 text-sm font-medium text-violet-200">
                <Sparkles className="h-4 w-4" />
                New — NeuroLearn adaptive learning
              </span>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                Your brain changes every day.{" "}
                <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                  Your app should too.
                </span>
              </h1>
              <p className="text-lg text-slate-300 leading-relaxed">
                Set your sensory load (1–10) and watch the entire experience morph —
                content depth, colours, speech, and calm mode — powered by Gemini.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
                <Link href="/learn">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto bg-violet-600 hover:bg-violet-500 text-white gap-2"
                  >
                    Try NeuroLearn
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/profile">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto border-violet-400/50 text-violet-100 hover:bg-white/10 gap-2"
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                    Accessibility settings
                  </Button>
                </Link>
              </div>
              <div className="flex flex-wrap justify-center gap-6 pt-6 text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <SlidersHorizontal className="h-3.5 w-3.5" /> Sensory load meter
                </span>
                <span className="flex items-center gap-1.5">
                  <VolumeX className="h-3.5 w-3.5" /> Deaf / HoH mode
                </span>
                <span className="flex items-center gap-1.5">
                  <Brain className="h-3.5 w-3.5" /> Sand calm mode
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Original therapy CTAs */}
        <section className="container px-4 md:px-6 py-16 md:py-20">
          <div className="flex flex-col items-center text-center gap-12">
            <div className="space-y-4 max-w-3xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-green-300 bg-green-50 px-3 py-1.5 text-sm font-medium text-green-800">
                <Brain className="h-4 w-4 text-green-600" />
                Autism &amp; Dyslexia support
              </span>
              <h2 className="text-2xl font-bold tracking-tight text-green-900 sm:text-3xl md:text-4xl">
                Gamified, module-based therapies for every learner
              </h2>
              <p className="text-lg text-gray-600">
                Early detection screeners, therapy hubs, and an AI assistant — all in
                one open-source platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
                <Link href="/detection">
                  <Button
                    size="lg"
                    className="bg-green-600 hover:bg-green-700 text-white gap-2"
                  >
                    Take Detection Test
                    <TestTube className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/assistant">
                  <Button size="lg" variant="outline" className="gap-2 border-green-600 text-green-700">
                    AI Assistant
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>

            <div className="grid gap-8 sm:grid-cols-2 w-full max-w-4xl">
              <div className="flex flex-col items-center space-y-4 rounded-2xl border border-green-200 bg-white p-8 shadow-lg transition hover:shadow-xl">
                <div className="rounded-full bg-purple-100 p-3">
                  <Brain className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-green-800">Autism Therapy</h3>
                <p className="text-center text-gray-600">
                  Communication, social, cognitive, and behavioral modules.
                </p>
                <Link href="/autism">
                  <Button variant="outline" className="border-purple-300 text-purple-700">
                    Explore Modules
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
              <div className="flex flex-col items-center space-y-4 rounded-2xl border border-blue-200 bg-white p-8 shadow-lg transition hover:shadow-xl">
                <div className="rounded-full bg-blue-100 p-3">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-green-800">Dyslexia Therapy</h3>
                <p className="text-center text-gray-600">
                  Phonics, fluency, comprehension, and assistive strategies.
                </p>
                <Link href="/dyslexia">
                  <Button variant="outline" className="border-blue-300 text-blue-700">
                    Explore Modules
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-gradient-to-b from-green-50/80 to-white py-16 md:py-20">
          <div className="container px-4 md:px-6">
            <div className="mx-auto max-w-5xl text-center mb-12">
              <h2 className="text-3xl font-bold text-green-800">Our Approach</h2>
              <p className="mt-3 text-gray-600 max-w-2xl mx-auto">
                Early detection plus engaging therapy — now with NeuroLearn for
                sensory-adaptive study sessions.
              </p>
            </div>
            <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-3">
              {[
                {
                  icon: TestTube,
                  title: "Early Detection",
                  text: "Screening tools for autism and dyslexia signs — educational, not diagnostic.",
                },
                {
                  icon: Sparkles,
                  title: "NeuroLearn",
                  text: "AI content that adapts to your sensory load in real time.",
                },
                {
                  icon: Brain,
                  title: "Gamified Therapy",
                  text: "Level-based modules that make practice engaging and motivating.",
                },
              ].map(({ icon: Icon, title, text }) => (
                <div
                  key={title}
                  className="rounded-2xl border border-green-100 bg-white p-6 shadow-md"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-green-800">{title}</h3>
                  <p className="mt-2 text-sm text-gray-600">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
