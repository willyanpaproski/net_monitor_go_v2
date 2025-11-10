import * as React from 'react';
import type { GridColDef } from '@mui/x-data-grid';
import { Box, Chip } from '@mui/material';
import GenericDataTable, { type CustomAction } from '../../components/DataTable/DataTable';
import { useDataTableFetch } from '../../api/GenericDataTableFetch';
import { useI18n } from '../../hooks/usei18n';
import { useDeleteRouter } from '../../api/Routers';
import { toast } from 'react-toastify';
import { ModalCreateEditRouter } from './components/ModalCreateEditRouter';
import type { Router } from '../../api/Routers';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import { useNavigate } from 'react-router-dom';

export default function Routers() {
  const { t } = useI18n();
  const deleteRouterMutation = useDeleteRouter();
  const navigate = useNavigate();
  const [isCreateEditModalVisible, setIsCreateEditModalVisible] = React.useState(false);
  const [rowData, setRowData] = React.useState<Router | undefined>(undefined);

  const columns: GridColDef[] = React.useMemo(() => [
    { 
      field: 'name', 
      headerName: t('routers.dataTable.headers.name'), 
      width: 180,
      flex: 0,
    },
    { 
      field: 'description', 
      headerName: t('routers.dataTable.headers.description'), 
      width: 250,
      flex: 0,
    },
    { 
      field: 'active', 
      headerName: t('routers.dataTable.headers.status'), 
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.value ? 'Ativo' : 'Inativo'}
          color={params.value ? 'success' : 'default'}
          size="small"
          variant="outlined"
        />
      ),
    },
    { 
      field: 'integration', 
      headerName: t('routers.dataTable.headers.integration'),
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color="primary"
          size="small"
          variant="outlined"
        />
      ),
    },
    { 
      field: 'ipAddress', 
      headerName: t('routers.dataTable.headers.ipAddress'),
      width: 140,
      renderCell: (params) => (
        <span style={{ fontFamily: 'monospace' }}>
          {params.value}
        </span>
      ),
    },
    { 
      field: 'accessUser', 
      headerName: t('routers.dataTable.headers.user'),
      width: 120,
    },
    { 
      field: 'snmpCommunity', 
      headerName: t('routers.dataTable.headers.snmpCommunity'),
      width: 140,
    },
    { 
      field: 'snmpPort', 
      headerName: t('routers.dataTable.headers.snmpPort'),
      width: 110,
      renderCell: (params) => (
        <span style={{ fontFamily: 'monospace' }}>
          {params.value}
        </span>
      ),
    },
    {
      field: 'created_at',
      headerName: t('routers.dataTable.headers.createdAt'),
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
      },
    },
    {
      field: 'updated_at',
      headerName: t('routers.dataTable.headers.updatedAt'),
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
      },
    },
  ], []);

  const customActions: CustomAction<Router>[] = React.useMemo(() => [
    {
      icon: <MonitorHeartIcon />,
      label: 'Monitor',
      onClick: (router) => {navigate(`/router/${router.id}`)},
      show: (router) => router.active
    }
  ], []);

  const deleteRouter = React.useCallback(async (id: string) => {
    return deleteRouterMutation.mutateAsync(id);
  }, [deleteRouterMutation]);

  const handleRowClick = React.useCallback((router: Router) => {
    console.log('Ver detalhes do roteador:', router);
  }, []);

  return (
    <Box sx={{
      mt: 3,
      ml: 2,
      flex: 1,
      width: "calc(100% - 240px)"
    }}>
      <GenericDataTable<Router>
        title="Roteadores"
        columns={columns}
        fetchData={useDataTableFetch<Router>('http://localhost:9090/api/routers')}
        deleteItem={deleteRouter}
        basePath="/routers"
        enableCreate={true}
        enableEdit={true}
        enableDelete={true}
        enableRowClick={true}
        initialPageSize={10}
        pageSizeOptions={[5, 10, 25, 50]}
        customActions={customActions}
        onCreateClick={() => {
          setRowData(undefined);
          setIsCreateEditModalVisible(true);
        }}
        onEditClick={(item) => {
          setRowData(item);
          setIsCreateEditModalVisible(true);
        }}
        onRowClick={handleRowClick}
        onDeleteSuccess={() => toast.success(t('routers.dataTable.deleteSuccess'))}
        onDeleteError={() => toast.error(t('routers.dataTable.deleteError'))}
      />
      <ModalCreateEditRouter router={rowData} isVisible={isCreateEditModalVisible} setIsVisible={setIsCreateEditModalVisible} />
    </Box>
  );
}