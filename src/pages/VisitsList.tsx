// VisitsList.tsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuCheckboxItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
//import VisitCard from '../components/VisitList/VisitCard';
import VisitsTable from '../components/VisitList/VisitsTable';
import VisitsFilter from '../components/VisitList/VisitsFilter';
import { Visit } from '../components/VisitList/types';
import { format } from "date-fns";
import { stringify } from 'csv-stringify';
import { Pagination, PaginationContent, PaginationLink, PaginationItem, PaginationPrevious, PaginationNext, PaginationEllipsis } from "@/components/ui/pagination";

const VisitsList: React.FC = () => {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [filteredVisits, setFilteredVisits] = useState<Visit[]>([]);
  const [viewMode, setViewMode] = useState<'card' | 'table'>('table');
  const token = useSelector((state: RootState) => state.auth.token);
  const [purposes, setPurposes] = useState<string[]>([]);

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

  useEffect(() => {
    const fetchVisits = async () => {
      try {
        const response = await axios.get('http://ec2-51-20-32-8.eu-north-1.compute.amazonaws.com:8081/visit/getAll', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setVisits(response.data);
        setFilteredVisits(response.data);

        // Extract unique purposes from the visits, excluding empty values
        const uniquePurposes = Array.from(new Set(response.data.map((visit: Visit) => visit.purpose))).filter(Boolean) as string[];
        setPurposes(uniquePurposes);
      } catch (error) {
        console.error('Error fetching visits:', error);
      }
    };

    if (token) {
      fetchVisits();
    }
  }, [token]);

  const toggleViewMode = () => {
    setViewMode((prevMode) => (prevMode === 'card' ? 'table' : 'card'));
  };

  const handleFilter = (filters: { storeName: string; employeeName: string; purpose: string }) => {
    const { storeName, employeeName, purpose } = filters;

    let filtered = visits;

    if (storeName) {
      filtered = filtered.filter((visit) =>
        visit.storeName.toLowerCase().includes(storeName.toLowerCase())
      );
    }

    if (employeeName) {
      filtered = filtered.filter((visit) =>
        visit.employeeName.toLowerCase().includes(employeeName.toLowerCase())
      );
    }

    if (purpose !== 'all') {
      filtered = filtered.filter((visit) => visit.purpose === purpose);
    }

    setFilteredVisits(filtered);
    setCurrentPage(1); // Reset to the first page when filters change
  };

  const [selectedColumns, setSelectedColumns] = useState([
    'storeName',
    'employeeName',
    'visit_date',
    'location',
    'purpose',
    'outcome',
    'visitStart',
    'visitEnd',
    'intent',
    'city',
    'state',
  ]);

  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  const handleSort = (column: string) => {
    if (column === sortColumn) {
      setSortDirection((prevDirection) => (prevDirection === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const handleSelectAllRows = (checked: boolean) => {
    if (checked) {
      setSelectedRows(filteredVisits.map((visit) => visit.id));
    } else {
      setSelectedRows([]);
    }
  };

  const handleSelectRow = (visitId: string) => {
    if (selectedRows.includes(visitId)) {
      setSelectedRows(selectedRows.filter((id) => id !== visitId));
    } else {
      setSelectedRows([...selectedRows, visitId]);
    }
  };

  const handleBulkAction = (action: string) => {
    // Implement the logic for bulk actions
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
        case 'location':
          return 'Location';
        case 'purpose':
          return 'Purpose';
        case 'visitStart':
          return 'Visit Start';
        case 'visitEnd':
          return 'Visit End';
        case 'intent':
          return 'Intent';
        default:
          return column;
      }
    });

    const data = sortedVisits.map((visit) => {
      const row: any = {};
      selectedColumns.forEach((column) => {
        switch (column) {
          case 'visitStart':
            row[column] = formatDateTime(visit.checkinDate, visit.checkinTime);
            break;
          case 'visitEnd':
            row[column] = formatDateTime(visit.checkoutDate, visit.checkoutTime);
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

  // Sort the visits array based on the "visit_date" column in descending order
  const sortedVisits = [...filteredVisits].sort((a, b) => {
    const aDate = new Date(a.visit_date);
    const bDate = new Date(b.visit_date);
    return bDate.getTime() - aDate.getTime();
  });

  const handleColumnSelect = (column: string) => {
    if (selectedColumns.includes(column)) {
      setSelectedColumns(selectedColumns.filter((col) => col !== column));
    } else {
      setSelectedColumns([...selectedColumns, column]);
    }
  };

  const totalPages = Math.ceil(sortedVisits.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentVisits = sortedVisits.slice(startIndex, endIndex);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Customer Visits</h2>

      <VisitsFilter
        onFilter={handleFilter}
        onColumnSelect={handleColumnSelect}
        onExport={handleExport}
        selectedColumns={selectedColumns}
        viewMode={viewMode}
        purposes={purposes}
      />

      <br />
      <VisitsTable
        visits={currentVisits}
        selectedColumns={selectedColumns}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        onSort={handleSort}
        onBulkAction={handleBulkAction}
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

        <Pagination>
          <PaginationContent>
            {currentPage !== 1 && (
              <PaginationPrevious
                onClick={() => handlePageChange(currentPage - 1)}
              />
            )}
            {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  isActive={page === currentPage}
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}
            {currentPage !== totalPages && (
              <PaginationNext
                onClick={() => handlePageChange(currentPage + 1)}
              />
            )}
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
};

export default VisitsList;