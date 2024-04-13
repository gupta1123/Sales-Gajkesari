'use client'
import { useEffect, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Edit, Phone, Mail, MapPin, ShoppingBag, Users, Flag } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import VisitsTimeline from "../VisitsTimeline"
import NotesSection from "../../components/NotesSection"
import BrandsSection from "../../components/BrandsSection"
import LikesSection from "../../components/LikesSection"
import { Button } from "@/components/ui/button"
import TimelineOverview from "../../components/TimelineOverview"
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

import { Label } from '@/components/ui/label';
interface CustomerData {
  storeId?: string;
  storeName?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  monthlySale?: string;
  district?: string;
  subDistrict?: string;
  intent?: number;
  intentLevel?: number;
  fieldOfficer?: string;
  clientType?: string;
  clientFirstName?: string;
  clientLastName?: string;
  primaryContact?: string;
  employeeName?: string;
  secondaryContact?: string;
  email?: string;
  industry?: string;
  companySize?: number;
  gstNumber?: string;
  latitude?: number;
  longitude?: number;
  managers?: string[];
  brandsInUse?: string[];
  brandProCons?: string[];
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}


const dummyData = {
  shopName: "Acme Store",
  location: "New York, USA",
  address: "123 Main St, New York, NY 10001",
  ownerName: "John Doe",
  phone: "+1 123-456-7890",
  monthlySales: "$50,000",
  intentLevel: "8",
  fieldOfficer: "Jane Smith",
  clientType: "Shop",
}
export default function CustomerDetailPage() {
  const [activeTab, setActiveTab] = useState<"visits" | "notes" | "TimelineOverview" | "basic" | "contact" | "address" | "additional" | "Brands" | "Likes">("visits");


  const [activeTab1, setActiveTab1] = useState<"Brands" | "Likes">("Brands");
  const router = useRouter();
  const { storeId } = router.query as { storeId?: string };
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [customerData, setCustomerData] = useState<CustomerData>({});
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [othersValue, setOthersValue] = useState<string>("");

  const token = useSelector((state: RootState) => state.auth.token);
  const [customClientType, setCustomClientType] = useState<string | null>(null);
  const handleEdit = () => {
    setIsEditing(true);
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


  const handleSave = async () => {
    try {
      const response = await fetch(`http://ec2-13-49-190-97.eu-north-1.compute.amazonaws.com:8081/store/edit?id=${storeId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          managers: customerData.managers || [],
          latitude: customerData.latitude || 0,
          longitude: customerData.longitude || 0,
          brandsInUse: customerData.brandsInUse || [],
          monthlySale: customerData.monthlySale || "",
          brandProCons: customerData.brandProCons || [],
          notes: customerData.notes || null,
          clientType: customClientType || customerData.clientType || "",
          createdAt: customerData.createdAt || "",
          updatedAt: customerData.updatedAt || "",
          storeId: storeId,
          storeName: customerData.storeName || "",
          clientFirstName: customerData.clientFirstName || "",
          clientLastName: customerData.clientLastName || "",
          primaryContact: customerData.primaryContact || "",
          secondaryContact: customerData.secondaryContact || "",
          email: customerData.email || "",
          industry: customerData.industry || "",
          companySize: customerData.companySize || 0,
          gstNumber: customerData.gstNumber || "",
          addressLine1: customerData.addressLine1 || "",
          addressLine2: customerData.addressLine2 || "",
          city: customerData.city || "",
          district: customerData.district || "",
          subDistrict: customerData.subDistrict || "",
          state: customerData.state || "",
          country: customerData.country || "",
          pincode: customerData.pincode || "",
        }),
      });

      if (response.ok) {
        setIsEditing(false);
        // Optionally, you can refresh the customer data after successful update
        // fetchCustomerData();
      } else {
        console.error("Error updating customer:", response.statusText);
      }
    } catch (error) {
      console.error("Error updating customer:", error);
    }
  };
  const getNextTab = (currentTab: string) => {
    const tabs = ['basic', 'contact', 'address', 'additional'];
    const currentIndex = tabs.indexOf(currentTab);
    return tabs[currentIndex + 1];
  };

  const getPreviousTab = (currentTab: string) => {
    const tabs = ['basic', 'contact', 'address', 'additional'];
    const currentIndex = tabs.indexOf(currentTab);
    return tabs[currentIndex - 1];
  };

  const handleInputChange = (field: keyof CustomerData, value: string | number) => {
    setCustomerData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };


  useEffect(() => {
    const fetchCustomerData = async () => {
      try {
        const response = await fetch(`http://ec2-13-49-190-97.eu-north-1.compute.amazonaws.com:8081/store/getById?id=${storeId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data: CustomerData = await response.json();
        setCustomerData(data);
        setIsLoading(false);
      } catch (error) {
        setError('Customer not found!');
        setIsLoading(false);
      }
    };

    if (storeId && token) {
      fetchCustomerData();
    }
  }, [storeId, token]);

  useEffect(() => {
    // Set the customClientType when customerData changes
    setCustomClientType(customerData.clientType || null);
  }, [customerData]);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-4xl font-bold mb-8">Customer Detail</h1>

      {/* Top Section */}
      <div className="bg-white rounded-lg shadow-lg px-8 py-6 mb-8">
        <div className="flex items-center">
          <div className="flex items-center">
            <Avatar className="w-16 h-16 rounded-full ring-2 ring-offset-2 ring-indigo-500">
            </Avatar>

            <div className="ml-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-1">{customerData.storeName}</h2>
              <div className="flex items-center text-gray-500">
                <MapPin className="mr-1 w-4 h-4" />
                <span className="text-sm font-medium">{customerData.addressLine1}</span>
              </div>
            </div>
          </div>
          <div className="ml-auto grid grid-cols-3 gap-8">
            <div className="flex items-center">
              <div className="rounded-full bg-indigo-100 p-3 mr-4">
                <ShoppingBag className="text-indigo-500 w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Monthly Sales</p>
                <p className="text-xl font-semibold text-gray-800">{customerData.monthlySale} tonnes</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="rounded-full bg-green-100 p-3 mr-4">
                <Users className="text-green-500 w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Client Type</p>
                <p className="text-xl font-semibold text-gray-800">{customerData.clientType}</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="rounded-full bg-yellow-100 p-3 mr-4">
                <Flag className="text-yellow-500 w-6 h-6" />
              </div>
              <div>
                <p className="text-gray-600">Intent Level</p>
                <p className="text-lg font-medium text-gray-800">{customerData.intent}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Card className="bg-white rounded-lg shadow-lg mb-8">
        <CardContent className="p-4">
          <div className="flex justify-end mb-2">
            <Button variant="outline" onClick={() => setIsEditing(!isEditing)} className="mr-2 px-2 py-1 text-xs">
              <Edit className="w-3 h-3 mr-1" />
              {isEditing ? "Cancel" : "Edit"}
            </Button>
          </div>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "visits" | "notes" | "TimelineOverview" | "basic" | "contact" | "address" | "additional")} className="mt-2">
            <TabsList className="grid grid-cols-4 gap-2">
              <TabsTrigger value="basic" className="px-2 py-1 rounded-md bg-gray-100 text-gray-800 text-xs hover:bg-gray-200">Basic Info</TabsTrigger>
              <TabsTrigger value="contact" className="px-2 py-1 rounded-md bg-gray-100 text-gray-800 text-xs hover:bg-gray-200">Contact</TabsTrigger>
              <TabsTrigger value="address" className="px-2 py-1 rounded-md bg-gray-100 text-gray-800 text-xs hover:bg-gray-200">Address</TabsTrigger>
              <TabsTrigger value="additional" className="px-2 py-1 rounded-md bg-gray-100 text-gray-800 text-xs hover:bg-gray-200">Additional</TabsTrigger>
            </TabsList>

            {/* Basic Info Tab */}
            <TabsContent value="basic" className="mt-4">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div style={{ marginTop: '20px' }}> {/* Adjusted margin-top for "Shop Name" */}
                    <Label htmlFor="storeName" className="text-xs font-medium text-black">Shop Name</Label>
                    <Input id="storeName" value={customerData.storeName || ''} onChange={(e) => handleInputChange('storeName', e.target.value)} className="w-full max-w-xs mt-1 text-xs rounded-md px-2 py-1 text-black" disabled={!isEditing} />
                  </div>
                  <div>
                    <Label htmlFor="clientFirstName" className="text-xs font-medium text-black">First Name</Label>
                    <Input id="clientFirstName" value={customerData.clientFirstName || ''} onChange={(e) => handleInputChange('clientFirstName', e.target.value)} className="w-full max-w-xs mt-1 text-xs rounded-md px-2 py-1 text-black" disabled={!isEditing} />
                  </div>
                  <div className="md:col-span-1 hidden md:block"></div> {/* Keeping the layout responsive */}
                  <div>
                    <Label htmlFor="clientLastName" className="text-xs font-medium text-black">Last Name</Label>
                    <Input id="clientLastName" value={customerData.clientLastName || ''} onChange={(e) => handleInputChange('clientLastName', e.target.value)} className="w-full max-w-xs mt-1 text-xs rounded-md px-2 py-1 text-black" disabled={!isEditing} />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Contact Tab */}
            <TabsContent value="contact" className="mt-4">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="primaryContact" className="text-xs font-medium text-black">Primary Phone Number</Label>
                    <Input id="primaryContact" type="tel" value={customerData.primaryContact || ''} onChange={(e) => handleInputChange('primaryContact', e.target.value)} className="w-full max-w-xs mt-1 text-xs rounded-md px-2 py-1 text-black" disabled={!isEditing} />
                  </div>
                  <div>
                    <Label htmlFor="secondaryContact" className="text-xs font-medium text-black">Secondary Phone Number</Label>
                    <Input id="secondaryContact" type="tel" value={customerData.secondaryContact || ''} onChange={(e) => handleInputChange('secondaryContact', e.target.value)} className="w-full max-w-xs mt-1 text-xs rounded-md px-2 py-1 text-black" disabled={!isEditing} />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-xs font-medium text-black">Email</Label>
                    <Input id="email" type="email" value={customerData.email || ''} onChange={(e) => handleInputChange('email', e.target.value)} className="w-full max-w-xs mt-1 text-xs rounded-md px-2 py-1 text-black" disabled={!isEditing} />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Address Tab */}
            <TabsContent value="address" className="mt-4">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="addressLine1" className="text-xs font-medium text-black">Address Line 1</Label>
                    <Input id="addressLine1" value={customerData.addressLine1 || ''} onChange={(e) => handleInputChange('addressLine1', e.target.value)} className="w-full max-w-xs mt-1 text-xs rounded-md px-2 py-1 text-black" disabled={!isEditing} />
                  </div>
                  <div>
                    <Label htmlFor="addressLine2" className="text-xs font-medium text-black">Address Line 2</Label>
                    <Input id="addressLine2" value={customerData.addressLine2 || ''} onChange={(e) => handleInputChange('addressLine2', e.target.value)} className="w-full max-w-xs mt-1 text-xs rounded-md px-2 py-1 text-black" disabled={!isEditing} />
                  </div>
                  <div>
                    <Label htmlFor="city" className="text-xs font-medium text-black">City</Label>
                    <Input id="city" value={customerData.city || ''} onChange={(e) => handleInputChange('city', e.target.value)} className="w-full max-w-xs mt-1 text-xs rounded-md px-2 py-1 text-black" disabled={!isEditing} />
                  </div>
                  <div>
                    <Label htmlFor="state" className="text-xs font-medium text-black">State</Label>
                    <Input id="state" value={customerData.state || ''} onChange={(e) => handleInputChange('state', e.target.value)} className="w-full max-w-xs mt-1 text-xs rounded-md px-2 py-1 text-black" disabled={!isEditing} />
                  </div>
                  <div>
                    <Label htmlFor="district" className="text-xs font-medium text-black">Taluka</Label>
                    <Input id="district" value={customerData.district || ''} onChange={(e) => handleInputChange('district', e.target.value)} className="w-full max-w-xs mt-1 text-xs rounded-md px-2 py-1 text-black" disabled={!isEditing} />
                  </div>
                  <div>
                    <Label htmlFor="subDistrict" className="text-xs font-medium text-black">Village</Label>
                    <Input id="subDistrict" value={customerData.subDistrict || ''} onChange={(e) => handleInputChange('subDistrict', e.target.value)} className="w-full max-w-xs mt-1 text-xs rounded-md px-2 py-1 text-black" disabled={!isEditing} />
                  </div>
                  <div>
                    <Label htmlFor="country" className="text-xs font-medium text-black">Country</Label>
                    <Input id="country" value={customerData.country || ''} onChange={(e) => handleInputChange('country', e.target.value)} className="w-full max-w-xs mt-1 text-xs rounded-md px-2 py-1 text-black" disabled={!isEditing} />
                  </div>
                  <div>
                    <Label htmlFor="pincode" className="text-xs font-medium text-black">Pincode</Label>
                    <Input id="pincode" type="number" value={customerData.pincode || ''} onChange={(e) => handleInputChange('pincode', e.target.value)} className="w-full max-w-xs mt-1 text-xs rounded-md px-2 py-1 text-black" disabled={!isEditing} />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Additional Tab */}
            <TabsContent value="additional" className="mt-4">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="monthlySale" className="text-xs font-medium text-black">Monthly Sale</Label>
                    <Input id="monthlySale" type="number" value={customerData.monthlySale || ''} onChange={(e) => handleInputChange('monthlySale', e.target.value)} className="w-full max-w-xs mt-1 text-xs rounded-md px-2 py-1 text-black" disabled={!isEditing} />
                  </div>
                  <div>
                    <Label htmlFor="intent" className="text-xs font-medium text-black">Intent Level</Label>
                    <Select value={customerData.intent ? String(customerData.intent) : ''} onValueChange={(value) => handleInputChange('intent', Number(value))} disabled={!isEditing}>
                      <SelectTrigger className="px-2 py-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[...Array(10)].map((_, index) => (
                          <SelectItem key={index} value={String(index + 1)} className="text-xs">{index + 1}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="clientType" className="text-xs font-medium text-black">Client Type</Label>
                    <Select
                      value={customClientType || ''}
                      onValueChange={(value) => setCustomClientType(value)}
                      disabled={!isEditing}
                    >
                      <SelectTrigger className="px-2 py-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Shop" className="text-xs">shop</SelectItem>
                        <SelectItem value="Project" className="text-xs">project</SelectItem>
                        {/* Add more client types as needed */}
                        {customClientType && !['Shop', 'Project'].includes(customClientType) && (
                          <SelectItem value={customClientType} className="text-xs">{customClientType}</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="industry" className="text-xs font-medium text-black">Industry</Label>
                    <Input id="industry" value={customerData.industry || ''} onChange={(e) => handleInputChange('industry', e.target.value)} className="w-full max-w-xs mt-1 text-xs rounded-md px-2 py-1 text-black" disabled={!isEditing} />
                  </div>
                  {/* Additional fields can be added following the same pattern */}
                </div>
              </div>
            </TabsContent>



          </Tabs>
          <div className="mt-4 flex justify-between space-x-2">
            <Button variant="outline" onClick={handlePrevious} disabled={activeTab === 'basic'} className="px-2 py-1 text-xs">
              Previous
            </Button>
            <Button onClick={handleNext} disabled={activeTab === 'additional'} className="px-2 py-1 text-xs">
              Next
            </Button>
            <Button onClick={handleSave} disabled={!isEditing || activeTab !== 'additional'} className="px-2 py-1 text-xs">
              Save
            </Button>
          </div>
        </CardContent>
      </Card>


      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-lg">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "visits" | "notes" | "TimelineOverview" | "Brands" | "Likes")}>
          <TabsList className="grid w-full grid-cols-5">
   
            <TabsTrigger value="visits" className="px-4 py-2">Visits</TabsTrigger>
            <TabsTrigger value="notes" className="px-4 py-2">Notes</TabsTrigger>
            <TabsTrigger value="Brands" className="px-4 py-2">Brands Used</TabsTrigger>
            <TabsTrigger value="Likes" className="px-4 py-2">Likes</TabsTrigger>
          </TabsList>

          {/* Timeline Tab */}
          <TabsContent value="TimelineOverview" className="p-6">
            <TimelineOverview storeId={customerData.storeId ? customerData.storeId : ''} />
          </TabsContent>

          {/* Visits Tab */}
          <TabsContent value="visits" className="p-6">
            <VisitsTimeline storeId={customerData.storeId ? customerData.storeId : ''} />
          </TabsContent>

          {/* Notes Tab */}
          <TabsContent value="notes" className="p-6">
            <NotesSection storeId={customerData.storeId ? customerData.storeId : ''} />
          </TabsContent>

          {/* BrandsSection Tab */}
          <TabsContent value="Brands" className="p-6">
            <BrandsSection storeId={customerData.storeId ? customerData.storeId : ''} />
          </TabsContent>

          {/* LikesSection Tab */}
          <TabsContent value="Likes" className="p-6">
            <LikesSection storeId={customerData.storeId ? customerData.storeId : ''} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 