import { apiClient } from "./client";

export interface Employee {
  id: number;
  full_name: string;
  email: string;
  job_title: string;
  department: string;
  country: string;
  salary: number;
  currency: string;
  employment_type: string;
  hire_date: string;
  created_at: string;
  updated_at: string;
}

export interface EmployeeCreate {
  full_name: string;
  email: string;
  job_title: string;
  department: string;
  country: string;
  salary: number;
  currency: string;
  employment_type: string;
  hire_date: string;
}

export type EmployeeUpdate = Partial<EmployeeCreate>;

export interface PaginatedResponse {
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  data: Employee[];
}

export interface EmployeeFilters {
  page?: number;
  page_size?: number;
  search?: string;
  country?: string;
  department?: string;
  job_title?: string;
}

// ── CRUD ──────────────────────────────────────────────────────────────────────

export const getEmployees = async (filters: EmployeeFilters = {}) => {
  const { data } = await apiClient.get<PaginatedResponse>("/employees", {
    params: filters,
  });
  return data;
};

export const getEmployee = async (id: number) => {
  const { data } = await apiClient.get<Employee>(`/employees/${id}`);
  return data;
};

export const createEmployee = async (payload: EmployeeCreate) => {
  const { data } = await apiClient.post<Employee>("/employees", payload);
  return data;
};

export const updateEmployee = async (id: number, payload: EmployeeUpdate) => {
  const { data } = await apiClient.put<Employee>(`/employees/${id}`, payload);
  return data;
};

export const deleteEmployee = async (id: number) => {
  await apiClient.delete(`/employees/${id}`);
};

// ── Meta (for dropdowns) ──────────────────────────────────────────────────────

export const getCountries = async () => {
  const { data } = await apiClient.get<string[]>("/employees/meta/countries");
  return data;
};

export const getDepartments = async () => {
  const { data } = await apiClient.get<string[]>("/employees/meta/departments");
  return data;
};

export const getJobTitles = async () => {
  const { data } = await apiClient.get<string[]>("/employees/meta/job-titles");
  return data;
};