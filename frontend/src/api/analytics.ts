import { apiClient } from "./client";

export interface SalaryStats {
  country: string;
  min_salary: number;
  max_salary: number;
  avg_salary: number;
  headcount: number;
}

export interface JobTitleSalary {
  job_title: string;
  avg_salary: number;
  headcount: number;
}

export interface DepartmentBreakdown {
  department: string;
  headcount: number;
  avg_salary: number;
  min_salary: number;
  max_salary: number;
}

export interface SalaryBand {
  band: string;
  min: number;
  max: number;
  count: number;
}

export interface Percentiles {
  p25: number;
  p50: number;
  p75: number;
  p90: number;
  total_employees: number;
}

export interface CountryHeadcount {
  country: string;
  headcount: number;
  avg_salary: number;
}

export const getSalaryStats = async (country: string) => {
  const { data } = await apiClient.get<SalaryStats>("/analytics/salary-stats", {
    params: { country },
  });
  return data;
};

export const getSalaryByJobTitle = async (country: string) => {
  const { data } = await apiClient.get<JobTitleSalary[]>(
    "/analytics/salary-by-job-title",
    { params: { country } }
  );
  return data;
};

export const getDepartmentBreakdown = async () => {
  const { data } = await apiClient.get<DepartmentBreakdown[]>(
    "/analytics/department-breakdown"
  );
  return data;
};

export const getTopPaidRoles = async (limit = 10) => {
  const { data } = await apiClient.get<JobTitleSalary[]>(
    "/analytics/top-paid-roles",
    { params: { limit } }
  );
  return data;
};

export const getSalaryDistribution = async (country?: string) => {
  const { data } = await apiClient.get<SalaryBand[]>(
    "/analytics/salary-distribution",
    { params: country ? { country } : {} }
  );
  return data;
};

export const getSalaryPercentiles = async (country?: string) => {
  const { data } = await apiClient.get<Percentiles>(
    "/analytics/salary-percentiles",
    { params: country ? { country } : {} }
  );
  return data;
};

export const getHeadcountByCountry = async () => {
  const { data } = await apiClient.get<CountryHeadcount[]>(
    "/analytics/headcount-by-country"
  );
  return data;
};