'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, parseISO, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subMonths, subWeeks, subDays } from 'date-fns';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import * as React from "react";
import { useRouter } from 'next/router';
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";
import { ChevronDownIcon } from '@heroicons/react/24/outline';

const Tabs = TabsPrimitive.Root;

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground",
      className
    )}
    {...props}
  />
));

TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow",
      className
    )}
    {...props}
  />
));

TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    )}
    {...props}
  />
));

TabsContent.displayName = TabsPrimitive.Content.displayName;

interface Visit {
  id: string;
  storeId: string;
  employeeId: string;
  employeeName: string;
  purpose: string;
  visit_date: string;
  storeName: string;
  [key: string]: string | number; // Add an index signature to allow accessing properties dynamically
}

const DateRangeDropdown = ({ onDateRangeChange }: { onDateRangeChange: (dateRange: string) => void }) => {
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

const Dashboard = () => {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [dateRange, setDateRange] = useState('This Week');
  const token = useSelector((state: RootState) => state.auth.token);
  const router = useRouter();
  const [sortColumn, setSortColumn] = useState('visit_date');
  const [sortOrder, setSortOrder] = useState('desc');
  console.log(token)

  useEffect(() => {
    if (token) {
      fetchVisits();
    }
  }, [dateRange, token]);

  const handleViewDetails = (visitId: string) => {
    router.push(`/VisitDetailPage/${visitId}`);
  };
  const handleSort = (column: string) => {
    if (column === sortColumn) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortOrder('asc');
    }
  };
  const getSortIcon = (column: string) => {
    if (column === sortColumn) {
      return sortOrder === 'asc' ? '▲' : '▼';
    }
    return '';
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

  const handleDateRangeChange = (selectedDateRange: string) => {
    setDateRange(selectedDateRange);
  };

  const formatDate = (dateString: string) => {
    return format(parseISO(dateString), 'MMM d, yyyy');
  };

  // Calculate total visits
  const totalVisits = visits.length;

  // Calculate unique stores visited
  const uniqueStoresVisited = Array.from(new Set(visits.map((visit) => visit.storeId))).length;

  // Calculate average visits per store
  const averageVisitsPerStore = totalVisits / uniqueStoresVisited;

  // Calculate total employees
  const totalEmployees = Array.from(new Set(visits.map((visit) => visit.employeeId))).length;

  // Calculate visits by employee
  const visitsByEmployee = visits.reduce((acc: Record<string, number>, visit) => {
    if (!acc[visit.employeeName]) {
      acc[visit.employeeName] = 0;
    }
    acc[visit.employeeName]++;
    return acc;
  }, {});

  // Calculate visits by purpose
  const visitsByPurpose = visits.reduce((acc: Record<string, number>, visit) => {
    if (!acc[visit.purpose]) {
      acc[visit.purpose] = 0;
    }
    acc[visit.purpose]++;
    return acc;
  }, {});

  // Prepare data for the visits by employee chart
  const visitsByEmployeeChartData = Object.entries(visitsByEmployee).map(([name, value]) => ({
    name,
    visits: value,
  }));

  // Prepare data for the visits by purpose chart
  const visitsByPurposeChartData = Object.entries(visitsByPurpose).map(([purpose, value]) => ({
    name: purpose,
    visits: value,
  }));

  // Sort the visits data in descending order based on the visit date
  const sortedVisits = [...visits].sort((a, b) => {
    if (sortColumn === 'visit_date') {
      return sortOrder === 'asc'
        ? new Date(a.visit_date).getTime() - new Date(b.visit_date).getTime()
        : new Date(b.visit_date).getTime() - new Date(a.visit_date).getTime();
    } else {
      return sortOrder === 'asc'
        ? String(a[sortColumn]).localeCompare(String(b[sortColumn]))
        : String(b[sortColumn]).localeCompare(String(a[sortColumn]));
    }
  });

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Sales Dashboard</h1>
        <DateRangeDropdown onDateRangeChange={handleDateRangeChange} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Total Visits</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{totalVisits}</p>
            <p className="text-gray-500">Total visits in the selected date range</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Unique Stores Visited</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{uniqueStoresVisited}</p>
            <p className="text-gray-500">Number of unique stores visited</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Average Visits per Store</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{averageVisitsPerStore.toFixed(2)}</p>
            <p className="text-gray-500">Average number of visits per store</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Employees</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{totalEmployees}</p>
            <p className="text-gray-500">Number of employees involved in visits</p>
          </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Visits by Employee</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={visitsByEmployeeChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.8)', border: 'none' }} />
                <Legend />
                <Bar dataKey="visits" fill="#1a202c" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Visits by Purpose</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={visitsByPurposeChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.8)', border: 'none' }} />
                <Legend />
                <Bar dataKey="visits" fill="#2d3748" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Recent Visits</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="table">
            <TabsList>
              <TabsTrigger value="table">Table</TabsTrigger>
            </TabsList>
            <TabsContent value="table">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort('storeName')}>
                      Store <span className="text-xs">{getSortIcon('storeName')}</span>
                    </th>
                    <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort('employeeName')}>
                      Employee <span className="text-xs">{getSortIcon('employeeName')}</span>
                    </th>
                    <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort('visit_date')}>
                      Date <span className="text-xs">{getSortIcon('visit_date')}</span>
                    </th>
                    <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort('purpose')}>
                      Purpose <span className="text-xs">{getSortIcon('purpose')}</span>
                    </th>
                    <th className="px-4 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(sortedVisits) &&
                    sortedVisits.slice(0, 10).map((visit, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2">{visit.storeName}</td>
                        <td className="px-4 py-2">{visit.employeeName}</td>
                        <td className="px-4 py-2">{formatDate(visit.visit_date)}</td>
                        <td className="px-4 py-2">{visit.purpose}</td>
                        <td className="px-4 py-2">
                          <button
                            className="text-blue-500 hover:text-blue-700"
                            onClick={() => handleViewDetails(visit.id.toString())}
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;