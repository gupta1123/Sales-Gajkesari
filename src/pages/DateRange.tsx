import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

interface Visit {
    id: number;
    storeId: number;
    storeName: string;
    storeLatitude: number;
    storeLongitude: number;
    employeeId: number;
    employeeName: string;
    visit_date: string;
    intent: number | null; // Add this line
    scheduledStartTime: string | null;
    scheduledEndTime: string | null;
    visitLatitude: number | null;
    visitLongitude: number | null;
    checkinLatitude: number | null;
    checkinLongitude: number | null;
    checkoutLatitude: number | null;
    checkoutLongitude: number | null;
    checkinDate: string | null;
    checkoutDate: string | null;
    checkinTime: string | null;
    checkoutTime: string | null;
    purpose: string;
    outcome: string | null;
    feedback: string | null;
    createdAt: string | null;
    createdTime: string | null;
    updatedAt: string | null;
    updatedTime: string | null;
}

interface DateRangeProps {
    setVisits: (visits: Visit[]) => void;
}

const DateRange: React.FC<DateRangeProps> = ({ setVisits }) => {
    const [selectedRange, setSelectedRange] = useState('');
    const token = useSelector((state: RootState) => state.auth.token);

    const dateRanges = [
        { label: 'Today', value: 'today' },
        { label: 'Yesterday', value: 'yesterday' },
        { label: 'This Month', value: 'thisMonth' },
        { label: 'Last Month', value: 'lastMonth' },
    ];

    useEffect(() => {
        const fetchVisits = async () => {
            try {
                // Determine the start and end dates based on the selected range
                let startDate = '';
                let endDate = '';

                switch (selectedRange) {
                    case 'today':
                        // Set start and end dates for today
                        startDate = new Date().toISOString().split('T')[0];
                        endDate = startDate;
                        break;
                    case 'yesterday':
                        // Set start and end dates for yesterday
                        const yesterday = new Date();
                        yesterday.setDate(yesterday.getDate() - 1);
                        startDate = yesterday.toISOString().split('T')[0];
                        endDate = startDate;
                        break;
                    case 'thisMonth':
                        // Set start and end dates for this month
                        const currentDate = new Date();
                        startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString().split('T')[0];
                        endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).toISOString().split('T')[0];
                        break;
                    case 'lastMonth':
                        // Set start and end dates for last month
                        const lastMonthDate = new Date();
                        lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
                        startDate = new Date(lastMonthDate.getFullYear(), lastMonthDate.getMonth(), 1).toISOString().split('T')[0];
                        endDate = new Date(lastMonthDate.getFullYear(), lastMonthDate.getMonth() + 1, 0).toISOString().split('T')[0];
                        break;
                    default:
                        break;
                }

                if (startDate && endDate) {
                    const response = await fetch(`http://ec2-13-49-190-97.eu-north-1.compute.amazonaws.com:8081/visit/getByDateRange?start=${startDate}&end=${endDate}`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });
                    const data: Visit[] = await response.json();
                    setVisits(data);
                }
            } catch (error) {
                console.error('Error fetching visits:', error);
            }
        };

        if (token) {
            fetchVisits();
        }
    }, [selectedRange, token, setVisits]);

    return (
        <div>
            <Select value={selectedRange} onValueChange={setSelectedRange}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select a date range" />
                </SelectTrigger>
                <SelectContent>
                    {dateRanges.map((range) => (
                        <SelectItem key={range.value} value={range.value}>
                            {range.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
};

export default DateRange;