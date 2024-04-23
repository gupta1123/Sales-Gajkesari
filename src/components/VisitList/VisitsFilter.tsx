// VisitsFilter.tsx
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuCheckboxItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface VisitsFilterProps {
    onFilter: (filters: { storeName: string; employeeName: string; purpose: string }) => void;
    onColumnSelect: (column: string) => void;
    onExport: () => void;
    selectedColumns: string[];
    viewMode: 'card' | 'table';
    purposes: string[];
}

const VisitsFilter: React.FC<VisitsFilterProps> = ({ onFilter, onColumnSelect, onExport, selectedColumns, viewMode, purposes }) => {
    const [storeName, setStoreName] = useState('');
    const [employeeName, setEmployeeName] = useState('');
    const [purpose, setPurpose] = useState('all');

    const handleFilter = () => {
        onFilter({ storeName, employeeName, purpose });
    };

    const handleAllowClearStoreName = () => {
        setStoreName('');
        onFilter({ storeName: '', employeeName, purpose });
    };

    const handleAllowClearEmployeeName = () => {
        setEmployeeName('');
        onFilter({ storeName, employeeName: '', purpose });
    };

    const handleAllowClearPurpose = () => {
        setPurpose('all');
        onFilter({ storeName, employeeName, purpose: 'all' });
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

    return (
        <Card>
            <CardHeader>
            </CardHeader>
            <CardContent>
                <div className="flex justify-between flex-wrap gap-4">
                    <div className="flex flex-grow items-center space-x-4">
                        <div className="relative">
                            <Input
                                type="text"
                                placeholder="Customer Name"
                                value={storeName}
                                onChange={(e) => {
                                    setStoreName(e.target.value);
                                    handleFilter();
                                }}
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
                        <div className="relative">
                            <Input
                                type="text"
                                placeholder="Sales Executive Name"
                                value={employeeName}
                                onChange={(e) => {
                                    setEmployeeName(e.target.value);
                                    handleFilter();
                                }}
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
                        <div className="relative">

                            {purpose !== 'all' && (
                                <button
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                                    onClick={handleAllowClearPurpose}
                                >
                                    &times;
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        {viewMode === 'table' && (
                            <>                                <DropdownMenu>
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