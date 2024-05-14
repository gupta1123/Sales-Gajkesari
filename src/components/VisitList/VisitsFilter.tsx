import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuCheckboxItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Calendar } from "@/components/ui/calendar"; // Import the Calendar component
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"; // Import Popover components
import { format } from "date-fns"; // Import the format function from date-fns

interface VisitsFilterProps {
    onFilter: (filters: { storeName: string; employeeName: string; purpose: string }, clearFilters: boolean) => void;
    onColumnSelect: (column: string) => void;
    onExport: () => void;
    selectedColumns: string[];
    viewMode: 'card' | 'table';
    startDate: Date | undefined;
    setStartDate: (date: Date | undefined) => void;
    endDate: Date | undefined;
    setEndDate: (date: Date | undefined) => void;
}

const VisitsFilter: React.FC<VisitsFilterProps> = ({
    onFilter,
    onColumnSelect,
    onExport,
    selectedColumns,
    viewMode,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
}) => {
    const [storeName, setStoreName] = useState('');
    const [employeeName, setEmployeeName] = useState('');
    const [purpose, setPurpose] = useState('');
    const [debouncedStoreName, setDebouncedStoreName] = useState('');
    const [debouncedEmployeeName, setDebouncedEmployeeName] = useState('');

    useEffect(() => {
        const storeNameDebounceTimer = setTimeout(() => {
            setDebouncedStoreName(storeName);
        }, 300);

        const employeeNameDebounceTimer = setTimeout(() => {
            setDebouncedEmployeeName(employeeName);
        }, 300);

        return () => {
            clearTimeout(storeNameDebounceTimer);
            clearTimeout(employeeNameDebounceTimer);
        };
    }, [storeName, employeeName]);

    useEffect(() => {
        handleFilter();
    }, [debouncedStoreName, debouncedEmployeeName]);

    const handleFilter = () => {
        onFilter({ storeName: debouncedStoreName, employeeName: debouncedEmployeeName, purpose }, false);
    };

    const handleAllowClearStoreName = () => {
        setStoreName('');
        setDebouncedStoreName('');
        onFilter({ storeName: '', employeeName, purpose }, true);
    };

    const handleAllowClearEmployeeName = () => {
        setEmployeeName('');
        setDebouncedEmployeeName('');
        onFilter({ storeName, employeeName: '', purpose }, true);
    };

    const columnMapping: Record<string, string> = {
        'Customer Name': 'storeName',
        'Executive': 'employeeName',
        'visit_date': 'visit_date',
        'Status': 'outcome',
        'purpose': 'purpose',
        'visitStart': 'visitStart',
        'visitEnd': 'visitEnd',
        'intent': 'intent',
    };

    const handleColumnSelect = (column: string) => {
        onColumnSelect(columnMapping[column]);
    };

    const formatDate = (date: Date | undefined) => {
        return date ? format(date, 'MMM d, yyyy') : '';
    };

    return (
        <Card>
            <CardHeader>
            </CardHeader>
            <CardContent>
                <div className="flex justify-between flex-wrap gap-4">
                    <div className="flex flex-grow items-center space-x-4">
                        <div className="relative w-58">
                            <Input
                                type="text"
                                placeholder="Customer Name"
                                value={storeName}
                                onChange={(e) => {
                                    setStoreName(e.target.value);
                                }}
                                className="w-full"
                            />
                            {storeName && (
                                <button
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                                    onClick={handleAllowClearStoreName}
                                >
                                    &times;
                                </button>
                            )}
                        </div>
                        <div className="relative w-50">
                            <Input
                                type="text"
                                placeholder="Sales Executive Name"
                                value={employeeName}
                                onChange={(e) => {
                                    setEmployeeName(e.target.value);
                                }}
                                className="w-full"
                            />
                            {employeeName && (
                                <button
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                                    onClick={handleAllowClearEmployeeName}
                                >
                                    &times;
                                </button>
                            )}
                        </div>
                        <div className="flex space-x-2">
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline">
                                        Start Date: {formatDate(startDate)}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={startDate}
                                        onSelect={setStartDate}
                                        showOutsideDays
                                    />
                                </PopoverContent>
                            </Popover>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline">
                                        End Date: {formatDate(endDate)}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={endDate}
                                        onSelect={setEndDate}
                                        showOutsideDays
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        {viewMode === 'table' && (
                            <>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline">Columns</Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        {['Customer Name', 'Executive', 'visit_date', 'Status', 'purpose', 'visitStart', 'visitEnd', 'intent'].map(column => (
                                            <DropdownMenuCheckboxItem
                                                key={column}
                                                checked={selectedColumns.includes(columnMapping[column])}
                                                onCheckedChange={() => handleColumnSelect(column)}
                                            >
                                                {column}
                                            </DropdownMenuCheckboxItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>

                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline">Bulk Actions</Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuItem onSelect={onExport}>Export</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default VisitsFilter;