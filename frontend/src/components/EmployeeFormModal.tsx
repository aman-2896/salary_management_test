import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createEmployee,
  updateEmployee,
  getCountries,
  getDepartments,
  getJobTitles,
  type Employee,
  type EmployeeCreate,
} from "../api/employees";

interface Props {
  employee?: Employee | null;
  onClose: () => void;
}

const EMPLOYMENT_TYPES = ["Full-time", "Part-time", "Contract"];
const CURRENCIES = ["USD", "GBP", "EUR", "INR", "CAD", "AUD",
                    "SGD", "BRL", "JPY", "SEK", "PLN", "MXN"];

const empty: EmployeeCreate = {
  full_name: "", email: "", job_title: "", department: "",
  country: "", salary: 0, currency: "USD",
  employment_type: "Full-time", hire_date: "",
};

export default function EmployeeFormModal({ employee, onClose }: Props) {
  const qc = useQueryClient();
  const isEdit = !!employee;
  const [form, setForm] = useState<EmployeeCreate>(empty);
  const [errors, setErrors] = useState<Partial<Record<keyof EmployeeCreate, string>>>({});

  const { data: countries = [] } = useQuery({ queryKey: ["countries"], queryFn: getCountries });
  const { data: departments = [] } = useQuery({ queryKey: ["departments"], queryFn: getDepartments });
  const { data: jobTitles = [] } = useQuery({ queryKey: ["jobTitles"], queryFn: getJobTitles });

  useEffect(() => {
    if (employee) {
      setForm({
        full_name: employee.full_name,
        email: employee.email,
        job_title: employee.job_title,
        department: employee.department,
        country: employee.country,
        salary: employee.salary,
        currency: employee.currency,
        employment_type: employee.employment_type,
        hire_date: employee.hire_date,
      });
    }
  }, [employee]);

  const mutation = useMutation({
    mutationFn: isEdit
      ? (data: EmployeeCreate) => updateEmployee(employee!.id, data)
      : createEmployee,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["employees"] });
      onClose();
    },
  });

  function validate(): boolean {
    const e: typeof errors = {};
    if (!form.full_name.trim()) e.full_name = "Required";
    if (!form.email.trim()) e.email = "Required";
    if (!form.job_title.trim()) e.job_title = "Required";
    if (!form.department.trim()) e.department = "Required";
    if (!form.country.trim()) e.country = "Required";
    if (!form.salary || form.salary <= 0) e.salary = "Must be positive";
    if (!form.hire_date) e.hire_date = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit() {
    if (!validate()) return;
    mutation.mutate(form);
  }

  function field(key: keyof EmployeeCreate, value: string | number) {
    setForm(prev => ({ ...prev, [key]: value }));
    setErrors(prev => ({ ...prev, [key]: undefined }));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-900">
            {isEdit ? "Edit Employee" : "Add Employee"}
          </h2>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
            <X size={18} className="text-slate-500" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 grid grid-cols-2 gap-4">
          <Field label="Full Name" error={errors.full_name} className="col-span-2">
            <input
              className={input(errors.full_name)}
              value={form.full_name}
              onChange={e => field("full_name", e.target.value)}
              placeholder="Jane Doe"
            />
          </Field>

          <Field label="Email" error={errors.email} className="col-span-2">
            <input
              type="email"
              className={input(errors.email)}
              value={form.email}
              onChange={e => field("email", e.target.value)}
              placeholder="jane@company.com"
            />
          </Field>

          <Field label="Job Title" error={errors.job_title}>
            <select className={input(errors.job_title)} value={form.job_title}
              onChange={e => field("job_title", e.target.value)}>
              <option value="">Select...</option>
              {jobTitles.map(t => <option key={t}>{t}</option>)}
            </select>
          </Field>

          <Field label="Department" error={errors.department}>
            <select className={input(errors.department)} value={form.department}
              onChange={e => field("department", e.target.value)}>
              <option value="">Select...</option>
              {departments.map(d => <option key={d}>{d}</option>)}
            </select>
          </Field>

          <Field label="Country" error={errors.country}>
            <select className={input(errors.country)} value={form.country}
              onChange={e => field("country", e.target.value)}>
              <option value="">Select...</option>
              {countries.map(c => <option key={c}>{c}</option>)}
            </select>
          </Field>

          <Field label="Employment Type">
            <select className={input()} value={form.employment_type}
              onChange={e => field("employment_type", e.target.value)}>
              {EMPLOYMENT_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </Field>

          <Field label="Salary" error={errors.salary}>
            <input
              type="number"
              className={input(errors.salary)}
              value={form.salary || ""}
              onChange={e => field("salary", parseFloat(e.target.value))}
              placeholder="75000"
            />
          </Field>

          <Field label="Currency">
            <select className={input()} value={form.currency}
              onChange={e => field("currency", e.target.value)}>
              {CURRENCIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </Field>

          <Field label="Hire Date" error={errors.hire_date} className="col-span-2">
            <input
              type="date"
              className={input(errors.hire_date)}
              value={form.hire_date}
              onChange={e => field("hire_date", e.target.value)}
            />
          </Field>
        </div>

        {/* Error from API */}
        {mutation.isError && (
          <p className="px-6 pb-2 text-sm text-red-600">
            Something went wrong. Please check your inputs.
          </p>
        )}

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={mutation.isPending}
            className="px-5 py-2 text-sm font-medium bg-brand-600 hover:bg-brand-700 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            {mutation.isPending ? "Saving..." : isEdit ? "Save Changes" : "Add Employee"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── small helpers ─────────────────────────────────────────────────────────────

function input(error?: string) {
  return `w-full px-3 py-2 text-sm border rounded-lg outline-none transition-colors
    focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500
    ${error ? "border-red-400 bg-red-50" : "border-slate-200 bg-white"}`;
}

function Field({ label, error, children, className }: {
  label: string; error?: string;
  children: React.ReactNode; className?: string;
}) {
  return (
    <div className={className}>
      <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}