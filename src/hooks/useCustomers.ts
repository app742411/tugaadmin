"use client";

import { useQuery } from "@tanstack/react-query";
import { customerService } from "@/services/customerService";
import { CustomerQueryParams, CustomerResponse, CustomerDetail } from "@/types/customer.types";

export const useGetCustomers = (params: CustomerQueryParams) => {
  const { data, isLoading, error, refetch, isPlaceholderData } = useQuery<CustomerResponse>({
    queryKey: ["customers", params],
    queryFn: () => customerService.getCustomers(params),
    placeholderData: (previousData) => previousData, // Maintain UI responsiveness on parameter changes
  });

  return {
    data,
    isLoading,
    error: error ? (error as any).message || "Failed to load customers" : null,
    refetch,
    isPlaceholderData,
  };
};

export const useGetCustomerDetail = (id: string) => {
  const { data, isLoading, error, refetch } = useQuery<CustomerDetail>({
    queryKey: ["customerDetail", id],
    queryFn: () => customerService.getCustomerDetail(id),
    enabled: !!id,
  });

  return {
    data,
    isLoading,
    error: error ? (error as any).message || "Failed to load customer details" : null,
    refetch,
  };
};
