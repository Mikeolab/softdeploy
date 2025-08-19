import { listDeploys, rollbackDeploy, triggerDeploy } from "../lib/api.js";
import { useState } from "react";

export default function Deploy() {
  const [items, setItems] = useState(listDeploys());
  const [busy, setBusy] = useState(false);

  async function go(env){
    setBusy(true);
    const rec = await triggerDeploy(env);
    setItems([rec, ...items]);
    setBusy(false);
  }
  function rb(id){
    const rec = rollbackDeploy(id);
    setItems([rec, ...items]);
  }

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <h1 className="text-2xl font-semibold">Deploy</h1>
      <p className="mt-1 text-white/70">One-click with health checks & rollback.</p>

      <div className="mt-6 flex gap-3">
        <button onClick={()=>go("staging")} disabled={busy} className="rounded-lg bg-cyan-500 px-3 py-2 font-semibold text-black disabled:opacity-60">
          {busy ? "Deploying…" : "Deploy to Staging"}
        </button>
        <button onClick={()=>go("prod")} disabled={busy} className="rounded-lg border border-white/15 px-3 py-2">
          {busy ? "Deploying…" : "Deploy to Prod"}
        </button>
      </div>

      <div className="mt-6 grid gap-3">
        {items.map(d=>(
          <div key={d.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="font-semibold">{d.env.toUpperCase()}</div>
                <div className="text-xs text-white/60">{new Date(d.startedAt).toLocaleString()} – {d.ok ? "Healthy" : "Unhealthy"} – {d.url}</div>
              </div>
              <div className="flex gap-2">
                <button onClick={()=>rb(d.id)} className="rounded-lg border border-white/15 px-3 py-1.5">Rollback</button>
              </div>
            </div>
            <div className="mt-2 text-sm text-white/70">{d.notes}</div>
          </div>
        ))}
        {!items.length && <div className="text-white/60">No deployments yet.</div>}
      </div>
    </main>
  );
}