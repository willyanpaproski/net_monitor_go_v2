import * as React from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import {
  DataGrid,
  GridActionsCellItem,
  gridClasses,
} from '@mui/x-data-grid';
import type { GridColDef, GridFilterModel, GridPaginationModel, GridSortModel, GridEventListener } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useLocation, useNavigate, useSearchParams } from 'react-router';
import PageContainer from './PageContainer';
import { useI18n } from '../../hooks/usei18n';

const INITIAL_PAGE_SIZE = 10;

export interface DataTableItem {
  id: string | number;
  [key: string]: any;
}

export interface DataTableResponse<T> {
  items: T[];
  itemCount: number;
}

export interface CustomAction<T> {
  icon: React.ReactElement;
  label: string;
  onClick: (item: T) => void;
  color?: 'inherit' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
  show?: (item: T) => boolean;
}

export interface DataTableProps<T extends DataTableItem> {
  title: string;
  columns: GridColDef[];
 
  fetchData: (params: {
    paginationModel: GridPaginationModel;
    sortModel: GridSortModel;
    filterModel: GridFilterModel;
  }) => Promise<DataTableResponse<T>>;
  deleteItem?: (id: string) => Promise<void>;
 
  basePath: string;
 
  enableCreate?: boolean;
  enableEdit?: boolean;
  enableDelete?: boolean;
  enableRowClick?: boolean;
  initialPageSize?: number;
  pageSizeOptions?: number[];
  customActions?: CustomAction<T>[];
 
  onCreateClick?: () => void;
  onEditClick?: (item: T) => void;
  onDeleteClick?: (item: T) => void;
  onRowClick?: (item: T) => void;
  onDeleteSuccess?: (item: T) => void;
  onDeleteError?: (error: Error, item: T) => void;
}

export default function GenericDataTable<T extends DataTableItem>({
  title,
  columns: baseColumns,
  fetchData,
  deleteItem,
  basePath,
  enableCreate = true,
  enableEdit = true,
  enableDelete = true,
  enableRowClick = true,
  initialPageSize = INITIAL_PAGE_SIZE,
  pageSizeOptions = [5, INITIAL_PAGE_SIZE, 25],
  customActions = [],
  onCreateClick,
  onEditClick,
  onDeleteClick,
  onRowClick,
  onDeleteSuccess,
  onDeleteError,
}: DataTableProps<T>) {
  const { pathname } = useLocation();
  const { t } = useI18n();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [paginationModel, setPaginationModel] = React.useState<GridPaginationModel>({
    page: searchParams.get('page') ? Number(searchParams.get('page')) : 0,
    pageSize: searchParams.get('pageSize')
      ? Number(searchParams.get('pageSize'))
      : initialPageSize,
  });

  const [filterModel, setFilterModel] = React.useState<GridFilterModel>(
    searchParams.get('filter')
      ? JSON.parse(searchParams.get('filter') ?? '')
      : { items: [] },
  );

  const [sortModel, setSortModel] = React.useState<GridSortModel>(
    searchParams.get('sort') ? JSON.parse(searchParams.get('sort') ?? '') : [],
  );

  const [rowsState, setRowsState] = React.useState<{
    rows: T[];
    rowCount: number;
  }>({
    rows: [],
    rowCount: 0,
  });

  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  const handlePaginationModelChange = React.useCallback(
    (model: GridPaginationModel) => {
      setPaginationModel(model);
      searchParams.set('page', String(model.page));
      searchParams.set('pageSize', String(model.pageSize));
      const newSearchParamsString = searchParams.toString();
      navigate(
        `${pathname}${newSearchParamsString ? '?' : ''}${newSearchParamsString}`,
      );
    },
    [navigate, pathname, searchParams],
  );

  const handleFilterModelChange = React.useCallback(
    (model: GridFilterModel) => {
      setFilterModel(model);
      if (
        model.items.length > 0 ||
        (model.quickFilterValues && model.quickFilterValues.length > 0)
      ) {
        searchParams.set('filter', JSON.stringify(model));
      } else {
        searchParams.delete('filter');
      }
      const newSearchParamsString = searchParams.toString();
      navigate(
        `${pathname}${newSearchParamsString ? '?' : ''}${newSearchParamsString}`,
      );
    },
    [navigate, pathname, searchParams],
  );

  const handleSortModelChange = React.useCallback(
    (model: GridSortModel) => {
      setSortModel(model);
      if (model.length > 0) {
        searchParams.set('sort', JSON.stringify(model));
      } else {
        searchParams.delete('sort');
      }
      const newSearchParamsString = searchParams.toString();
      navigate(
        `${pathname}${newSearchParamsString ? '?' : ''}${newSearchParamsString}`,
      );
    },
    [navigate, pathname, searchParams],
  );

  const loadData = React.useCallback(async () => {
    setError(null);
    setIsLoading(true);
    try {
      const listData = await fetchData({
        paginationModel,
        sortModel,
        filterModel,
      });
      setRowsState({
        rows: listData.items,
        rowCount: listData.itemCount,
      });
    } catch (listDataError) {
      setError(listDataError as Error);
    }
    setIsLoading(false);
  }, [fetchData, paginationModel, sortModel, filterModel]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = React.useCallback(() => {
    if (!isLoading) {
      loadData();
    }
  }, [isLoading, loadData]);

  const handleRowClick = React.useCallback<GridEventListener<'rowClick'>>(
    (params) => {
      if (enableRowClick) {
        if (onRowClick) {
          onRowClick(params.row);
        } else {
          navigate(`${basePath}/${params.row.id}`);
        }
      }
    },
    [navigate, basePath, enableRowClick, onRowClick],
  );

  const handleCreateClick = React.useCallback(() => {
    if (onCreateClick) {
      onCreateClick();
    } else {
      navigate(`${basePath}/new`);
    }
  }, [navigate, basePath, onCreateClick]);

  const handleRowEdit = React.useCallback(
    (item: T) => () => {
      if (onEditClick) {
        onEditClick(item);
      } else {
        navigate(`${basePath}/${item.id}/edit`);
      }
    },
    [navigate, basePath, onEditClick],
  );

  const handleRowDelete = React.useCallback(
    (item: T) => async () => {
      if (onDeleteClick) {
        onDeleteClick(item);
        return;
      }

      const itemName = (item as any).name || (item as any).title || `item ${item.id}`;
      const confirmed = window.confirm(`Deseja realmente excluir ${itemName}?`);
      
      if (confirmed && deleteItem) {
        setIsLoading(true);
        try {
          await deleteItem(String(item.id));
         
          if (onDeleteSuccess) {
            onDeleteSuccess(item);
          } else {
            alert('Item excluído com sucesso!');
          }
         
          loadData();
        } catch (deleteError) {
          const error = deleteError as Error;
         
          if (onDeleteError) {
            onDeleteError(error, item);
          } else {
            alert(`Erro ao excluir item: ${error.message}`);
          }
        }
        setIsLoading(false);
      }
    },
    [deleteItem, loadData, onDeleteClick, onDeleteSuccess, onDeleteError],
  );

  const initialState = React.useMemo(
    () => ({
      pagination: { paginationModel: { pageSize: initialPageSize } },
    }),
    [initialPageSize],
  );

  const columns = React.useMemo<GridColDef[]>(() => {
    const cols = [...baseColumns];

    if (enableEdit || enableDelete || customActions.length > 0) {
      const totalActions = 
        (enableEdit ? 1 : 0) + 
        (enableDelete ? 1 : 0) + 
        customActions.length;
      
      const actionColumnWidth = Math.max(100, totalActions * 50);

      cols.push({
        field: 'actions',
        type: 'actions',
        headerName: 'Ações',
        width: actionColumnWidth,
        cellClassName: 'actions',
        getActions: (params) => {
          const actions = [];
          
          customActions.forEach((customAction, index) => {
            if (customAction.show && !customAction.show(params.row)) {
              return;
            }
            
            actions.push(
              <GridActionsCellItem
                key={`custom-${index}`}
                icon={customAction.icon}
                label={customAction.label}
                onClick={() => customAction.onClick(params.row)}
                color='inherit'
              />
            );
          });
          
          if (enableEdit) {
            actions.push(
              <GridActionsCellItem
                key="edit"
                icon={<EditIcon />}
                label="Editar"
                onClick={handleRowEdit(params.row)}
                color="inherit"
              />
            );
          }
          
          if (enableDelete) {
            actions.push(
              <GridActionsCellItem
                key="delete"
                icon={<DeleteIcon />}
                label="Excluir"
                onClick={handleRowDelete(params.row)}
                color="inherit"
              />
            );
          }
          
          return actions;
        },
      });
    }
    
    return cols;
  }, [baseColumns, enableEdit, enableDelete, customActions, handleRowEdit, handleRowDelete]);
  
  return (
    <PageContainer
      title={title}
      actions={
        <Stack direction="row" alignItems="center" spacing={1}>
          <Tooltip title="Recarregar dados" placement="right" enterDelay={1000}>
            <div>
              <IconButton size="small" aria-label="refresh" onClick={handleRefresh}>
                <RefreshIcon />
              </IconButton>
            </div>
          </Tooltip>
          {enableCreate && (
            <Button
              variant="contained"
              onClick={handleCreateClick}
              startIcon={<AddIcon />}
            >
              {t('dataTable.create')}
            </Button>
          )}
        </Stack>
      }
    >
      <Box sx={{ flex: 1, width: '100%' }}>
        {error ? (
          <Box sx={{ flexGrow: 1 }}>
            <Alert severity="error">{error.message}</Alert>
          </Box>
        ) : (
          <DataGrid
            rows={rowsState.rows}
            rowCount={rowsState.rowCount}
            columns={columns}
            pagination
            sortingMode="server"
            filterMode="server"
            paginationMode="server"
            paginationModel={paginationModel}
            onPaginationModelChange={handlePaginationModelChange}
            sortModel={sortModel}
            onSortModelChange={handleSortModelChange}
            filterModel={filterModel}
            onFilterModelChange={handleFilterModelChange}
            disableRowSelectionOnClick
            onRowClick={handleRowClick}
            loading={isLoading}
            initialState={initialState}
            pageSizeOptions={pageSizeOptions}
            localeText={{
              columnMenuUnsort: t("dataTable.unsort"),
              columnMenuFilter: t("dataTable.filter"),
              columnMenuHideColumn: t("dataTable.hideColumn"),
              columnMenuManageColumns: t("dataTable.manageColumns"),
              columnMenuSortDesc: t("dataTable.sortDesc"),
              columnMenuSortAsc: t("dataTable.sortAsc"),
              paginationRowsPerPage: t("dataTable.rowsPerPage"),
              toolbarExportCSV: t("dataTable.exportCsv")
            }}
            sx={{
              [`& .${gridClasses.columnHeader}, & .${gridClasses.cell}`]: {
                outline: 'transparent',
              },
              [`& .${gridClasses.columnHeader}:focus-within, & .${gridClasses.cell}:focus-within`]:
                {
                  outline: 'none',
                },
              [`& .${gridClasses.row}:hover`]: {
                cursor: enableRowClick ? 'pointer' : 'default',
              },
              '& .actions': {
                color: 'text.secondary',
              },
              '& .actions:hover': {
                color: 'text.primary',
              },
            }}
            slotProps={{
              loadingOverlay: {
                variant: 'circular-progress',
                noRowsVariant: 'circular-progress',
              },
              baseIconButton: {
                size: 'small',
              },
            }}
          />
        )}
      </Box>
    </PageContainer>
  );
}