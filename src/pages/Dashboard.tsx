'use client';

import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { useRouter } from 'next/router';
import { format, parseISO, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subMonths, subWeeks, subDays } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import {
  Pagination,
  PaginationContent,
  PaginationLink,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination";

interface Visit {
  id: string;
  storeId: string;
  employeeId: string;
  employeeName: string;
  purpose: string;
  visit_date: string;
  storeName: string;
  state: string;
  city: string;
  checkinDate: string | null;
  checkinTime: string | null;
  checkoutDate: string | null;
  checkoutTime: string | null;
}

interface StateCardProps {
  state: string;
  totalVisits: number;
  totalEmployees: number;
  onClick: () => void;
}

const StateCard = ({ state, totalVisits, totalEmployees, onClick }: StateCardProps) => {
  return (
    <div className="bg-white shadow-lg rounded-lg p-6 cursor-pointer transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105" onClick={onClick}>
      <h2 className="text-2xl font-bold mb-4">{state}</h2>
      <div className="flex justify-between">
        <p className="text-gray-600">Total Visits: <span className="font-bold">{totalVisits}</span></p>
        <p className="text-gray-600">Total Employees: <span className="font-bold">{totalEmployees}</span></p>
      </div>
    </div>
  );
};

interface KPICardProps {
  title: string;
  value: number;
}

const KPICard = ({ title, value }: KPICardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-4xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
};

interface EmployeeCardProps {
  employeeName: string;
  totalVisits: number;
  onClick: () => void;
}

const EmployeeCard = ({ employeeName, totalVisits, onClick }: EmployeeCardProps) => {
  return (
    <div className="bg-white shadow-lg rounded-lg p-6 cursor-pointer transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105" onClick={onClick}>
      <h2 className="text-2xl font-bold mb-4">{employeeName}</h2>
      <div className="flex justify-between">
        <p className="text-gray-600">Total Visits: <span className="font-bold">{totalVisits}</span></p>
      </div>
    </div>
  );
};

interface VisitsByPurposeChartProps {
  data: { purpose: string; visits: number }[];
}

const VisitsByPurposeChart = ({ data }: VisitsByPurposeChartProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Visits by Purpose</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="purpose" />
            <YAxis />
            <Tooltip contentStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.8)', border: 'none' }} />
            <Legend />
            <Bar dataKey="visits" fill="#1a202c" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

interface DateRangeDropdownProps {
  onDateRangeChange: (dateRange: string) => void;
}

const DateRangeDropdown = ({ onDateRangeChange }: DateRangeDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState('This Week');

  const options = [
    'Today',
    'Yesterday',
    'This Week',
    'Last Week',
    'This Month',
    'Last Month',
  ];

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleOptionClick = (option: string) => {
    setSelectedOption(option);
    setIsOpen(false);
    onDateRangeChange(option);
  };

  return (
    <div className="relative inline-block text-left">
      <div>
        <button
          type="button"
          className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          id="options-menu"
          aria-haspopup="true"
          aria-expanded={isOpen}
          onClick={toggleDropdown}
        >
          {selectedOption}
          <ChevronDownIcon className="-mr-1 ml-2 h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
          <div
            className="py-1"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="options-menu"
          >
            {options.map((option) => (
              <a
                key={option}
                href="#"
                className={`${option === selectedOption
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-700'
                  } block px-4 py-2 text-sm`}
                role="menuitem"
                onClick={() => handleOptionClick(option)}
              >
                {option}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

interface CityDropdownProps {
  cities: string[];
  onCityChange: (city: string | null) => void;
}

const CityDropdown = ({ cities, onCityChange }: CityDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleCityClick = (city: string | null) => {
    setSelectedCity(city);
    setIsOpen(false);
    onCityChange(city);
  };

  return (
    <div className="relative inline-block text-left">
      <div>
        <button
          type="button"
          className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          id="options-menu"
          aria-haspopup="true"
          aria-expanded={isOpen}
          onClick={toggleDropdown}
        >
          {selectedCity ? selectedCity : 'Filter by City'}
          <ChevronDownIcon className="-mr-1 ml-2 h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
          <div
            className="py-1"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="options-menu"
          >
            <a
              href="#"
              className={`${selectedCity === null
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-700'
                } block px-4 py-2 text-sm`}
              role="menuitem"
              onClick={() => handleCityClick(null)}
            >
              All Cities
            </a>
            {cities.map((city) => (
              <a
                key={city}
                href="#"
                className={`${city === selectedCity
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-700'
                  } block px-4 py-2 text-sm`}
                role="menuitem"
                onClick={() => handleCityClick(city)}
              >
                {city}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

interface VisitsTableProps {
  visits: Visit[];
  onViewDetails: (visitId: string) => void;
  selectedCity: string | null;
}

const VisitsTable = ({ visits, onViewDetails, selectedCity }: VisitsTableProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const visitsPerPage = 10;

  const filteredVisits = selectedCity ? visits.filter((visit) => visit.city === selectedCity) : visits;

  const indexOfLastVisit = currentPage * visitsPerPage;
  const indexOfFirstVisit = indexOfLastVisit - visitsPerPage;
  const currentVisits = filteredVisits.slice(indexOfFirstVisit, indexOfLastVisit);

  const totalPages = Math.ceil(filteredVisits.length / visitsPerPage);

  const goToPage = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const goToPreviousPage = () => {
    setCurrentPage((prevPage) => prevPage - 1);
  };

  const goToNextPage = () => {
    setCurrentPage((prevPage) => prevPage + 1);
  };

  const getOutcomeStatus = (visit: Visit): { emoji: React.ReactNode; status: string; color: string } => {
    if (visit.checkinDate && visit.checkinTime && visit.checkoutDate && visit.checkoutTime) {
      return { emoji: '✅', status: 'Completed', color: 'bg-purple-100 text-purple-800' };
    } else if (visit.checkoutDate && visit.checkoutTime) {
      return { emoji: '🚪', status: 'Checked Out', color: 'bg-orange-100 text-orange-800' };
    } else if (visit.checkinDate && visit.checkinTime) {
      return { emoji: '⏳', status: 'On Going', color: 'bg-green-100 text-green-800' };
    }
    return { emoji: '📝', status: 'Assigned', color: 'bg-blue-100 text-blue-800' };
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Visits</CardTitle>
      </CardHeader>
      <CardContent>
        <table className="w-full">
          <thead>
            <tr>
              <th className="px-4 py-2">Store</th>
              <th className="px-4 py-2">Employee</th>
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2">Purpose</th>
              <th className="px-4 py-2">City</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentVisits.map((visit) => {
              const { emoji, status, color } = getOutcomeStatus(visit);
              return (
                <tr key={visit.id}>
                  <td className="px-4 py-2">{visit.storeName}</td>
                  <td className="px-4 py-2">{visit.employeeName}</td>
                  <td className="px-4 py-2">{format(parseISO(visit.visit_date), 'MMM d, yyyy')}</td>
                  <td className="px-4 py-2">{visit.purpose}</td>
                  <td className="px-4 py-2">{visit.city}</td>
                  <td className={`px-4 py-2 ${color}`}>{emoji} {status}</td>
                  <td className="px-4 py-2">
                    <button
                      className="text-blue-500 hover:text-blue-700"
                      onClick={() => onViewDetails(visit.id)}
                    >
                      View
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <Pagination className="mt-4">
          <PaginationContent>
            <PaginationPrevious
              className={currentPage === 1 ? 'disabled' : ''}
              onClick={goToPreviousPage}
            />

            {Array.from({ length: totalPages }, (_, index) => (
              <PaginationItem key={index}>
                <PaginationLink
                  isActive={index + 1 === currentPage}
                  onClick={() => goToPage(index + 1)}
                >
                  {index + 1}
                </PaginationLink>
              </PaginationItem>
            ))}

            <PaginationNext
              className={currentPage === totalPages ? 'disabled' : ''}
              onClick={goToNextPage}
            />
          </PaginationContent>
        </Pagination>
      </CardContent>
    </Card>
  );
};

const Dashboard = () => {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState('This Week');
  const [isInitialRender, setIsInitialRender] = useState(true); 
  const token = useSelector((state: RootState) => state.auth.token);
  const router = useRouter();

  useEffect(() => {
    if (token) {
      fetchVisits();
    }
  }, [dateRange, selectedCity, token]);
  useEffect(() => {
    const handleRouteChange = () => {
      setSelectedState(null);
      setSelectedCity(null);
      setSelectedEmployee(null);
      setIsInitialRender(true);
    };

    router.events.on('routeChangeStart', handleRouteChange);

    return () => {
      router.events.off('routeChangeStart', handleRouteChange);
    };
  }, [router.events]);

  useEffect(() => {
    if (isInitialRender) {
      setIsInitialRender(false);
    }
  }, [isInitialRender]);

  const handleEmployeeClick = (employeeName: string) => {
    setSelectedEmployee(employeeName);
  };

  const handleCityChange = (city: string | null) => {
    setSelectedCity(city);
  };

  const fetchVisits = async () => {
    try {
      let startDate = '';
      let endDate = '';

      switch (dateRange) {
        case 'Today':
          startDate = format(new Date(), 'yyyy-MM-dd');
          endDate = format(new Date(), 'yyyy-MM-dd');
          break;
        case 'Yesterday':
          startDate = format(subDays(new Date(), 1), 'yyyy-MM-dd');
          endDate = format(subDays(new Date(), 1), 'yyyy-MM-dd');
          break;
        case 'This Week':
          startDate = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');
          endDate = format(endOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');
          break;
        case 'Last Week':
          startDate = format(startOfWeek(subWeeks(new Date(), 1), { weekStartsOn: 1 }), 'yyyy-MM-dd');
          endDate = format(endOfWeek(subWeeks(new Date(), 1), { weekStartsOn: 1 }), 'yyyy-MM-dd');
          break;
        case 'This Month':
          startDate = format(startOfMonth(new Date()), 'yyyy-MM-dd');
          endDate = format(endOfMonth(new Date()), 'yyyy-MM-dd');
          break;
        case 'Last Month':
          startDate = format(startOfMonth(subMonths(new Date(), 1)), 'yyyy-MM-dd');
          endDate = format(endOfMonth(subMonths(new Date(), 1)), 'yyyy-MM-dd');
          break;
        default:
          break;
      }

      const response = await fetch(
        `http://ec2-51-20-32-8.eu-north-1.compute.amazonaws.com:8081/visit/getByDateRange?start=${startDate}&end=${endDate}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error('Failed to fetch visits');
      }
      const data: Visit[] = await response.json();
      setVisits(data);
    } catch (error) {
      console.error('Error fetching visits:', error);
    }
  };

  const handleStateClick = (state: string) => {
    setSelectedState(state);
    setSelectedEmployee(null);
  };

  const handleEmployeeChange = (employeeName: string | null) => {
    setSelectedEmployee(employeeName === 'all' ? null : employeeName);
  };

  const handleDateRangeChange = (selectedDateRange: string) => {
    setDateRange(selectedDateRange);
  };

  const handleViewDetails = (visitId: string) => {
    router.push(`/VisitDetailPage/${visitId}`);
  };

  const states = Array.from(new Set(visits.map((visit) => visit.state)));
  const cities = Array.from(new Set(visits.map((visit) => visit.city)));

  const stateCards = Array.from(new Set(visits.map((visit) => visit.state))).map((state) => {
    const stateVisits = visits.filter((visit) => visit.state === state);
    const totalVisits = stateVisits.length;
    const totalEmployees = Array.from(new Set(stateVisits.map((visit) => visit.employeeId))).length;

    return (
      <StateCard
        key={state}
        state={state}
        totalVisits={totalVisits}
        totalEmployees={totalEmployees}
        onClick={() => handleStateClick(state)}
      />
    );
  });
  if (isInitialRender) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8">Sales Dashboard</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">{stateCards}</div>
      </div>
    );
  }
  if (selectedState) {
    const stateVisits = visits.filter((visit) => visit.state === selectedState);

    const employeeCards = Array.from(new Set(stateVisits.map((visit) => visit.employeeName))).map((employeeName) => {
      const employeeVisits = stateVisits.filter((visit) => visit.employeeName === employeeName);
      const totalVisits = employeeVisits.length;

      return (
        <EmployeeCard
          key={employeeName}
          employeeName={employeeName}
          totalVisits={totalVisits}
          onClick={() => handleEmployeeClick(employeeName)}
        />
      );
    });

    if (selectedEmployee) {
      const employeeVisits = stateVisits.filter((visit) => visit.employeeName === selectedEmployee);

      const totalVisits = employeeVisits.length;
      const completedVisits = employeeVisits.filter((visit) => visit.checkinDate && visit.checkinTime && visit.checkoutDate && visit.checkoutTime).length;
      const ongoingVisits = employeeVisits.filter((visit) => visit.checkinDate && visit.checkinTime && !visit.checkoutDate && !visit.checkoutTime).length;
      const assignedVisits = employeeVisits.filter((visit) => !visit.checkinDate && !visit.checkinTime).length;
      const visitsByPurpose = employeeVisits.reduce((acc: { [key: string]: number }, visit) => {
        if (!acc[visit.purpose]) {
          acc[visit.purpose] = 0;
        }
        acc[visit.purpose]++;
        return acc;
      }, {});

      const visitsByPurposeChartData = Object.entries(visitsByPurpose).map(([purpose, visits]) => ({
        purpose,
        visits: Number(visits),
      }));

      return (
        <div className="container mx-auto py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">{selectedEmployee}</h1>
            <Button
              variant="outline"
              onClick={() => setSelectedEmployee(null)}
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Back
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <KPICard title="Total Visits" value={totalVisits} />
            <KPICard title="Completed Visits" value={completedVisits} />
            <KPICard title="Ongoing Visits" value={ongoingVisits} />
            <KPICard title="Assigned Visits" value={assignedVisits} />
          </div>
          <div className="mb-8 flex gap-4">
            <DateRangeDropdown onDateRangeChange={handleDateRangeChange} />
            <CityDropdown cities={cities} onCityChange={handleCityChange} />
          </div>
          <div className="mb-8">
            <VisitsTable visits={employeeVisits} onViewDetails={handleViewDetails} selectedCity={selectedCity} />
          </div>
          <div className="mb-8 mt-12">
            <VisitsByPurposeChart data={visitsByPurposeChartData} />
          </div>
        </div>
      );
    }

    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">{selectedState}</h1>
          <Button
            variant="outline"
            onClick={() => setSelectedState(null)}
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">{employeeCards}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Sales Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">{stateCards}</div>
    </div>
  );
};

export default Dashboard;