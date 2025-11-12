import type { GridColDef } from "@mui/x-data-grid";
import { useI18n } from "../../hooks/usei18n";
import * as React from "react";
import { Box, Chip } from "@mui/material";
import GenericDataTable, { type CustomAction } from "../../components/DataTable/DataTable";
import { useDataTableFetch } from "../../api/GenericDataTableFetch";
import { useDeleteTransmitter, type Transmitter } from "../../api/Transmitters";
import { toast } from "react-toastify";
import { ModalCreateEditTransmitter } from "./components/ModalCreateEditTransmitter";
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import { useNavigate } from "react-router-dom";

export default function Transmitters() {
    const { t } = useI18n();
    const deleteTransmitterMutation = useDeleteTransmitter();
    const navigate = useNavigate();
    const [isCreateModalVisible, setIsCreateModalVisible] = React.useState(false);
    const [rowData, setRowData] = React.useState<Transmitter | undefined>(undefined);

    const columns: GridColDef[] = React.useMemo(() => [
        {
            field: 'name',
            headerName: t('transmitters.dataTable.headers.name'),
            width: 180,
            flex: 0
        },
        {
            field: 'description',
            headerName: t('transmitters.dataTable.headers.description'),
            width: 250,
            flex: 0
        },
        {
            field: 'active',
            headerName: t('transmitters.dataTable.headers.status'),
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
            headerName: t('transmitters.dataTable.headers.integration'),
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
            headerName: t('transmitters.dataTable.headers.ipAddress'),
            width: 140,
            renderCell: (params) => (
                <span style={{ fontFamily: 'monospace' }}>
                    {params.value}
                </span>
            )
        },
        {
            field: 'accessUser',
            headerName: t('transmitters.dataTable.headers.user'),
            width: 120
        },
        {
            field: 'snmpCommunity',
            headerName: t('transmitters.dataTable.headers.snmpCommunity'),
            width: 140
        },
        {
            field: 'snmpPort',
            headerName: t('transmitters.dataTable.headers.snmpPort'),
            width: 110,
            renderCell: (params) => (
                <span style={{ fontFamily: 'monospace' }}>
                    {params.value}
                </span>
            )
        },
        {
            field: 'created_at',
            headerName: t('transmitters.dataTable.headers.createdAt'),
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
            headerName: t('transmitters.dataTable.headers.updatedAt'),
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

    const customActions: CustomAction<Transmitter>[] = React.useMemo(() => [
        {
            icon: <MonitorHeartIcon />,
            label: 'Monitor',
            onClick: (transmitter) => {navigate(`/transmitters/${transmitter.id}`)},
            show: (transmitter) => transmitter.active
        }
    ], []);

    const deleteTransmitter = React.useCallback(async (id: string) => {
        return deleteTransmitterMutation.mutateAsync(id);
    }, [deleteTransmitterMutation]);

    return (
        <Box sx={{
            mt: 3,
            ml: 2,
            flex: 1,
            width: "calc(100% - 240px)"
        }}>
            <GenericDataTable<Transmitter>
                title="Transmissores"
                columns={columns}
                fetchData={useDataTableFetch<Transmitter>('http://localhost:9090/api/transmitters')}
                deleteItem={deleteTransmitter}
                basePath="/transmitters"
                enableCreate={true}
                enableEdit={true}
                enableDelete={true}
                enableRowClick={true}
                initialPageSize={10}
                pageSizeOptions={[5, 10, 25, 50]}
                customActions={customActions}
                onCreateClick={() => {
                    setRowData(undefined);
                    setIsCreateModalVisible(true);
                }}
                onEditClick={(item) => {
                    setRowData(item);
                    setIsCreateModalVisible(true);
                }}
                onDeleteSuccess={() => toast.success(t('transmitters.dataTable.deleteSuccess'))}
                onDeleteError={() => toast.error(t('transmitters.dataTable.deleteError'))}
            />
            <ModalCreateEditTransmitter transmitter={rowData} isVisible={isCreateModalVisible} setIsVisible={setIsCreateModalVisible} />
        </Box>
    );
}