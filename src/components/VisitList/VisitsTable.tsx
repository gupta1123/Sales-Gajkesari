// VisitsTable.tsx
import React from 'react';
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useRouter } from 'next/router';
import { Visit } from './types';

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

const formatDateTime = (date: string | null | undefined, time: string | null | undefined) => {
    if (date && time) {
        const [hours, minutes] = time.split(':');
        const formattedTime = format(
            new Date(`${date}T${hours}:${minutes}`),
            'dd MMM yyyy h:mm a'
        );
        return formattedTime;
    }
    return '';
};

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

    const getOutcomeStatus = (visit: Visit): { emoji: React.ReactNode; status: string; color: string } => {
        if (visit.checkinDate && visit.checkinTime && visit.checkoutDate && visit.checkoutTime) {
            return { emoji: ' ', status: 'Completed', color: 'bg-purple-100 text-purple-800' };
        } else if (visit.checkoutDate && visit.checkoutTime) {
            return { emoji: ' ', status: 'Checked Out', color: 'bg-orange-100 text-orange-800' };
        } else if (visit.checkinDate && visit.checkinTime) {
            return { emoji: ' ', status: 'On Going', color: 'bg-green-100 text-green-800' };
        }
        return { emoji: ' ', status: 'Assigned', color: 'bg-blue-100 text-blue-800' };
    };

    const sortVisits = (a: Visit, b: Visit) => {
        if (sortColumn === 'updatedAt') {
            const dateA = new Date(a.updatedAt!);
            const dateB = new Date(b.updatedAt!);
            return sortDirection === 'asc' ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
        } else if (sortColumn === 'intent') {
            const intentA = String(a.intent || '');
            const intentB = String(b.intent || '');
            return sortDirection === 'asc'
                ? intentA.localeCompare(intentB)
                : intentB.localeCompare(intentA);
        }
        return 0;
    };

    const sortedVisits = [...visits].sort(sortVisits);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const displayedVisits = sortedVisits.slice(startIndex, endIndex);

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left table-auto">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="px-4 py-2 w-12">
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
                        {selectedColumns.includes('outcome') && (
                            <th className="px-4 py-2 cursor-pointer" onClick={() => onSort('outcome')}>
                                Status {sortColumn === 'outcome' && (sortDirection === 'asc' ? '↑' : '↓')}
                            </th>
                        )}
                        {selectedColumns.includes('purpose') && (
                            <th className="px-4 py-2 cursor-pointer" onClick={() => onSort('purpose')}>
                                Purpose {sortColumn === 'purpose' && (sortDirection === 'asc' ? '↑' : '↓')}
                            </th>
                        )}
                        {selectedColumns.includes('visitStart') && (
                            <th className="px-4 py-2">Visit Start</th>
                        )}
                        {selectedColumns.includes('visitEnd') && (
                            <th className="px-4 py-2">Visit End</th>
                        )}
                        {selectedColumns.includes('intent') && (
                            <th className="px-4 py-2 cursor-pointer" onClick={() => onSort('intent')}>
                                Intent {sortColumn === 'intent' && (sortDirection === 'asc' ? '↑' : '↓')}
                            </th>
                        )}
                        <th className="px-4 py-2 cursor-pointer" onClick={() => onSort('updatedAt')}>
                            Last Updated {sortColumn === 'updatedAt' && (sortDirection === 'asc' ? '↑' : '↓')}
                        </th>
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
                                    <td className="px-4 py-2 max-w-xs truncate">{visit.storeName}</td>
                                )}
                                {selectedColumns.includes('employeeName') && (
                                    <td className="px-4 py-2 max-w-xs truncate">{visit.employeeName}</td>
                                )}
                                {selectedColumns.includes('visit_date') && (
                                    <td className="px-4 py-2 max-w-xs truncate">{visit.visit_date}</td>
                                )}
                                {selectedColumns.includes('outcome') && (
                                    <td className="px-4 py-2">
                                        <Badge className={`${color} px-3 py-1 rounded-full font-semibold`}>
                                            {emoji} {status}
                                        </Badge>
                                    </td>
                                )}
                                {selectedColumns.includes('purpose') && (
                                    <td className="px-4 py-2 max-w-xs truncate">{visit.purpose}</td>
                                )}
                                {selectedColumns.includes('visitStart') && (
                                    <td className="px-4 py-2 max-w-xs truncate">
                                        {formatDateTime(visit.checkinDate, visit.checkinTime)}
                                    </td>
                                )}
                                {selectedColumns.includes('visitEnd') && (
                                    <td className="px-4 py-2 max-w-xs truncate">
                                        {formatDateTime(visit.checkoutDate, visit.checkoutTime)}
                                    </td>
                                )}
                                {selectedColumns.includes('intent') && (
                                    <td className="px-4 py-2 max-w-xs truncate">{visit.intent}</td>
                                )}
                                <td className="px-4 py-2 max-w-xs truncate">
                                    {formatDateTime(visit.updatedAt, visit.updatedTime)}
                                </td>
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
        </div>
    );
};

export default VisitsTable;