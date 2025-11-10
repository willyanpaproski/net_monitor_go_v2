import React from "react";
import { useAuth } from "../hooks/useAuth";
import type { GridFilterModel, GridPaginationModel, GridSortModel } from "@mui/x-data-grid";
import type { DataTableResponse } from "../components/DataTable/DataTable";
import axios from "axios";
import { toast } from "react-toastify";

export function useDataTableFetch<T>(url: string) {
    const { token } = useAuth();

    return React.useCallback(async (params: {
        paginationModel: GridPaginationModel;
        sortModel: GridSortModel;
        filterModel: GridFilterModel;
    }): Promise<DataTableResponse<T>> => {
        try {
            const response = await axios.get<T | T[]>(url, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const data = response.data;
            const allItems: T[] = Array.isArray(data) ? data : [data];
            let filteredItems = [...allItems];

            if (params.filterModel.quickFilterValues && params.filterModel.quickFilterValues.length > 0) {
                const searchTerm = params.filterModel.quickFilterValues.join(" ").toLowerCase();
                filteredItems = allItems.filter(item =>
                    Object.values(item as object).some(value =>
                        String(value).toLowerCase().includes(searchTerm)
                    )
                );
            }

            if (params.filterModel.items.length > 0) {
                params.filterModel.items.forEach(filter => {
                    if (filter.value !== undefined && filter.value !== null && filter.value !== "") {
                        filteredItems = filteredItems.filter(item => {
                            const fieldValue = item[filter.field as keyof T];
                            const filterValue = filter.value;

                            switch (filter.operator) {
                                case "contains":
                                    return String(fieldValue).toLowerCase().includes(String(filterValue).toLowerCase());
                                case "equals":
                                    return fieldValue === filterValue;
                                case "startsWith":
                                    return String(fieldValue).toLowerCase().startsWith(String(filterValue).toLowerCase());
                                case "endsWith":
                                    return String(fieldValue).toLowerCase().endsWith(String(filterValue).toLowerCase());
                                case "isAnyOf":
                                    return Array.isArray(filterValue)
                                        ? filterValue.includes(fieldValue)
                                        : fieldValue === filterValue;
                                default:
                                    return String(fieldValue).toLowerCase().includes(String(filterValue).toLowerCase());
                            }
                        });
                    }
                });
            }

            if (params.sortModel.length > 0) {
                const sort = params.sortModel[0];
                filteredItems.sort((a, b) => {
                    const aVal = a[sort.field as keyof T];
                    const bVal = b[sort.field as keyof T];

                    if (aVal < bVal) return sort.sort === "desc" ? 1 : -1;
                    if (aVal > bVal) return sort.sort === "desc" ? -1 : 1;
                    return 0;
                });
            }

            const startIndex = params.paginationModel.page * params.paginationModel.pageSize;
            const endIndex = startIndex + params.paginationModel.pageSize;
            const paginatedItems = filteredItems.slice(startIndex, endIndex);

            return {
                items: paginatedItems,
                itemCount: filteredItems.length,
            };
        } catch (error) {
            toast.error('Erro ao consultar dados');
            throw error;
        }
    }, [token, url]);
}
