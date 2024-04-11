'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, parseISO } from 'date-fns';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import * as React from "react";
import { useRouter } from 'next/router';
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
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
  id: string; // Add the 'id' property
  storeId: string;
  employeeId: string;
  employeeName: string;
  purpose: string;
  visit_date: string;
  storeName: string;
}

const Dashboard = () => {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const token = useSelector((state: RootState) => state.auth.token);
  const router = useRouter();
  console.log(token)

  useEffect(() => {
    if (token) {
      fetchVisits();
    }
  }, [startDate, endDate, token]);
  const handleViewDetails = (visitId: string) => {
    router.push(`/VisitDetailPage/${visitId}`);
  };
  const fetchVisits = async () => {
    try {
      const response = await fetch(
        // `http://ec2-13-49-190-97.eu-north-1.compute.amazonaws.com:8081/visit/getByDateRange?start=${startDate}&end=${endDate}`,
        `http://ec2-13-49-190-97.eu-north-1.compute.amazonaws.com:8081/visit/getAll`,
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

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Sales Dashboard</h1>
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
                    <th className="px-4 py-2">Store</th>
                    <th className="px-4 py-2">Employee</th>
                    <th className="px-4 py-2">Date</th>
                    <th className="px-4 py-2">Purpose</th>
                    <th className="px-4 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(visits) &&
                    visits.slice(0, 10).map((visit, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2">{visit.storeName}</td>
                        <td className="px-4 py-2">{visit.employeeName}</td>
                        <td className="px-4 py-2">{formatDate(visit.visit_date)}</td>
                        <td className="px-4 py-2">{visit.purpose}</td>
                        <td className="px-4 py-2">
                          <DropdownMenu>
                            <DropdownMenuTrigger>
                              <ChevronDownIcon className="w-5 h-5 text-gray-500 hover:text-gray-700" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem onClick={() => handleViewDetails(visit.id.toString())}>
                                View Details
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
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