import { useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { useQuery, QueryClient, QueryClientProvider } from 'react-query';
import { RootState } from '../store';
import VisitsTable from '../components/VisitList/VisitsTable';
import VisitsFilter from '../components/VisitList/VisitsFilter';
import { Visit } from '../components/VisitList/types';
import { format, subDays } from "date-fns";
import { stringify } from 'csv-stringify';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pagination, PaginationContent, PaginationLink, PaginationItem, PaginationPrevious, PaginationNext } from "@/components/ui/pagination";

// Create a QueryClient instance
const queryClient = new QueryClient();

const fetchVisits = async (
  token: string | null,
  startDate: Date | undefined,
  endDate: Date | undefined,
  purpose: string,
  storeName: string,
  employeeName: string,
  sortColumn: string | null,
  sortDirection: 'asc' | 'desc',
  currentPage: number,
  itemsPerPage: number
) => {
  const formattedStartDate = startDate ? format(startDate, 'yyyy-MM-dd') : '';
  const formattedEndDate = endDate ? format(endDate, 'yyyy-MM-dd') : '';
  let url = `http://ec2-51-20-32-8.eu-north-1.compute.amazonaws.com:8081/visit/getByDateSorted?startDate=${formattedStartDate}&endDate=${formattedEndDate}&page=${currentPage - 1}&size=${itemsPerPage}`;

  if (sortColumn) {
    url += `&sort=${sortColumn},${sortDirection}`;
  }

  if (purpose) {
    url += `&purpose=${encodeURIComponent(purpose)}`;
  }
  if (storeName) {
    url += `&storeName=${encodeURIComponent(storeName)}`;
  }
  if (employeeName) {
    url += `&employeeName=${encodeURIComponent(employeeName)}`;
  }

  const headers: { Authorization?: string } = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await axios.get(url, {
    headers,
  });
  return response.data;
};

const VisitsList: React.FC = () => {
  const [viewMode, setViewMode] = useState<'card' | 'table'>('table');
  const token = useSelector((state: RootState) => state.auth.token);
  const [startDate, setStartDate] = useState<Date | undefined>(subDays(new Date(), 2)); // Default start date is 2 days ago
  const [endDate, setEndDate] = useState<Date | undefined>(new Date()); // Default end date is today
  const [purpose, setPurpose] = useState<string>('');
  const [storeName, setStoreName] = useState<string>('');
  const [employeeName, setEmployeeName] = useState<string>('');
  const [sortColumn, setSortColumn] = useState<string | null>('id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const { data, error, isLoading } = useQuery(
    [
      'visits',
      token,
      startDate,
      endDate,
      purpose,
      storeName,
      employeeName,
      sortColumn,
      sortDirection,
      currentPage,
      itemsPerPage
    ],
    () => fetchVisits(
      token,
      startDate,
      endDate,
      purpose,
      storeName,
      employeeName,
      sortColumn,
      sortDirection,
      currentPage,
      itemsPerPage
    ),
    {
      keepPreviousData: true,
    }
  );

  const visits = data?.content || [];
  const totalPages = data ? data.totalPages : 1;

  const columnMapping: { [key: string]: string } = {
    'Customer Name': 'storeName',
    'Executive': 'employeeName',
    'Date': 'visit_date',
    'Status': 'outcome',
    'Purpose': 'purpose',
    'Visit Start': 'checkinDate',
    'Visit End': 'checkoutDate',
    'Intent': 'intent',
    'Last Updated': 'updatedAt',
    'Phone Number': 'storePrimaryContact',
    'District': 'district',
    'Sub District': 'subDistrict',
  };

  const handleSort = (column: string) => {
    const backendColumn = columnMapping[column] || column;
    if (backendColumn === sortColumn) {
      setSortDirection((prevDirection) => (prevDirection === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(backendColumn);
      setSortDirection('asc');
    }
  };

  const handleFilter = (filters: { storeName: string; employeeName: string; purpose: string }, clearFilters: boolean) => {
    const { storeName, employeeName, purpose } = filters;
    setStoreName(storeName);
    setEmployeeName(employeeName);
    setPurpose(purpose);

    setCurrentPage(1); // Reset to the first page when filters change
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (value: string) => {
    const newValue = parseInt(value, 10);
    if (!isNaN(newValue)) {
      setItemsPerPage(newValue);
      setCurrentPage(1);
    }
  };

  const handleExport = () => {
    const headers = selectedColumns.map((column) => {
      switch (column) {
        case 'storeName':
          return 'Customer Name';
        case 'employeeName':
          return 'Executive';
        case 'visit_date':
          return 'Date';
        case 'outcome':
          return 'Status';
        case 'purpose':
          return 'Purpose';
        case 'visitStart':
          return 'Visit Start';
        case 'visitEnd':
          return 'Visit End';
        case 'intent':
          return 'Intent';
        case 'storePrimaryContact': // Added
          return 'Phone Number';
        case 'district': // Added
          return 'District';
        case 'subDistrict': // Added
          return 'Sub District';
        default:
          return column;
      }
    });

    const data = visits.map((visit: Visit) => {
      const row: any = {};
      selectedColumns.forEach((column) => {
        switch (column) {
          case 'visitStart':
            row[column] = formatDateTime(visit.checkinDate, visit.checkinTime);
            break;
          case 'visitEnd':
            row[column] = formatDateTime(visit.checkoutDate, visit.checkoutTime);
            break;
          case 'storePrimaryContact': // Added
            row[column] = visit.storePrimaryContact;
            break;
          case 'district': // Added
            row[column] = visit.district;
            break;
          case 'subDistrict': // Added
            row[column] = visit.subDistrict;
            break;
          default:
            row[column] = visit[column as keyof Visit];
        }
      });
      return Object.values(row);
    });

    stringify(data, { header: true, columns: headers }, (err, output) => {
      if (err) {
        console.error('Error converting data to CSV:', err);
        return;
      }
      const blob = new Blob([output], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'visits.csv';
      link.click();
    });
  };

  const handleColumnSelect = (column: string) => {
    if (selectedColumns.includes(column)) {
      setSelectedColumns(selectedColumns.filter((col) => col !== column));
    } else {
      setSelectedColumns([...selectedColumns, column]);
    }
  };

  const [selectedColumns, setSelectedColumns] = useState([
    'storeName',
    'employeeName',
    'visit_date',
    'purpose',
    'outcome',
    'visitStart',
    'visitEnd',
    'intent',
    'city',
    'state',
    'storePrimaryContact', // Added
    'district', // Added
    'subDistrict', // Added
  ]);

  const formatDateTime = (date: string | null | undefined, time: string | null | undefined) => {
    if (date && time) {
      const [hours, minutes] = time.split(':');
      const formattedTime = format(
        new Date(`${date}T${hours}:${minutes}`),
        'dd MMM h:mm a'
      );
      return formattedTime;
    }
    return '';
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error fetching visits: {(error as Error).message}</div>;
  }

  const renderPagination = () => {
    const pageNumbers = [];
    const displayPages = 5; // Show first 5 pages
    const groupSize = 10; // Show 10 pages at a time before showing "..."

    let startPage = Math.max(currentPage - Math.floor(displayPages / 2), 1);
    let endPage = startPage + displayPages - 1;

    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(endPage - displayPages + 1, 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <Pagination>
        <PaginationContent>
          {currentPage !== 1 && (
            <PaginationPrevious
              onClick={() => handlePageChange(currentPage - 1)}
            />
          )}
          {startPage > 1 && (
            <>
              <PaginationItem>
                <PaginationLink onClick={() => handlePageChange(1)}>1</PaginationLink>
              </PaginationItem>
              {startPage > 2 && (
                <PaginationItem>
                  <PaginationLink>...</PaginationLink>
                </PaginationItem>
              )}
            </>
          )}
          {pageNumbers.map((page) => (
            <PaginationItem key={page}>
              <PaginationLink
                isActive={page === currentPage}
                onClick={() => handlePageChange(page)}
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          ))}
          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && (
                <PaginationItem>
                  <PaginationLink>...</PaginationLink>
                </PaginationItem>
              )}
              <PaginationItem>
                <PaginationLink onClick={() => handlePageChange(totalPages)}>{totalPages}</PaginationLink>
              </PaginationItem>
            </>
          )}
          {currentPage !== totalPages && (
            <PaginationNext
              onClick={() => handlePageChange(currentPage + 1)}
            />
          )}
        </PaginationContent>
      </Pagination>
    );
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Visits List</h2>

      <VisitsFilter
        onFilter={handleFilter}
        onColumnSelect={handleColumnSelect}
        onExport={handleExport}
        selectedColumns={selectedColumns}
        viewMode={viewMode}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        purpose={purpose}
        setPurpose={setPurpose}
        storeName={storeName}
        setStoreName={setStoreName}
        employeeName={employeeName}
        setEmployeeName={setEmployeeName}
      />

      <br />
      <VisitsTable
        visits={visits}
        selectedColumns={selectedColumns}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        onSort={handleSort}
        onBulkAction={() => { }}
      />

      <div className="mt-8 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <span>Items per page:</span>
          <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {renderPagination()}
      </div>
    </div>
  );
};

const App: React.FC = () => (
  <QueryClientProvider client={queryClient}>
    <VisitsList />
  </QueryClientProvider>
);

export default App;