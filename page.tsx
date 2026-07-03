"use client";

import { useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

type YearRow = {
  year: number;
  invested: number;
  [key: string]: number;
};

type Scenario = {
  key: string;
  label: string;
  rate: number;
  color: string;
};

const SCENARIOS_BASE: Scenario[] = [
  { key: "fd", label: "Fixed Deposit (~7%)", rate: 7, color: "#2563EB" },
  { key: "debt", label: "Debt Fund (~8%)", rate: 8, color: "#7C3AED" },
  { key: "nifty", label: "Nifty 50 Historical (~12%)", rate: 12, color: "#16A34A" },
  { key: "aggressive", label: "Aggressive Equity (~15%)", rate: 15, color: "#DC2626" },
];

function formatINR(n: number) {
  if (!isFinite(n)) return "₹0";
  return "₹" + Math.round(n).toLocaleString("en-IN");
}

function computeSeries(
  monthly: number,
  years: number,
  stepUpPct: number,
  annualRate: number
) {
  const months = Math.round(years * 12);
  const monthlyRate = Math.pow(1 + annualRate / 100, 1 / 12) - 1;
  let corpus = 0;
  let invested = 0;
  let currentMonthly = monthly;
  const yearly: { year: number; invested: number; corpus: number }[] = [];

  for (let m = 1; m <= months; m++) {
    corpus = corpus * (1 + monthlyRate) + currentMonthly;
    invested += currentMonthly;
    if (m % 12 === 0) {
      yearly.push({ year: m / 12, invested, corpus });
      currentMonthly = currentMonthly * (1 + stepUpPct / 100);
    }
  }
  // capture partial final year if duration isn't a whole number of years
  if (months % 12 !== 0) {
    yearly.push({ year: Math.ceil(months / 12), invested, corpus });
  }
  return { corpus, invested, yearly };
}

export default function Home() {
  const [monthly, setMonthly] = useState(10000);
  const [years, setYears] = useState(10);
  const [stepUp, setStepUp] = useState(10);
  const [expectedROI, setExpectedROI] = useState(12);
  const [pdfBusy, setPdfBusy] = useState(false);

  const scenarios = useMemo(() => {
    const list = [...SCENARIOS_BASE];
    // avoid duplicate line if user's chosen ROI matches a preset closely
    const custom: Scenario = {
      key: "your",
      label: `Your Selection (${expectedROI}%)`,
      rate: expectedROI,
      color: "#EAB308",
    };
    return [custom, ...list];
  }, [expectedROI]);

  const results = useMemo(() => {
    return scenarios.map((s) => ({
      ...s,
      ...computeSeries(monthly, years, stepUp, s.rate),
    }));
  }, [scenarios, monthly, years, stepUp]);

  const primary = results.find((r) => r.key === "your")!;

  const chartData: YearRow[] = useMemo(() => {
    const maxYear = Math.ceil(years);
    const rows: YearRow[] = [];
    for (let y = 1; y <= maxYear; y++) {
      const row: YearRow = { year: y, invested: 0 };
      results.forEach((r) => {
        const point = r.yearly.find((yy) => yy.year === y) || r.yearly[r.yearly.length - 1];
        row[r.key] = point ? Math.round(point.corpus) : 0;
        row.invested = point ? Math.round(point.invested) : row.invested;
      });
      rows.push(row);
    }
    return rows;
  }, [results, years]);

  const wealthGained = primary.corpus - primary.invested;

  async function downloadPDF() {
    setPdfBusy(true);
    try {
      const { jsPDF } = await import("jspdf");
      const autoTableModule = await import("jspdf-autotable");
      const autoTable = autoTableModule.default;

      const doc = new jsPDF();
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.setTextColor(124, 58, 237); // grape
      doc.text("SIP Sprout — Investment Projection Report", 14, 18);

      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      doc.setFont("helvetica", "normal");
      const genDate = new Date().toLocaleDateString("en-IN");
      doc.text(`Generated on ${genDate}`, 14, 25);

      doc.setFontSize(11);
      doc.setTextColor(20, 20, 20);
      const inputLines = [
        `Monthly investment: ${formatINR(monthly)}`,
        `Duration: ${years} years`,
        `Annual step-up: ${stepUp}%`,
        `Expected annual ROI: ${expectedROI}%`,
      ];
      doc.text(inputLines, 14, 35);

      doc.setFont("helvetica", "bold");
      doc.setTextColor(22, 163, 74); // leaf
      doc.text(`Total Invested: ${formatINR(primary.invested)}`, 14, 62);
      doc.text(`Total Corpus: ${formatINR(primary.corpus)}`, 14, 69);
      doc.setTextColor(220, 38, 38); // berry used for gain highlight
      doc.text(`Wealth Gained: ${formatINR(wealthGained)}`, 14, 76);

      const tableBody = chartData.map((row) => [
        row.year.toString(),
        formatINR(row.invested),
        formatINR(row["your"]),
        formatINR(row["nifty"]),
        formatINR(row["fd"]),
      ]);

      autoTable(doc, {
        startY: 85,
        head: [["Year", "Invested", "Your ROI", "Nifty 50 (~12%)", "Fixed Deposit (~7%)"]],
        body: tableBody,
        headStyles: { fillColor: [124, 58, 237] },
        alternateRowStyles: { fillColor: [250, 245, 255] },
        styles: { fontSize: 9 },
      });

      doc.setFontSize(8);
      doc.setTextColor(120, 120, 120);
      const pageHeight = doc.internal.pageSize.height;
      doc.text(
        "Projections are illustrative, based on assumed constant annual returns, and are not a guarantee of actual performance.",
        14,
        pageHeight - 10
      );

      doc.save("sip-sprout-projection.pdf");
    } finally {
      setPdfBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-cream text-gray-900">
      {/* Hero */}
      <section className="relative overflow-hidden border-b-4 border-grape/10 px-6 py-14 md:px-12">
        <div className="mx-auto max-w-5xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-leaf/10 px-4 py-1 text-sm font-semibold text-leaf">
            🌱 Grow your money, one month at a time
          </div>
          <h1 className="font-display text-4xl font-bold leading-tight text-gray-900 md:text-6xl">
            SIP Sprout
          </h1>
          <p className="mt-3 max-w-xl text-lg text-gray-600">
            Fill in your monthly investment plan below and watch your corpus grow
            year on year — compared side by side with real market benchmarks.
          </p>
        </div>
        {/* decorative blobs */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-blob bg-violet2/20" />
        <div className="pointer-events-none absolute -right-4 top-40 h-24 w-24 rounded-blob bg-sun/30" />
      </section>

      <section className="mx-auto grid max-w-5xl gap-8 px-6 py-10 md:grid-cols-5 md:px-12">
        {/* Input panel */}
        <div className="md:col-span-2">
          <div className="rounded-2xl border-2 border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="font-display mb-5 text-xl font-bold text-grape">
              Your plan
            </h2>

            <label className="mb-1 block text-sm font-semibold text-gray-700">
              Monthly investment
            </label>
            <div className="mb-4 flex items-center gap-2 rounded-xl border-2 border-sky/20 bg-sky/5 px-3 py-2">
              <span className="font-display font-bold text-sky">₹</span>
              <input
                type="number"
                min={500}
                step={500}
                value={monthly}
                onChange={(e) => setMonthly(Math.max(0, Number(e.target.value)))}
                className="w-full bg-transparent font-semibold text-gray-900 outline-none"
              />
            </div>

            <label className="mb-1 block text-sm font-semibold text-gray-700">
              Duration: <span className="text-leaf">{years} years</span>
            </label>
            <input
              type="range"
              min={1}
              max={35}
              value={years}
              onChange={(e) => setYears(Number(e.target.value))}
              className="mb-4 w-full accent-leaf"
            />

            <label className="mb-1 block text-sm font-semibold text-gray-700">
              Annual step-up: <span className="text-sun">{stepUp}%</span>
              <span className="ml-1 font-normal text-gray-400">
                (increase to your monthly SIP every year)
              </span>
            </label>
            <input
              type="range"
              min={0}
              max={30}
              value={stepUp}
              onChange={(e) => setStepUp(Number(e.target.value))}
              className="mb-4 w-full accent-sun"
            />

            <label className="mb-1 block text-sm font-semibold text-gray-700">
              Expected annual ROI
            </label>
            <div className="mb-2 grid grid-cols-4 gap-2">
              {[8, 10, 12, 15].map((r) => (
                <button
                  key={r}
                  onClick={() => setExpectedROI(r)}
                  className={`rounded-lg border-2 py-1.5 text-sm font-bold transition ${
                    expectedROI === r
                      ? "border-berry bg-berry text-white"
                      : "border-gray-200 text-gray-600 hover:border-berry/50"
                  }`}
                >
                  {r}%
                </button>
              ))}
            </div>
            <input
              type="number"
              value={expectedROI}
              onChange={(e) => setExpectedROI(Number(e.target.value))}
              className="w-full rounded-xl border-2 border-berry/20 bg-berry/5 px-3 py-2 font-semibold outline-none"
            />

            <button
              onClick={downloadPDF}
              disabled={pdfBusy}
              className="font-display mt-6 w-full rounded-xl bg-grape py-3 font-bold text-white shadow-md transition hover:bg-grape/90 disabled:opacity-60"
            >
              {pdfBusy ? "Preparing PDF…" : "📄 Download projection report (PDF)"}
            </button>
          </div>
        </div>

        {/* Results panel */}
        <div className="md:col-span-3">
          <div className="mb-6 grid grid-cols-3 gap-3">
            <StatCard label="Total invested" value={formatINR(primary.invested)} bg="bg-sky/10" text="text-sky" />
            <StatCard label="Wealth gained" value={formatINR(wealthGained)} bg="bg-leaf/10" text="text-leaf" />
            <StatCard label="Final corpus" value={formatINR(primary.corpus)} bg="bg-grape/10" text="text-grape" />
          </div>

          <div className="rounded-2xl border-2 border-gray-100 bg-white p-4 shadow-sm md:p-6">
            <h3 className="font-display mb-4 text-lg font-bold text-gray-800">
              Growth vs. market benchmarks
            </h3>
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="year" tickFormatter={(y) => `Y${y}`} />
                <YAxis tickFormatter={(v) => `₹${Math.round(v / 100000)}L`} width={50} />
                <Tooltip formatter={(v: number) => formatINR(v)} labelFormatter={(y) => `Year ${y}`} />
                <Legend />
                <Line type="monotone" dataKey="invested" name="Amount Invested" stroke="#9CA3AF" strokeDasharray="4 4" dot={false} />
                {results.map((r) => (
                  <Line
                    key={r.key}
                    type="monotone"
                    dataKey={r.key}
                    name={r.label}
                    stroke={r.color}
                    strokeWidth={r.key === "your" ? 3 : 2}
                    dot={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>

          <p className="mt-3 text-xs text-gray-400">
            Projections assume constant annual returns compounded monthly. Actual market-linked returns fluctuate and are not guaranteed.
          </p>
        </div>
      </section>
    </main>
  );
}

function StatCard({ label, value, bg, text }: { label: string; value: string; bg: string; text: string }) {
  return (
    <div className={`rounded-2xl ${bg} p-4`}>
      <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</div>
      <div className={`font-display mt-1 text-xl font-bold ${text} md:text-2xl`}>{value}</div>
    </div>
  );
}
