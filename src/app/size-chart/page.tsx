import { SiteFooter } from "../../components/site-footer";
import { SiteNav } from "../../components/site-nav";

type SizeRow = {
  size: string;
  width: string;
  length: string;
};

const sizes: SizeRow[] = [
  { size: "XS", width: "52", length: "67" },
  { size: "S", width: "55", length: "69" },
  { size: "M", width: "58", length: "71" },
  { size: "L", width: "61", length: "73" },
  { size: "XL", width: "64", length: "75" },
];

function SizeTable({ rows }: { rows: SizeRow[] }) {
  return (
    <section className="rounded-md border border-zinc-800 bg-zinc-950/60 p-4 sm:p-6">
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[420px] border-collapse text-left">
          <thead>
            <tr className="border-b border-zinc-800 font-body text-[10px] uppercase tracking-[0.25em] text-zinc-400 sm:text-xs">
              <th className="py-3 pr-4">Size</th>
              <th className="py-3 pr-4">Width (cm)</th>
              <th className="py-3 pr-4">Length (cm)</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.size} className="border-b border-zinc-900 text-sm text-zinc-200">
                <td className="py-3 pr-4 font-display text-lg tracking-[0.06em] text-white">{row.size}</td>
                <td className="py-3 pr-4">{row.width}</td>
                <td className="py-3 pr-4">{row.length}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default function SizeChartPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <SiteNav />
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
        <p className="font-display text-[10px] tracking-[0.35em] text-zinc-500 sm:text-xs sm:tracking-[0.5em]">
          FIT GUIDE
        </p>
        <h1 className="mt-5 font-display text-4xl uppercase leading-[0.95] tracking-[0.05em] sm:mt-6 sm:text-6xl">
          Size Chart
        </h1>
        <p className="mt-5 max-w-2xl font-body text-sm leading-relaxed tracking-[0.08em] text-zinc-300 sm:text-base">
          All measurements are in centimeters.
        </p>

        <div className="mt-10">
          <SizeTable rows={sizes} />
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
