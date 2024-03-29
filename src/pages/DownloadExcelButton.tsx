import React from 'react';
import { Button } from '@/components/ui/button';
import { DownloadIcon } from '@radix-ui/react-icons';
import { utils, writeFile } from 'xlsx';
import { Customer } from '../../types/types';

interface DownloadExcelButtonProps {
    customers: Customer[];
}

const DownloadExcelButton: React.FC<DownloadExcelButtonProps> = ({ customers }) => {
    const handleDownloadExcel = () => {
        const worksheet = utils.json_to_sheet(customers);
        const workbook = utils.book_new();
        utils.book_append_sheet(workbook, worksheet, 'Customers');
        writeFile(workbook, 'customers.xlsx');
    };

    return (
        <Button variant="outline" onClick={handleDownloadExcel}>
            <DownloadIcon className="mr-2 h-4 w-4" />
            Download as Excel
        </Button>
    );
};

export default DownloadExcelButton;
