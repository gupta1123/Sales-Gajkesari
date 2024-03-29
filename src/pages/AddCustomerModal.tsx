import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRouter } from 'next/router';
import { CheckCircleOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

type EventIconProps = {
  type: 'task' | 'event' | 'notification'; // Add more types as needed
};

const EventIcon: React.FC<EventIconProps> = ({ type }) => {
  switch (type) {
    case "task":
      return <CheckCircleOutlined className="w-6 h-6 text-green-500" />;
    // handle other cases
    default:
      return <div>Unknown type</div>;
  }
};

interface CustomerData {
  storeName?: string;
  firstName?: string;
  lastName?: string;
  primaryContact?: string;
  secondaryContact?: string;
  email?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  gstNumber?: string;
  monthlySale?: string;
  clientType?: string;
}

interface AddCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  token: string;
  existingData?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    // Add other relevant fields
  };
}

const AddCustomerModal: React.FC<AddCustomerModalProps> = ({
  isOpen,
  onClose,
  token,
  existingData,
}) => {
  const [customerData, setCustomerData] = useState<CustomerData>(
    existingData || {
      firstName: '',
      lastName: '',
      email: '',
      // Initialize other fields with empty values
    }
  );
  const [activeTab, setActiveTab] = useState<string>('basic');
  const router = useRouter();

  const handleInputChange = (field: string, value: string) => {
    setCustomerData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      const url = existingData
        ? `http://ec2-13-49-190-97.eu-north-1.compute.amazonaws.com:8081/store/update?id=${existingData.id}`
        : 'http://ec2-13-49-190-97.eu-north-1.compute.amazonaws.com:8081/store/create';

      const method = existingData ? 'PUT' : 'POST';

      const payload = {
        ...customerData,
        clientFirstName: customerData.firstName,
        clientLastName: customerData.lastName,
        primaryContact: parseInt(customerData.primaryContact || '0'),
        pincode: customerData.pincode ? parseInt(customerData.pincode) : 0,
        monthlySale: parseInt(customerData.monthlySale || '0'),
        latitude: 10.00,
        longitude: -23.00,
      };

      // Remove firstName and lastName from the payload
      delete payload.firstName;
      delete payload.lastName;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        const storeId = data.storeId;
        const employeeId = data.employeeId; // Get the employee ID from the response
        router.push(`/CustomerDetailPage/${storeId}?employeeId=${employeeId}`);
      } else {
        console.error('Failed to update/create customer');
      }
    } catch (error) {
      console.error('Error updating/creating customer:', error);
    }
  };

  const handleNext = () => {
    if (activeTab === 'basic') {
      setActiveTab('contact');
    } else if (activeTab === 'contact') {
      setActiveTab('address');
    } else if (activeTab === 'address') {
      setActiveTab('additional');
    }
  };

  const handlePrevious = () => {
    if (activeTab === 'additional') {
      setActiveTab('address');
    } else if (activeTab === 'address') {
      setActiveTab('contact');
    } else if (activeTab === 'contact') {
      setActiveTab('basic');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add Customer</DialogTitle>
          <DialogDescription>Enter the details of the new customer.</DialogDescription>
        </DialogHeader>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList>
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
            <TabsTrigger value="address">Address</TabsTrigger>
            <TabsTrigger value="additional">Additional</TabsTrigger>
          </TabsList>
          <TabsContent value="basic" className="mt-4">
            <div className="grid gap-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="storeName" className="text-right">
                  Shop Name
                </Label>
                <Input id="storeName" value={customerData.storeName || ''} className="col-span-3" onChange={(e) => handleInputChange('storeName', e.target.value)} />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="firstName" className="text-right">
                  First Name
                </Label>
                <Input
                  id="firstName"
                  value={customerData.firstName || ''}
                  className="col-span-3"
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="lastName" className="text-right">
                  Last Name
                </Label>
                <Input
                  id="lastName"
                  value={customerData.lastName || ''}
                  className="col-span-3"
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                />
              </div>
            </div>
          </TabsContent>
          <TabsContent value="contact" className="mt-4">
            <div className="grid gap-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="primaryContact" className="text-right">
                  Primary Contact
                </Label>
                <Input id="primaryContact" type="tel" value={customerData.primaryContact || ''} className="col-span-3" onChange={(e) => handleInputChange('primaryContact', e.target.value)} />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="secondaryContact" className="text-right">
                  Secondary Contact
                </Label>
                <Input id="secondaryContact" type="tel" value={customerData.secondaryContact || ''} className="col-span-3" onChange={(e) => handleInputChange('secondaryContact', e.target.value)} />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={customerData.email || ''}
                  className="col-span-3"
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
              </div>
            </div>
          </TabsContent>
          <TabsContent value="address" className="mt-4">
            <div className="grid gap-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="addressLine1" className="text-right">
                  Address Line 1
                </Label>
                <Input id="addressLine1" value={customerData.addressLine1 || ''} className="col-span-3" onChange={(e) => handleInputChange('addressLine1', e.target.value)} />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="addressLine2" className="text-right">
                  Address Line 2
                </Label>
                <Input id="addressLine2" value={customerData.addressLine2 || ''} className="col-span-3" onChange={(e) => handleInputChange('addressLine2', e.target.value)} />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="city" className="text-right">
                  City
                </Label>
                <Input id="city" value={customerData.city || ''} className="col-span-3" onChange={(e) => handleInputChange('city', e.target.value)} />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="state" className="text-right">
                  State
                </Label>
                <Input id="state" value={customerData.state || ''} className="col-span-3" onChange={(e) => handleInputChange('state', e.target.value)} />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="country" className="text-right">
                  Country
                </Label>
                <Input id="country" value={customerData.country || ''} className="col-span-3" onChange={(e) => handleInputChange('country', e.target.value)} />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="pincode" className="text-right">
                  Pincode
                </Label>
                <Input id="pincode" type="text" value={customerData.pincode || ''} className="col-span-3" onChange={(e) => handleInputChange('pincode', e.target.value)} />
              </div>
            </div>
          </TabsContent>
          <TabsContent value="additional" className="mt-4">
            <div className="grid gap-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="gstNumber" className="text-right">
                  GST Number
                </Label>
                <Input id="gstNumber" value={customerData.gstNumber || ''} className="col-span-3" onChange={(e) => handleInputChange('gstNumber', e.target.value)} />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="monthlySale" className="text-right">
                  Monthly Sale
                </Label>
                <Input id="monthlySale" type="text" value={customerData.monthlySale || ''} className="col-span-3" onChange={(e) => handleInputChange('monthlySale', e.target.value)} />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="clientType" className="text-right">
                  Client Type
                </Label>
                <Input id="clientType" value={customerData.clientType || ''} className="col-span-3" onChange={(e) => handleInputChange('clientType', e.target.value)} />
              </div>
            </div>
          </TabsContent>
        </Tabs>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          {activeTab !== 'basic' && (
            <Button variant="outline" onClick={handlePrevious}>
              Previous
            </Button>
          )}
          {activeTab !== 'additional' ? (
            <Button onClick={handleNext}>Next</Button>
          ) : (
            <Button onClick={handleSubmit}>Add Customer</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddCustomerModal;