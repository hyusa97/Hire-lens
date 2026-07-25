import { Cta } from "@/components/landing/cta";
import { Features } from "@/components/landing/features";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-[linear-gradient(180deg,#f8faff_0%,#ffffff_100%)] text-slate-900">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <Features />
        <HowItWorks />
        <Cta />
      </main>
      <Footer />
    </div>
  );
}
