import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuCheckboxItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface VisitsFilterProps {
    onFilter: (filters: { storeName: string; employeeName: string; purpose: string }) => void;
    onColumnSelect: (column: string) => void;
    onBulkAction: (action: string) => void;
    onViewModeChange: () => void;
    selectedColumns: string[];
    viewMode: 'card' | 'table';
}

const VisitsFilter: React.FC<VisitsFilterProps> = ({ onFilter, onColumnSelect, onBulkAction, onViewModeChange, selectedColumns, viewMode }) => {
    const [storeName, setStoreName] = useState('');
    const [employeeName, setEmployeeName] = useState('');
    const [purpose, setPurpose] = useState('all');

    const handleFilter = () => {
        onFilter({ storeName, employeeName, purpose });
    };

    return (
        <Card>
            <CardHeader>
            </CardHeader>
            <CardContent>
                <div className="flex justify-between flex-wrap gap-4">
                    <div className="flex flex-grow items-center space-x-4">
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
                        <Select value={purpose} onValueChange={setPurpose}>
                            <SelectTrigger>
                                <SelectValue placeholder="Purpose" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All</SelectItem>
                                <SelectItem value="Sales ">Sales</SelectItem>
                                <SelectItem value="Follow up">Follow up</SelectItem>
                      
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Button onClick={handleFilter}>
                            Apply Filters
                        </Button>
                        {viewMode === 'table' && (
                            <>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline">Columns</Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        {['storeName', 'employeeName', 'visit_date', 'location', 'purpose', 'outcome'].map(column => (
                                            <DropdownMenuCheckboxItem
                                                key={column}
                                                checked={selectedColumns.includes(column)}
                                                onCheckedChange={() => onColumnSelect(column)}
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
                                        <DropdownMenuItem onSelect={() => onBulkAction('delete')}>Delete</DropdownMenuItem>
                                        <DropdownMenuItem onSelect={() => onBulkAction('export')}>Export</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </>
                        )}
                        <Button onClick={onViewModeChange}>
                            {viewMode === 'card' ? 'Switch to Table View' : 'Switch to Card View'}
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default VisitsFilter;