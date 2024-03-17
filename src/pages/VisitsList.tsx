import { useEffect, useState } from 'react';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, MapPin } from 'lucide-react';
import { Checkbox } from "@/components/ui/checkbox";
import React from 'react';
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from 'next/router';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuCheckboxItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useSelector } from 'react-redux';
import { RootState } from '../store';


type ReactNode = React.ReactNode;

interface Visit {
  id: string;
  storeName: string;
  employeeName: string;
  visit_date: string;
  purpose: string;
  outcome: string;
  feedback?: string;
  location: string;
  checkinDate?: string | null;
  checkinTime?: string | null;
  checkoutDate?: string | null;
  checkoutTime?: string | null;
}

interface VisitCardProps {
  visit: Visit;
}

const VisitCard: React.FC<VisitCardProps> = ({ visit }) => {
  const { id, storeName, employeeName, visit_date, purpose, outcome, feedback } = visit;
  const router = useRouter();

  const avatarInitials = storeName
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase();

  const viewDetails = (visitId: string) => {
    router.push(`/VisitDetailPage/${visitId}`);
  };

  const getOutcomeStatus = (visit: Visit): { emoji: ReactNode; status: string; color: string } => {
    if (
      visit.checkinDate &&
      visit.checkinTime &&
      visit.checkoutDate &&
      visit.checkoutTime
    ) {
      return { emoji: '✅', status: 'Completed', color: 'bg-purple-100 text-purple-800' };
    } else if (visit.checkoutDate && visit.checkoutTime) {
      return { emoji: '🚪', status: 'Checked Out', color: 'bg-orange-100 text-orange-800' };
    } else if (visit.checkinDate && visit.checkinTime) {
      return { emoji: '✅', status: 'Checked In', color: 'bg-green-100 text-green-800' };
    }
    return { emoji: '📝', status: 'Assigned', color: 'bg-blue-100 text-blue-800' };
  };

  const { emoji, status, color } = getOutcomeStatus(visit);

  return (
    <Card className="bg-white shadow-md hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarFallback>{avatarInitials}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-xl font-semibold">{storeName}</h3>
              <p className="text-sm text-gray-500">{employeeName}</p>
            </div>
          </div>
          <Badge className={`${color} px-3 py-1 rounded-full font-semibold`}>
            {emoji} {status}
          </Badge>
        </div>
        <Separator className="my-4" />
        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <Calendar size={16} />
            <span>{visit_date}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock size={16} />
            <span>{visit_date}</span>
          </div>
          <div className="col-span-2 flex items-center space-x-2">
            <MapPin size={16} />
            <span>{storeName}</span>
          </div>
        </div>
        <p className="text-gray-600 mt-4">
          <strong>Purpose:</strong> {purpose}
        </p>
      </CardContent>
      <CardFooter className="flex justify-between items-center p-6">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Button
                variant="outline"
                className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
                onClick={() => viewDetails(id)}
              >
                View Details
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-sm">
                View full details of the visit, including notes and action items.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardFooter>
    </Card>
  );
};

interface VisitsTableProps {
  visits: Visit[];
  selectedColumns: string[];
  sortColumn: string | null;
  sortDirection: 'asc' | 'desc';
  itemsPerPage: number;
  currentPage: number;
  onSort: (column: string) => void;
  onSelectAllRows: (checked: boolean) => void;
  selectedRows: string[];
  onSelectRow: (visitId: string) => void;
  onBulkAction: (action: string) => void;
}

const VisitsTable: React.FC<VisitsTableProps> = ({
  visits,
  selectedColumns,
  sortColumn,
  sortDirection,
  itemsPerPage,
  currentPage,
  onSort,
  onSelectAllRows,
  selectedRows,
  onSelectRow,
  onBulkAction,
}) => {
  const router = useRouter();

  const viewDetails = (visitId: string) => {
    router.push(`/VisitDetailPage/${visitId}`);
  };

  const getOutcomeStatus = (visit: Visit): { emoji: ReactNode; status: string; color: string } => {
    if (
      visit.checkinDate &&
      visit.checkinTime &&
      visit.checkoutDate &&
      visit.checkoutTime
    ) {
      return { emoji: '✅', status: 'Completed', color: 'bg-purple-100 text-purple-800' };
    } else if (visit.checkoutDate && visit.checkoutTime) {
      return { emoji: '🚪', status: 'Checked Out', color: 'bg-orange-100 text-orange-800' };
    } else if (visit.checkinDate && visit.checkinTime) {
      return { emoji: '✅', status: 'Checked In', color: 'bg-green-100 text-green-800' };
    }
    return { emoji: '📝', status: 'Assigned', color: 'bg-blue-100 text-blue-800' };
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const displayedVisits = visits.slice(startIndex, endIndex);

  return (
    <table className="w-full text-left table-auto">
      <thead>
        <tr className="bg-gray-100">
          <th className="px-4 py-2">
            <Checkbox
              checked={selectedRows.length === visits.length}
              onCheckedChange={onSelectAllRows}
            />
          </th>
          {selectedColumns.includes('storeName') && (
            <th className="px-4 py-2 cursor-pointer" onClick={() => onSort('storeName')}>
              Customer Name {sortColumn === 'storeName' && (sortDirection === 'asc' ? '↑' : '↓')}
            </th>
          )}
          {selectedColumns.includes('employeeName') && (
            <th className="px-4 py-2 cursor-pointer" onClick={() => onSort('employeeName')}>
              Executive {sortColumn === 'employeeName' && (sortDirection === 'asc' ? '↑' : '↓')}
            </th>
          )}
          {selectedColumns.includes('visit_date') && (
            <th className="px-4 py-2 cursor-pointer" onClick={() => onSort('visit_date')}>
              Date {sortColumn === 'visit_date' && (sortDirection === 'asc' ? '↑' : '↓')}
            </th>
          )}
          {selectedColumns.includes('location') && (
            <th className="px-4 py-2 cursor-pointer" onClick={() => onSort('location')}>
              Location {sortColumn === 'location' && (sortDirection === 'asc' ? '↑' : '↓')}
            </th>
          )}
          {selectedColumns.includes('purpose') && (
            <th className="px-4 py-2 cursor-pointer" onClick={() => onSort('purpose')}>
              Purpose {sortColumn === 'purpose' && (sortDirection === 'asc' ? '↑' : '↓')}
            </th>
          )}
          {selectedColumns.includes('outcome') && (
            <th className="px-4 py-2 cursor-pointer" onClick={() => onSort('outcome')}>
              Status {sortColumn === 'outcome' && (sortDirection === 'asc' ? '↑' : '↓')}
            </th>
          )}
          <th className="px-4 py-2">Actions</th>
        </tr>
      </thead>
      <tbody>
        {displayedVisits.map((visit) => {
          const { emoji, status, color } = getOutcomeStatus(visit);

          return (
            <tr key={visit.id} className="border-b">
              <td className="px-4 py-2">
                <Checkbox
                  checked={selectedRows.includes(visit.id)}
                  onCheckedChange={() => onSelectRow(visit.id)}
                />
              </td>
              {selectedColumns.includes('storeName') && (
                <td className="px-4 py-2">{visit.storeName}</td>
              )}
              {selectedColumns.includes('employeeName') && (
                <td className="px-4 py-2">{visit.employeeName}</td>
              )}
              {selectedColumns.includes('visit_date') && (
                <td className="px-4 py-2">{visit.visit_date}</td>
              )}
              {selectedColumns.includes('location') && (
                <td className="px-4 py-2">{visit.location}</td>
              )}
              {selectedColumns.includes('purpose') && (
                <td className="px-4 py-2">{visit.purpose}</td>
              )}
              {selectedColumns.includes('outcome') && (
                <td className="px-4 py-2">
                  <Badge className={`${color} px-3 py-1 rounded-full font-semibold`}>
                    {emoji} {status}
                  </Badge>
                </td>
              )}
              <td className="px-4 py-2">
                <Button
                  variant="outline"
                  className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
                  onClick={() => viewDetails(visit.id)}
                >
                  View Details
                </Button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

interface VisitsFilterProps {
  onFilter: (filters: { storeName: string; employeeName: string; purpose: string | null }) => void;
}

const VisitsFilter: React.FC<VisitsFilterProps> = ({ onFilter }) => {
  const [storeName, setStoreName] = useState('');
  const [employeeName, setEmployeeName] = useState('');
  const [purpose, setPurpose] = useState<string | null>(null);

  const handleFilter = () => {
    onFilter({ storeName, employeeName, purpose });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Filter Visits</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Input
            type="text"
            placeholder="Customer Name"
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
          />
          <Input
            type="text"
            placeholder="Sales Executive Name"
            value={employeeName}
            onChange={(e) => setEmployeeName(e.target.value)}
          />
          <Select onValueChange={(value) => setPurpose(value === '' ? null : value)}>
            <SelectTrigger>
              <SelectValue placeholder="Purpose" />
            </SelectTrigger>
            <SelectContent>
              {purpose === null && <SelectItem value="">All</SelectItem>}
              <SelectItem value="Sales Pitch">Sales Pitch</SelectItem>
              <SelectItem value="Follow-up">Follow-up</SelectItem>
              <SelectItem value="Troubleshooting">Troubleshooting</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleFilter} className="bg-blue-500 hover:bg-blue-600 text-white">
            Apply Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

interface Visit {
  id: string;
  storeName: string;
  employeeName: string;
  visit_date: string;
  purpose: string;
  outcome: string;
  feedback?: string;
  checkinDate?: string | null;
  checkinTime?: string | null;
  checkoutDate?: string | null;
  checkoutTime?: string | null;
}

const VisitsList: React.FC = () => {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [filteredVisits, setFilteredVisits] = useState<Visit[]>([]);
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const token = useSelector((state: RootState) => state.auth.token);

  useEffect(() => {
    const fetchVisits = async () => {
      try {
        const response = await axios.get('http://ec2-13-49-190-97.eu-north-1.compute.amazonaws.com:8081/visit/getAll', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setVisits(response.data);
        setFilteredVisits(response.data);
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

  const handleFilter = (filters: { storeName: string; employeeName: string; purpose: string | null }) => {
    const { storeName, employeeName, purpose } = filters;

    const filtered = visits.filter((visit) => {
      const customerMatch = visit.storeName.toLowerCase().includes(storeName.toLowerCase());
      const executiveMatch = visit.employeeName.toLowerCase().includes(employeeName.toLowerCase());
      const purposeMatch = purpose ? visit.purpose === purpose : true;

      return customerMatch && executiveMatch && purposeMatch;
    });

    setFilteredVisits(filtered);
  };

  const [selectedColumns, setSelectedColumns] = useState([
    'storeName',
    'employeeName',
    'visit_date',
    'location',
    'purpose',
    'outcome',
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

  const sortedVisits = [...filteredVisits].sort((a, b) => {
    if (sortColumn) {
      const valueA = a[sortColumn as keyof Visit];
      const valueB = b[sortColumn as keyof Visit];
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return sortDirection === 'asc' ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
      } else if (typeof valueA === 'number' && typeof valueB === 'number') {
        return sortDirection === 'asc' ? valueA - valueB : valueB - valueA;
      }
    }
    return 0;
  });



  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Customer Visits</h2>


      <div className="mb-8 flex justify-end space-x-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">Columns</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {['storeName', 'employeeName', 'visit_date', 'location', 'purpose', 'outcome'].map(
              (column) => (
                <DropdownMenuCheckboxItem
                  key={column}
                  checked={selectedColumns.includes(column)}
                  onCheckedChange={() => {
                    if (selectedColumns.includes(column)) {
                      setSelectedColumns(selectedColumns.filter((col) => col !== column));
                    } else {
                      setSelectedColumns([...selectedColumns, column]);
                    }
                  }}
                >
                  {column}
                </DropdownMenuCheckboxItem>
              )
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">Bulk Actions</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onSelect={() => handleBulkAction('delete')}>Delete</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => handleBulkAction('export')}>Export</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button onClick={toggleViewMode}>
          {viewMode === 'card' ? 'Switch to Table View' : 'Switch to Card View'}
        </Button>
      </div>

      {viewMode === 'card' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {sortedVisits.slice(0, itemsPerPage).map((visit) => (
            <VisitCard key={visit.id} visit={visit} />
          ))}
        </div>
      ) : (
        <VisitsTable
          visits={sortedVisits}
          selectedColumns={selectedColumns}
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          itemsPerPage={itemsPerPage}
          currentPage={currentPage}
          onSort={handleSort}
          onSelectAllRows={handleSelectAllRows}
          selectedRows={selectedRows}
          onSelectRow={handleSelectRow}
          onBulkAction={handleBulkAction}
        />
      )}

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
      </div>
    </div>
  );
};

export default VisitsList;