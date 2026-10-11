import { useEffect, useState } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip } from "recharts";
import { metricsAt } from "@/lib/pym/engine";
import { usd } from "@/lib/pym/format";

export function CoinChart({ seedKey, launchAt }: { seedKey: string; launchAt: string }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const start = new Date(launchAt).getTime();
  const elapsed = Math.max(0, (now - start) / 1000);
  const end = Math.min(Math.max(elapsed, 20), 600);
  const points = Array.from({ length: 29 }, (_, i) => {
    const sec = (end * i) / 28;
    return { t: Math.round(sec), mcap: Math.round(metricsAt(seedKey, sec).mcap) };
  });
  return (
    <div className="h-28 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={points} margin={{ top: 8, right: 0, left: 0, bottom: 0 }}>
          <Tooltip
            contentStyle={{
              background: "var(--color-panel)",
              border: "1px solid var(--color-line)",
              borderRadius: 12,
              color: "var(--color-cream)",
            }}
            formatter={(value) => [usd(Number(value)), "Mcap"]}
            labelFormatter={(label) => `${label}s`}
          />
          <Area dataKey="mcap" stroke="var(--color-lime)" fill="var(--color-lime)" fillOpacity={0.16} strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
