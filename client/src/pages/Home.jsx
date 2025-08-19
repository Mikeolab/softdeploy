// client/src/pages/Home.jsx
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <main className="w-full bg-[#141516] text-white">
      {/* HERO */}
      <section className="max-w-7xl mx-auto px-6 pt-14 pb-10">
        <span className="inline-flex items-center rounded-full bg-white/5 px-3 py-1 text-xs text-white/60 ring-1 ring-white/10">
          QA-first automation
        </span>
        <h1 className="mt-4 text-4xl font-semibold sm:text-5xl">
          Deliver high-quality software faster
        </h1>
        <p className="mt-3 max-w-2xl text-white/70">
          SoftDeploy automates tests, integrates code continuously and deploys with confidence.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link to="/signup" className="rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-black hover:bg-cyan-400">
            Get Started
          </Link>
          <Link to="/login" className="rounded-xl border border-white/15 px-4 py-2.5 text-sm font-semibold hover:bg-white/5">
            Log in
          </Link>
          <Link to="/app" className="rounded-xl border border-white/15 px-4 py-2.5 text-sm font-semibold text-white/80 hover:text-white">
            Open Dashboard
          </Link>
        </div>
      </section>
      {/* other sections can follow here */}
    </main>
  );
}
