import type { GridColDef } from "@mui/x-data-grid";
import { useI18n } from "../../hooks/usei18n";
import * as React from 'react';
import { Box, Chip } from "@mui/material";
import GenericDataTable from "../../components/DataTable/DataTable";
import { useDataTableFetch } from "../../api/GenericDataTableFetch";
import { useDeleteSwitch, type NetworkSwitch } from "../../api/Switches";
import { toast } from "react-toastify";
import { ModalCreateEditSwitch } from "./components/ModalCreateSwitch";

export default function Switches() {
    const { t } = useI18n();
    const deleteSwitchMutation = useDeleteSwitch();
    const [isCreateModalVisible, setIsCreateModalVisible] = React.useState(false);
    const [rowData, setRowData] = React.useState<NetworkSwitch | undefined>(undefined);

    const columns: GridColDef[] = React.useMemo(() => [
        {
            field: 'name',
            headerName: t('switches.dataTable.headers.name'),
            width: 180,
            flex: 0
        },
        {
            field: 'description',
            headerName: t('switches.dataTable.headers.description'),
            width: 180,
            flex: 0
        },
        {
            field: 'active',
            headerName: t('switches.dataTable.headers.status'),
            width: 100,
            renderCell: (params) => (
                <Chip 
                    label={params.value ? 'Ativo': 'Inativo'}
                    color={params.value ? 'success' : 'default'}
                    size="small"
                    variant="outlined"
                />
            )
        },
        {
            field: 'integration',
            headerName: t('switches.dataTable.headers.integration'),
            width: 120,
            renderCell: (params) => (
                <Chip 
                    label={params.value}
                    color="primary"
                    size="small"
                    variant="outlined"
                />
            )
        },
        {
            field: 'ipAddress',
            headerName: t('switches.dataTable.headers.ipAddress'),
            width: 140,
            renderCell: (params) => (
               <span style={{ fontFamily: 'monospace' }}>
                    {params.value}
                </span> 
            )
        },
        {
            field: 'accessUser',
            headerName: t('switches.dataTable.headers.user'),
            width: 120
        },
        {
            field: 'snmpCommunity',
            headerName: t('switches.dataTable.headers.snmpCommunity'),
            width: 140
        },
        {
            field: 'snmpPort',
            headerName: t('switches.dataTable.headers.snmpPort'),
            width: 110,
            renderCell: (params) => (
                <span style={{ fontFamily: 'monospace' }}>
                    {params.value}
                </span>
            )
        },
        {
            field: 'created_at',
            headerName: t('switches.dataTable.headers.createdAt'),
            type: 'dateTime',
            width: 160,
            valueGetter: (value) => {
                if (!value || value === '1970-01-01T00:00:00Z') {
                    return null;
                }
                return new Date(value);
            },
            renderCell: (params) => {
                if (!params.value) {
                    return <span style={{ color: '#666', fontStyle: 'italic' }}>N/A</span>;
                }
                return params.value.toLocaleString('pt-BR');
            }
        },
        {
            field: 'updated_at',
            headerName: t('switches.dataTable.headers.updatedAt'),
            type: 'dateTime',
            width: 160,
            valueGetter: (value) => {
                if (!value || value === '1970-01-01T00:00:00Z') {
                    return null;
                }
                return new Date(value);
            },
            renderCell: (params) => {
                if (!params.value) {
                    return <span style={{ color: '#666', fontStyle: 'italic' }}>N/A</span>;
                }
                return params.value.toLocaleString('pt-BR');
            }
        }
    ], []);

    const deleteSwitch = React.useCallback(async (id: string) => {
        return deleteSwitchMutation.mutateAsync(id);
    }, [deleteSwitchMutation]);

    return (
        <Box sx={{
            mt: 3,
            ml: 2,
            flex: 1,
            width: "calc(100% - 240px)"
        }}>
            <GenericDataTable<NetworkSwitch> 
                title="Switches"
                columns={columns}
                fetchData={useDataTableFetch<NetworkSwitch>('http://localhost:9090/api/switches')}
                deleteItem={deleteSwitch}  
                basePath="/switches"
                enableCreate={true}
                enableEdit={true}
                enableDelete={true}
                enableRowClick={true}
                initialPageSize={10}
                pageSizeOptions={[5, 10, 25, 50]}
                onCreateClick={() => {
                    setRowData(undefined);
                    setIsCreateModalVisible(true);
                }}
                onEditClick={(item) => {
                    setRowData(item);
                    setIsCreateModalVisible(true);
                }}
                onDeleteSuccess={() => toast.success(t('switches.dataTable.deleteSuccess'))}
                onDeleteError={() => toast.error(t('switches.dataTable.deleteError'))}
            />
            <ModalCreateEditSwitch networkSwitch={rowData} isVisible={isCreateModalVisible} setIsVisible={setIsCreateModalVisible} />
        </Box>
    );
}