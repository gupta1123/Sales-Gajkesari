'use client';

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import React, { useState } from 'react';
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

type CustomerInteractionLog = {
  date: string;
  description: string;
};

const AddVisits = () => {
  const [visitDate, setVisitDate] = useState<Date | undefined>(undefined);
  const [visitTime, setVisitTime] = useState<Date | undefined>(undefined);
  const [visitPurpose, setVisitPurpose] = useState('');
  const [visitOutcome, setVisitOutcome] = useState('');
  const [visitNotes, setVisitNotes] = useState('');
  const [customer, setCustomer] = useState('');
  const [followUpTask, setFollowUpTask] = useState('');
  const [date, setDate] = useState<Date | undefined>(undefined);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log('Visit Details:', {
      visitDate,
      visitTime,
      visitPurpose,
      visitOutcome,
      visitNotes,
      customer,
      followUpTask,
    });
  };

  const purposes = [
    'Sales Pitch',
    'Follow-up',
    'Troubleshooting',
    'Customer Support',
  ];

  const customers = ['Customer A', 'Customer B', 'Customer C'];

  const customerInteractionLog: CustomerInteractionLog[] = [
    {
      date: '2023-05-01',
      description: 'Initial contact made with the customer.',
    },
    {
      date: '2023-06-15',
      description: 'Scheduled a product demo.',
    },
    {
      date: '2023-07-20',
      description: 'Followed up on the product demo.',
    },
  ];

  return (
    <Card className="max-w-3xl mx-auto">
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="visitDate">Visit Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-[240px] justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="visitPurpose">Visit Purpose</Label>
            <Select
              value={visitPurpose}
              onValueChange={setVisitPurpose}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select visit purpose" />
              </SelectTrigger>
              <SelectContent>
                {purposes.map((purpose) => (
                  <SelectItem key={purpose} value={purpose}>
                    {purpose}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="customer">Customer</Label>
            <Select
              value={customer}
              onValueChange={setCustomer}
            >

              <SelectTrigger>
                <SelectValue placeholder="Customer" />
              </SelectTrigger>
              <SelectContent>
                {customers.map((customer) => (
                  <SelectItem key={customer} value={customer}>
                    {customer}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <Label htmlFor="visitNotes">Visit Notes</Label>
          <Textarea
            id="visitNotes"
            value={visitNotes}
            onChange={(e) => setVisitNotes(e.target.value)}
            placeholder="Visit Notes"
            rows={4}
          />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <Checkbox
            checked={visitOutcome === 'Successful Sale'}
            onCheckedChange={(checked) =>
              setVisitOutcome(checked ? 'Successful Sale' : '')
            }
            className="col-span-1"
          >
            Successful Sale
          </Checkbox>
          <Checkbox
            checked={visitOutcome === 'Pending Follow-up'}
            onCheckedChange={(checked) =>
              setVisitOutcome(checked ? 'Pending Follow-up' : '')
            }
            className="col-span-1"
          >
            Pending Follow-up
          </Checkbox>
          <Checkbox
            checked={visitOutcome === 'Customer Feedback'}
            onCheckedChange={(checked) =>
              setVisitOutcome(checked ? 'Customer Feedback' : '')
            }
            className="col-span-1"
          >
            Customer Feedback
          </Checkbox>
        </div>
        <div>
          <Label htmlFor="followUpTask">Follow-up Task</Label>
          <Input
            id="followUpTask"
            value={followUpTask}
            onChange={(e) => setFollowUpTask(e.target.value)}
            placeholder="Follow-up Task"
          />
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">
            Customer Interaction Log
          </h3>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button onClick={handleSubmit}>Submit Visit</Button>
      </CardFooter>
    </Card>
  );
};

export default AddVisits;