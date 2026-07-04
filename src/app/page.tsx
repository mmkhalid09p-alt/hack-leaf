import Link from "next/link";
import { ArrowRight, Brain, BookOpen, TestTube, Sparkles, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Navbar } from "@/components/ui/navbar";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />

      <main className="flex-1 pt-16">
        {/* Hero */}
        <section className="w-full py-20 md:py-32 px-4 md:px-6 bg-gradient-to-b from-accent/40 via-background to-background">
          <div className="container mx-auto max-w-4xl flex flex-col items-center text-center gap-8">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-accent px-4 py-1.5 text-sm font-medium text-primary">
              <Brain className="h-4 w-4" />
              Helps all students learn, however your brain works
            </span>

            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl text-foreground">
              Learning that adapts{" "}
              <span className="text-primary">to you</span>
            </h1>

            <p className="max-w-2xl text-lg text-muted-foreground">
              AI-powered lessons that adjust to your sensory load in real time — plus
              specialised support for Autism, ADHD, Dyslexia, and Deaf/HoH learners.
              Works for every student, out of the box.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/subjects">
                <Button size="lg" className="gap-2">
                  <Sparkles className="h-4 w-4" />
                  Browse Subjects
                </Button>
              </Link>
              <Link href="/learn">
                <Button size="lg" variant="outline" className="gap-2">
                  Start Learning
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Primary feature cards */}
        <section className="w-full py-16 px-4 md:px-6">
          <div className="container mx-auto max-w-5xl">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <Link href="/subjects" className="group">
                <Card className="h-full hover:border-primary/40 transition-colors">
                  <CardHeader>
                    <div className="h-10 w-10 rounded-full bg-accent flex items-center justify-center mb-2">
                      <BookOpen className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle>Subject Library</CardTitle>
                    <CardDescription>
                      Browse Gemini-suggested topics across any subject — never a static catalog.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <span className="text-sm text-primary font-medium group-hover:underline underline-offset-4">
                      Explore subjects →
                    </span>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/learn" className="group">
                <Card className="h-full hover:border-primary/40 transition-colors">
                  <CardHeader>
                    <div className="h-10 w-10 rounded-full bg-accent flex items-center justify-center mb-2">
                      <Sparkles className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle>Adaptive Learn</CardTitle>
                    <CardDescription>
                      Drag the sensory-load slider and content re-generates to match — bullets,
                      prose, or one idea at a time.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <span className="text-sm text-primary font-medium group-hover:underline underline-offset-4">
                      Open Learn →
                    </span>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/progress" className="group">
                <Card className="h-full hover:border-primary/40 transition-colors">
                  <CardHeader>
                    <div className="h-10 w-10 rounded-full bg-accent flex items-center justify-center mb-2">
                      <BarChart3 className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle>Progress & Streaks</CardTitle>
                    <CardDescription>
                      Track topics explored, study streaks, and saved notes — no account needed
                      to get started.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <span className="text-sm text-primary font-medium group-hover:underline underline-offset-4">
                      View progress →
                    </span>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>
        </section>

        {/* Specialist support */}
        <section className="w-full py-16 px-4 md:px-6 bg-muted/40">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold tracking-tight">Specialist support included</h2>
              <p className="mt-2 text-muted-foreground">
                Screeners and gamified therapy modules, sitting alongside the new learning tools.
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <Card>
                <CardHeader>
                  <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-2">
                    <Brain className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <CardTitle>Autism Therapy</CardTitle>
                  <CardDescription>
                    Gamified modules for autism therapy and development.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/autism">
                    <Button variant="outline" size="sm" className="gap-2">
                      Explore Modules <ArrowRight className="h-3 w-3" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-2">
                    <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <CardTitle>Dyslexia Therapy</CardTitle>
                  <CardDescription>
                    Interactive learning strategies for dyslexia.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/dyslexia">
                    <Button variant="outline" size="sm" className="gap-2">
                      Explore Modules <ArrowRight className="h-3 w-3" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>

            <div className="mt-6 text-center">
              <Link href="/detection">
                <Button variant="outline" className="gap-2">
                  <TestTube className="h-4 w-4" />
                  Take the Detection Test
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Our approach */}
        <section className="w-full py-16 px-4 md:px-6">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold tracking-tight">Our approach</h2>
              <p className="mt-2 text-muted-foreground">
                Early detection + adaptive AI + gamified therapy, all in one place.
              </p>
            </div>
            <div className="grid gap-6 lg:grid-cols-3">
              {[
                {
                  icon: <TestTube className="h-5 w-5" />,
                  title: "Early Detection",
                  body: "Scientifically-backed screening tools help identify signs of Autism and Dyslexia early.",
                  color: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
                },
                {
                  icon: <Sparkles className="h-5 w-5" />,
                  title: "Gamified Therapy",
                  body: "Level-based modules make therapy engaging, motivating, and effective for all ages.",
                  color: "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400",
                },
                {
                  icon: <BarChart3 className="h-5 w-5" />,
                  title: "Progress Tracking",
                  body: "Monitor development with streaks, session history, and personalised AI summaries.",
                  color: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
                },
              ].map(({ icon, title, body, color }) => (
                <Card key={title}>
                  <CardHeader>
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center mb-2 ${color}`}>
                      {icon}
                    </div>
                    <CardTitle>{title}</CardTitle>
                    <CardDescription>{body}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t bg-muted/30">
        <div className="container mx-auto flex flex-col gap-4 py-10 md:flex-row md:gap-8 md:py-12 px-4 md:px-6">
          <div className="flex flex-col gap-2 lg:flex-1">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <Brain className="h-5 w-5 text-primary" />
              <span>NeuroDev Therapy</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Helping all students learn, however their brain works.
            </p>
          </div>
          <div className="grid flex-1 grid-cols-2 gap-8 sm:grid-cols-3">
            <div className="flex flex-col gap-2">
              <h3 className="font-semibold text-sm">Learn</h3>
              <nav className="flex flex-col gap-2">
                <Link href="/subjects" className="text-sm text-muted-foreground hover:text-foreground">Subjects</Link>
                <Link href="/learn" className="text-sm text-muted-foreground hover:text-foreground">Adaptive Learn</Link>
                <Link href="/progress" className="text-sm text-muted-foreground hover:text-foreground">Progress</Link>
              </nav>
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="font-semibold text-sm">Support</h3>
              <nav className="flex flex-col gap-2">
                <Link href="/autism" className="text-sm text-muted-foreground hover:text-foreground">Autism</Link>
                <Link href="/dyslexia" className="text-sm text-muted-foreground hover:text-foreground">Dyslexia</Link>
                <Link href="/detection" className="text-sm text-muted-foreground hover:text-foreground">Detection Test</Link>
              </nav>
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="font-semibold text-sm">Company</h3>
              <nav className="flex flex-col gap-2">
                <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground">About Us</Link>
                <Link href="/assistant" className="text-sm text-muted-foreground hover:text-foreground">AI Assistant</Link>
              </nav>
            </div>
          </div>
        </div>
        <div className="border-t py-6">
          <div className="container mx-auto flex flex-col items-center justify-between gap-4 md:flex-row px-4 md:px-6">
            <p className="text-center text-sm text-muted-foreground">
              © {new Date().getFullYear()} NeuroDev Therapy. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
