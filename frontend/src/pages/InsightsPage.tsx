import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, Legend,
} from "recharts";
import {
  TrendingUp, Users, DollarSign, Award,
  Globe, Building2
} from "lucide-react";
import {
  getSalaryStats, getSalaryByJobTitle, getDepartmentBreakdown,
  getTopPaidRoles, getSalaryDistribution, getSalaryPercentiles,
  getHeadcountByCountry,
} from "../api/analytics";
import { getCountries } from "../api/employees";
import { formatCurrency, formatNumber } from "../lib/utils";
import { StatCard } from "../components/ui/StatCard";

export default function InsightsPage() {
  const [selectedCountry, setSelectedCountry] = useState("United States");

  const { data: countries = [] } = useQuery({
    queryKey: ["countries"], queryFn: getCountries,
  });

  const { data: salaryStats } = useQuery({
    queryKey: ["salaryStats", selectedCountry],
    queryFn: () => getSalaryStats(selectedCountry),
    enabled: !!selectedCountry,
  });

  const { data: jobTitleSalaries = [] } = useQuery({
    queryKey: ["salaryByJobTitle", selectedCountry],
    queryFn: () => getSalaryByJobTitle(selectedCountry),
    enabled: !!selectedCountry,
  });

  const { data: departmentData = [] } = useQuery({
    queryKey: ["departmentBreakdown"],
    queryFn: getDepartmentBreakdown,
  });

  const { data: topRoles = [] } = useQuery({
    queryKey: ["topPaidRoles"],
    queryFn: () => getTopPaidRoles(10),
  });

  const { data: distribution = [] } = useQuery({
    queryKey: ["salaryDistribution", selectedCountry],
    queryFn: () => getSalaryDistribution(selectedCountry),
  });

  const { data: percentiles } = useQuery({
    queryKey: ["salaryPercentiles", selectedCountry],
    queryFn: () => getSalaryPercentiles(selectedCountry),
  });

  const { data: headcountData = [] } = useQuery({
    queryKey: ["headcountByCountry"],
    queryFn: getHeadcountByCountry,
  });

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Salary Insights</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Organisation-wide compensation analytics
        </p>
      </div>

      {/* ── Section 1: Country analysis ───────────────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Globe size={16} className="text-brand-600" />
            <h2 className="text-base font-semibold text-slate-800">
              Country Analysis
            </h2>
          </div>
          <select
            className="text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-brand-500/20 bg-white"
            value={selectedCountry}
            onChange={e => setSelectedCountry(e.target.value)}
          >
            {countries.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <StatCard
            label="Min Salary"
            value={salaryStats ? formatCurrency(salaryStats.min_salary) : "—"}
            sub="Lowest in country"
            icon={<DollarSign size={16} />}
          />
          <StatCard
            label="Average Salary"
            value={salaryStats ? formatCurrency(salaryStats.avg_salary) : "—"}
            sub="Mean across all roles"
            icon={<TrendingUp size={16} />}
          />
          <StatCard
            label="Max Salary"
            value={salaryStats ? formatCurrency(salaryStats.max_salary) : "—"}
            sub="Highest in country"
            icon={<Award size={16} />}
          />
          <StatCard
            label="Headcount"
            value={salaryStats ? formatNumber(salaryStats.headcount) : "—"}
            sub={`Employees in ${selectedCountry}`}
            icon={<Users size={16} />}
          />
        </div>

        {/* Percentile bands */}
        {percentiles && (
          <div className="bg-white border border-slate-200 rounded-xl p-5 mb-6">
            <h3 className="text-sm font-semibold text-slate-700 mb-4">
              Salary Percentile Bands — {selectedCountry}
            </h3>
            <div className="flex items-end gap-0 h-16 w-full rounded-lg overflow-hidden">
              {[
                { label: "Bottom 25%", value: percentiles.p25, color: "bg-blue-200", width: "w-1/4" },
                { label: "25–50%",     value: percentiles.p50, color: "bg-blue-400", width: "w-1/4" },
                { label: "50–75%",     value: percentiles.p75, color: "bg-blue-600", width: "w-1/4" },
                { label: "Top 25%",    value: percentiles.p90, color: "bg-blue-800", width: "w-1/4" },
              ].map(band => (
                <div key={band.label} className={`${band.width} ${band.color} h-full flex items-center justify-center`}>
                  <div className="text-center">
                    <p className="text-white text-xs font-medium">{band.label}</p>
                    <p className="text-white/80 text-xs">
                      ≤{formatCurrency(band.value)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Two charts side by side */}
        <div className="grid grid-cols-2 gap-4">
          {/* Salary distribution histogram */}
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-4">
              Salary Distribution — {selectedCountry}
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={distribution} barSize={28}>
                <XAxis
                  dataKey="band"
                  tick={{ fontSize: 10 }}
                  interval={0}
                  angle={-30}
                  textAnchor="end"
                  height={50}
                />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(v) => [formatNumber(Number(v ?? 0)), "Employees"]}
                  labelFormatter={l => `Band: ${l}`}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Avg salary by job title */}
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-4">
              Avg Salary by Job Title — {selectedCountry}
            </h3>
            <div className="overflow-y-auto max-h-[220px] space-y-2 scrollbar-thin pr-1">
              {jobTitleSalaries.slice(0, 12).map((row, i) => {
                const max = jobTitleSalaries[0]?.avg_salary || 1;
                const pct = Math.round((row.avg_salary / max) * 100);
                return (
                  <div key={row.job_title}>
                    <div className="flex justify-between text-xs mb-0.5">
                      <span className="text-slate-600 truncate max-w-[180px]">
                        {row.job_title}
                      </span>
                      <span className="font-medium text-slate-800 font-mono ml-2">
                        {formatCurrency(row.avg_salary)}
                      </span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full">
                      <div
                        className="h-full bg-brand-500 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 2: Organisation overview ──────────────────────────────── */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Building2 size={16} className="text-brand-600" />
          <h2 className="text-base font-semibold text-slate-800">
            Organisation Overview
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Department breakdown */}
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-4">
              Avg Salary by Department
            </h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart
                data={departmentData}
                layout="vertical"
                barSize={14}
                margin={{ left: 20 }}
              >
                <XAxis
                  type="number"
                  tick={{ fontSize: 10 }}
                  tickFormatter={v => `$${Math.round(v / 1000)}k`}
                />
                <YAxis
                  type="category"
                  dataKey="department"
                  tick={{ fontSize: 11 }}
                  width={120}
                />
                <Tooltip
                  formatter={(v) => [formatCurrency(Number(v ?? 0)), "Avg Salary"]}
                />
                <Bar dataKey="avg_salary" fill="#6366f1" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Top 10 paid roles globally */}
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-4">
              Top 10 Highest Paid Roles (Global)
            </h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart
                data={topRoles}
                layout="vertical"
                barSize={14}
                margin={{ left: 20 }}
              >
                <XAxis
                  type="number"
                  tick={{ fontSize: 10 }}
                  tickFormatter={v => `$${Math.round(v / 1000)}k`}
                />
                <YAxis
                  type="category"
                  dataKey="job_title"
                  tick={{ fontSize: 11 }}
                  width={140}
                />
                <Tooltip
                  formatter={(v) => [formatCurrency(Number(v ?? 0)), "Avg Salary"]}
                />
                <Bar dataKey="avg_salary" fill="#10b981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* ── Section 3: Global headcount ───────────────────────────────────── */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Users size={16} className="text-brand-600" />
          <h2 className="text-base font-semibold text-slate-800">
            Global Headcount
          </h2>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">
            Employees per Country
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={headcountData} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="country"
                tick={{ fontSize: 10 }}
                angle={-25}
                textAnchor="end"
                height={55}
              />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                formatter={(v, name) => [
                name === "headcount"
                    ? formatNumber(Number(v ?? 0))
                    : formatCurrency(Number(v ?? 0)),
                name === "headcount" ? "Employees" : "Avg Salary",
                ]}
              />
              <Legend />
              <Bar dataKey="headcount" fill="#f59e0b" radius={[4, 4, 0, 0]} name="headcount" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}