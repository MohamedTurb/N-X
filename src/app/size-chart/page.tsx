import { SiteFooter } from "../../components/site-footer";
import { SiteNav } from "../../components/site-nav";
import { getAllProductSizing } from "../../lib/product-sizing";

function SizeTable({ title, firstLabel, secondLabel, helperText, rows }: { title: string; firstLabel: string; secondLabel: string; helperText: string; rows: Array<{ size: string; firstValue: string; secondValue: string }> }) {
  return (
    <section className="rounded-md border border-zinc-800 bg-zinc-950/60 p-4 sm:p-6">
      <p className="font-body text-[10px] uppercase tracking-[0.2em] text-zinc-400 sm:text-xs sm:tracking-[0.28em]">{title}</p>
      <p className="mt-2 text-[10px] uppercase tracking-[0.16em] text-zinc-500 sm:text-xs sm:tracking-[0.2em]">{helperText}</p>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-zinc-800 font-body text-[10px] uppercase tracking-[0.16em] text-zinc-400 sm:text-xs sm:tracking-[0.25em]">
              <th className="py-3 pr-4">Size</th>
              <th className="py-3 pr-4">{firstLabel} (cm)</th>
              <th className="py-3 pr-4">{secondLabel} (cm)</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={`${title}-${row.size}`} className="border-b border-zinc-900 text-xs text-zinc-200 sm:text-sm">
                <td className="py-3 pr-4 font-display text-lg tracking-[0.06em] text-white">{row.size}</td>
                <td className="py-3 pr-4">{row.firstValue}</td>
                <td className="py-3 pr-4">{row.secondValue}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default function SizeChartPage() {
  const charts = getAllProductSizing();

  return (
    <main className="min-h-screen bg-black text-white">
      <SiteNav />
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
        <p className="font-display text-[10px] tracking-[0.35em] text-zinc-500 sm:text-xs sm:tracking-[0.5em]">
          FIT GUIDE
        </p>
        <h1 className="mt-5 font-display text-3xl uppercase leading-[0.95] tracking-[0.05em] sm:mt-6 sm:text-5xl md:text-6xl">
          Size Chart
        </h1>
        <p className="mt-5 max-w-2xl font-body text-sm leading-relaxed tracking-[0.08em] text-zinc-300 sm:text-base">
          Different product types use different sizing systems. Pick the chart that matches the item you want.
        </p>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {charts.map((chart) => (
            <SizeTable
              key={chart.label}
              title={chart.label}
              firstLabel={chart.firstColumnLabel}
              secondLabel={chart.secondColumnLabel}
              helperText={chart.helperText}
              rows={chart.rows}
            />
          ))}
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
