import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Plus, Pencil, Trash2, ChevronLeft,
         ChevronRight, Users, Filter } from "lucide-react";
import { getEmployees, getCountries, getDepartments,
         type Employee } from "../api/employees";
import { formatCurrency } from "../lib/utils";
import { Badge } from "../components/ui/Badge";
import EmployeeFormModal from "../components/EmployeeFormModal";
import DeleteConfirmModal from "../components/DeleteConfirmModal";

const PAGE_SIZE = 20;
import { Download } from "lucide-react";  

// Add this import at the top

// Add this button next to the Add Employee button


export default function EmployeesPage() {
  const [page, setPage]           = useState(1);
  const [search, setSearch]       = useState("");
  const [country, setCountry]     = useState("");
  const [department, setDepartment] = useState("");
  const [addOpen, setAddOpen]     = useState(false);
  const [editTarget, setEditTarget]   = useState<Employee | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["employees", page, search, country, department],
    queryFn: () => getEmployees({ page, page_size: PAGE_SIZE, search, country, department }),
    placeholderData: prev => prev,
  });

  const { data: countries = [] } = useQuery({
    queryKey: ["countries"], queryFn: getCountries,
  });
  const { data: departments = [] } = useQuery({
    queryKey: ["departments"], queryFn: getDepartments,
  });

  function handleSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  function handleFilter(key: "country" | "department", value: string) {
    if (key === "country") setCountry(value);
    if (key === "department") setDepartment(value);
    setPage(1);
  }

  const employmentBadge = (type: string) => {
    if (type === "Full-time") return "success";
    if (type === "Contract")  return "warning";
    return "default";
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Employees</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {data?.total ? `${data.total.toLocaleString()} total employees` : "Loading..."}
          </p>
        </div>
        <button
          onClick={() => setAddOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Plus size={16} />
          Add Employee
              </button>
              
        <button
        onClick={handleExport}
        className="flex items-center gap-2 px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 text-sm font-medium rounded-lg transition-colors"
        >
        <Download size={16} />
        Export CSV
        </button>
      </div>

      {/* Filters bar */}
      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-white"
            placeholder="Search name, email, job title..."
            value={search}
            onChange={e => handleSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter size={14} className="text-slate-400" />
          <select
            className="text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-brand-500/20 bg-white"
            value={country}
            onChange={e => handleFilter("country", e.target.value)}
          >
            <option value="">All Countries</option>
            {countries.map(c => <option key={c}>{c}</option>)}
          </select>

          <select
            className="text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-brand-500/20 bg-white"
            value={department}
            onChange={e => handleFilter("department", e.target.value)}
          >
            <option value="">All Departments</option>
            {departments.map(d => <option key={d}>{d}</option>)}
          </select>

          {(search || country || department) && (
            <button
              onClick={() => { setSearch(""); setCountry(""); setDepartment(""); setPage(1); }}
              className="text-xs text-slate-500 hover:text-slate-700 underline"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                {["Name", "Job Title", "Department", "Country",
                  "Salary", "Type", "Hire Date", ""].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="border-b border-slate-50">
                    {Array.from({ length: 8 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-slate-100 rounded animate-pulse w-24" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : data?.data.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-16 text-center">
                    <Users size={32} className="mx-auto text-slate-300 mb-2" />
                    <p className="text-slate-400 text-sm">No employees found</p>
                  </td>
                </tr>
              ) : (
                data?.data.map(emp => (
                  <tr key={emp.id}
                    className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-slate-900">{emp.full_name}</p>
                        <p className="text-xs text-slate-400">{emp.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{emp.job_title}</td>
                    <td className="px-4 py-3 text-slate-600">{emp.department}</td>
                    <td className="px-4 py-3 text-slate-600">{emp.country}</td>
                    <td className="px-4 py-3 font-medium text-slate-900 font-mono text-xs">
                      {formatCurrency(emp.salary, emp.currency)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge label={emp.employment_type} variant={employmentBadge(emp.employment_type)} />
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">
                      {new Date(emp.hire_date).toLocaleDateString("en-GB", {
                        day: "2-digit", month: "short", year: "numeric"
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <button
                          onClick={() => setEditTarget(emp)}
                          className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-700"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(emp)}
                          className="p-1.5 hover:bg-red-50 rounded-lg transition-colors text-slate-400 hover:text-red-600"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data && data.total_pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
            <p className="text-xs text-slate-500">
              Page {data.page} of {data.total_pages} —{" "}
              {data.total.toLocaleString()} results
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 hover:bg-slate-100 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={16} className="text-slate-600" />
              </button>
              <span className="px-3 py-1 text-xs font-medium text-slate-600">
                {page}
              </span>
              <button
                onClick={() => setPage(p => Math.min(data.total_pages, p + 1))}
                disabled={page === data.total_pages}
                className="p-1.5 hover:bg-slate-100 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={16} className="text-slate-600" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {addOpen && (
        <EmployeeFormModal onClose={() => setAddOpen(false)} />
      )}
      {editTarget && (
        <EmployeeFormModal employee={editTarget} onClose={() => setEditTarget(null)} />
      )}
      {deleteTarget && (
        <DeleteConfirmModal employee={deleteTarget} onClose={() => setDeleteTarget(null)} />
      )}
    </div>
    );
    
    // Add this function inside EmployeesPage component
async function handleExport() {
  const all = await getEmployees({
    page: 1, page_size: 10000,
    search, country, department
  });

  const headers = [
    "ID", "Full Name", "Email", "Job Title",
    "Department", "Country", "Salary", "Currency",
    "Employment Type", "Hire Date"
  ];

  const rows = all.data.map(e => [
    e.id, e.full_name, e.email, e.job_title,
    e.department, e.country, e.salary, e.currency,
    e.employment_type, e.hire_date,
  ]);

  const csv = [headers, ...rows]
    .map(row => row.map(String).join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = `employees-export-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
}