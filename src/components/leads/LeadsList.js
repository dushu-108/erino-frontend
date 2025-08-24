import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { leadsAPI } from '../../services/api';

const LeadsList = () => {
  const [gridApi, setGridApi] = useState(null);
  const [rowData, setRowData] = useState([]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [pageSize, setPageSize] = useState(20);
  const [, setTotalRows] = useState(0);
  const [, setCurrentPage] = useState(1);

  // Column Definitions
  const [columnDefs] = useState([
    { field: 'first_name', headerName: 'First Name', filter: 'agTextColumnFilter' },
    { field: 'last_name', headerName: 'Last Name', filter: 'agTextColumnFilter' },
    { field: 'email', filter: 'agTextColumnFilter' },
    { field: 'company', filter: 'agTextColumnFilter' },
    { field: 'status', filter: 'agSetColumnFilter' },
    { field: 'source', filter: 'agSetColumnFilter' },
    { field: 'score', filter: 'agNumberColumnFilter' },
    { field: 'lead_value', headerName: 'Value', filter: 'agNumberColumnFilter' },
    { 
      field: 'created_at', 
      headerName: 'Created At',
      filter: 'agDateColumnFilter',
      valueFormatter: (params) => new Date(params.value).toLocaleDateString()
    },
  ]);

  // Fetch data from API
  const fetchData = useCallback(async (page = 1, limit = 20, filters = {}) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit,
        ...filters
      };

      const response = await leadsAPI.getLeads(params);
      const { data, total, page: currentPage, limit: currentLimit } = response.data;
      
      setRowData(data);
      setTotalRows(total);
      setCurrentPage(currentPage);
      setPageSize(currentLimit);
    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle grid ready
  const onGridReady = (params) => {
    setGridApi(params.api);
    fetchData();
  };

  // Handle pagination
  const onPaginationChanged = (event) => {
    if (gridApi) {
      const currentPage = gridApi.paginationGetCurrentPage() + 1;
      const filters = {}; // You can add filter logic here
      fetchData(currentPage, pageSize, filters);
    }
  };

  // Handle filter changes
  const onFilterChanged = (event) => {
    if (gridApi) {
      const filterModel = gridApi.getFilterModel();
      const filters = {};
      
      // Convert AG Grid filter model to our API format
      Object.keys(filterModel).forEach(key => {
        const filter = filterModel[key];
        if (filter.filterType === 'text') {
          filters[`${key}_contains`] = filter.filter;
        } else if (filter.filterType === 'set') {
          filters[`${key}_in`] = filter.values.join(',');
        } else if (filter.filterType === 'number') {
          if (filter.type === 'greaterThan') {
            filters[`${key}_gt`] = filter.filter;
          } else if (filter.type === 'lessThan') {
            filters[`${key}_lt`] = filter.filter;
          } else {
            filters[key] = filter.filter;
          }
        } else if (filter.filterType === 'date') {
          if (filter.type === 'equals') {
            filters[`${key}_on`] = filter.dateFrom;
          } else if (filter.type === 'lessThan') {
            filters[`${key}_before`] = filter.dateTo;
          } else if (filter.type === 'greaterThan') {
            filters[`${key}_after`] = filter.dateFrom;
          } else if (filter.type === 'inRange') {
            filters[`${key}_date_between`] = `${filter.dateFrom},${filter.dateTo}`;
          }
        }
      });
      
      fetchData(1, pageSize, filters);
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Leads</h1>
        <button 
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={() => navigate('/leads/new')}
        >
          Add Lead
        </button>
      </div>
      
      <div className="ag-theme-alpine" style={{ height: 'calc(100vh - 180px)', width: '100%' }}>
        <AgGridReact
          columnDefs={columnDefs}
          rowData={rowData}
          onGridReady={onGridReady}
          onFilterChanged={onFilterChanged}
          onPaginationChanged={onPaginationChanged}
          pagination={true}
          paginationPageSize={pageSize}
          paginationAutoPageSize={false}
          cacheBlockSize={pageSize}
          rowModelType={'clientSide'}
          defaultColDef={{
            sortable: true,
            resizable: true,
            filter: true,
            floatingFilter: true,
          }}
          domLayout="autoHeight"
          animateRows={true}
          suppressRowClickSelection={true}
          suppressCellFocus={true}
          suppressPaginationPanel={false}
          rowSelection={'single'}
          onRowDoubleClicked={(event) => {
            navigate(`/leads/edit/${event.data._id}`);
          }}
        />
        
        {loading && (
          <div className="mt-2 text-center text-gray-500">
            Loading...
          </div>
        )}
      </div>
    </div>
  );
};

export default LeadsList;
