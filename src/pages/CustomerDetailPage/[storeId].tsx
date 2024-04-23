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
  customClientType?: string; // Add this line
}
export default function CustomerDetailPage() {
  const [activeTab, setActiveTab] = useState<"basic" | "contact" | "address" | "additional">("basic");
  const [rightTab, setRightTab] = useState<"visits" | "notes" | "Brands" | "Likes">("visits");
  const router = useRouter();
  const { storeId } = router.query as { storeId?: string };
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [customerData, setCustomerData] = useState<CustomerData>({});
  const [isEditing, setIsEditing] = useState<boolean>(false);
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
      const response = await fetch(`http://ec2-51-20-32-8.eu-north-1.compute.amazonaws.com:8081/store/edit?id=${storeId}`, {
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
      } else {
        console.error("Error updating customer:", response.statusText);
      }
    } catch (error) {
      console.error("Error updating customer:", error);
    }
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
        const response = await fetch(`http://ec2-51-20-32-8.eu-north-1.compute.amazonaws.com:8081/store/getById?id=${storeId}`, {
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
    setCustomClientType(customerData.clientType || null);
  }, [customerData]);

  const getInitials = (name: string | undefined) => {
    if (!name) return '';
    const names = name.split(' ');
    const firstInitial = names[0]?.charAt(0).toUpperCase() || '';
    const lastInitial = names[1]?.charAt(0).toUpperCase() || '';
    return `${firstInitial}${lastInitial}`;
  };
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-4xl font-bold mb-8">Customer Detail</h1>

      <div className="flex">
        {/* Left Panel */}
        <div className="w-1/3 pr-8">
          <Card className="bg-gray-50 rounded-lg shadow-lg mb-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6 p-4 rounded-lg">
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-xl">
                    {getInitials(customerData.storeName)}
                  </div>
                  <div className="ml-4">
                    <h2 className="text-xl font-bold text-gray-900">{customerData.storeName}</h2>
                    <div className="text-sm text-gray-900">
                      <p><b>Type:</b> {customerData.clientType}</p>
                      <p><b>Intent Level:</b> {customerData.intent}</p>
                      <p><b>Employee:</b> {customerData.employeeName}</p>
                      <p><b>Sales:</b> {customerData.monthlySale} tn</p>
                    </div>
                  </div>
                </div>
                {!isEditing && (
                  <Button variant="outline" onClick={() => setIsEditing(true)} className="p-1">
                    <Edit className="w-4 h-4 text-gray-900" />
                  </Button>
                )}
              </div>
              <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "basic" | "contact" | "address" | "additional")} defaultValue="basic">
                <TabsList className="grid grid-cols-3 gap-4 mb-6">
                  <TabsTrigger value="basic" className="text-sm font-semibold py-2">General</TabsTrigger>
                  <TabsTrigger value="address" className="text-sm font-semibold py-2">Address</TabsTrigger>
                  <TabsTrigger value="additional" className="text-sm font-semibold py-2">Additional</TabsTrigger>
                </TabsList>
                <TabsContent value="basic" className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="shopName" className="text-sm font-medium text-gray-700">Shop Name</Label>
                      <Input id="shopName" value={customerData.storeName || ''} onChange={(e) => handleInputChange('storeName', e.target.value)} className="w-full mt-1 text-sm rounded-md px-3 py-2 text-gray-800" disabled={!isEditing} />
                    </div>
                    <div>
                      <Label htmlFor="clientFirstName" className="text-sm font-medium text-gray-700">First Name</Label>
                      <Input id="clientFirstName" value={customerData.clientFirstName || ''} onChange={(e) => handleInputChange('clientFirstName', e.target.value)} className="w-full mt-1 text-sm rounded-md px-3 py-2 text-gray-800" disabled={!isEditing} />
                    </div>
                    <div>
                      <Label htmlFor="clientLastName" className="text-sm font-medium text-gray-700">Last Name</Label>
                      <Input id="clientLastName" value={customerData.clientLastName || ''} onChange={(e) => handleInputChange('clientLastName', e.target.value)} className="w-full mt-1 text-sm rounded-md px-3 py-2 text-gray-800" disabled={!isEditing} />
                    </div>
                    <div>
                      <Label htmlFor="primaryContact" className="text-sm font-medium text-gray-700">Primary Phone Number</Label>
                      <Input id="primaryContact" type="tel" value={customerData.primaryContact || ''} onChange={(e) => handleInputChange('primaryContact', e.target.value)} className="w-full mt-1 text-sm rounded-md px-3 py-2 text-gray-800" disabled={!isEditing} />
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
                      <Input id="email" type="email" value={customerData.email || ''} onChange={(e) => handleInputChange('email', e.target.value)} className="w-full mt-1 text-sm rounded-md px-3 py-2 text-gray-800" disabled={!isEditing} />
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="address" className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="addressLine1" className="text-sm font-medium text-gray-700">Address Line 1</Label>
                      <Input id="addressLine1" value={customerData.addressLine1 || ''} onChange={(e) => handleInputChange('addressLine1', e.target.value)} className="w-full mt-1 text-sm rounded-md px-3 py-2 text-gray-800" disabled={!isEditing} />
                    </div>
                    <div>
                      <Label htmlFor="addressLine2" className="text-sm font-medium text-gray-700">Address Line 2</Label>
                      <Input id="addressLine2" value={customerData.addressLine2 || ''} onChange={(e) => handleInputChange('addressLine2', e.target.value)} className="w-full mt-1 text-sm rounded-md px-3 py-2 text-gray-800" disabled={!isEditing} />
                    </div>
                    <div>
                      <Label htmlFor="city" className="text-sm font-medium text-gray-700">City</Label>
                      <Input id="city" value={customerData.city || ''} onChange={(e) => handleInputChange('city', e.target.value)} className="w-full mt-1 text-sm rounded-md px-3 py-2 text-gray-800" disabled={!isEditing} />
                    </div>
                    <div>
                      <Label htmlFor="state" className="text-sm font-medium text-gray-700">State</Label>
                      <Input id="state" value={customerData.state || ''} onChange={(e) => handleInputChange('state', e.target.value)} className="w-full mt-1 text-sm rounded-md px-3 py-2 text-gray-800" disabled={!isEditing} />
                    </div>
                    <div>
                      <Label htmlFor="district" className="text-sm font-medium text-gray-700">Taluka</Label>
                      <Input id="district" value={customerData.district || ''} onChange={(e) => handleInputChange('district', e.target.value)} className="w-full mt-1 text-sm rounded-md px-3 py-2 text-gray-800" disabled={!isEditing} />
                    </div>
                    <div>
                      <Label htmlFor="subDistrict" className="text-sm font-medium text-gray-700">Village</Label>
                      <Input id="subDistrict" value={customerData.subDistrict || ''} onChange={(e) => handleInputChange('subDistrict', e.target.value)} className="w-full mt-1 text-sm rounded-md px-3 py-2 text-gray-800" disabled={!isEditing} />
                    </div>
                    <div>
                      <Label htmlFor="pincode" className="text-sm font-medium text-gray-700">Pincode</Label>
                      <Input id="pincode" type="number" value={customerData.pincode || ''} onChange={(e) => handleInputChange('pincode', e.target.value)} className="w-full mt-1 text-sm rounded-md px-3 py-2 text-gray-800" disabled={!isEditing} />
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="additional" className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="monthlySale" className="text-sm font-medium text-gray-700">Monthly Sale</Label>
                      <Input id="monthlySale" type="number" value={customerData.monthlySale || ''} onChange={(e) => handleInputChange('monthlySale', e.target.value)} className="w-full mt-1 text-sm rounded-md px-3 py-2 text-gray-800" disabled={!isEditing} />
                    </div>
                    <div>
                      <Label htmlFor="intent" className="text-sm font-medium text-gray-700">Intent Level</Label>
                      <Select value={customerData.intent ? String(customerData.intent) : ''} onValueChange={(value) => handleInputChange('intent', Number(value))} disabled={!isEditing}>
                        <SelectTrigger className="w-full mt-1 text-sm px-3 py-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[...Array(10)].map((_, index) => (
                            <SelectItem key={index} value={String(index + 1)} className="text-sm">{index + 1}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="clientType" className="text-sm font-medium text-gray-700">Client Type</Label>
                      <Select value={customerData.clientType || ''} onValueChange={(value) => handleInputChange('clientType', value)} disabled={!isEditing}>
                        <SelectTrigger className="w-full mt-1 text-sm px-3 py-2">
                          <SelectValue placeholder="Select a type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Contractor" className="text-sm">Contractor</SelectItem>
                          <SelectItem value="Builder" className="text-sm">Builder</SelectItem>
                          <SelectItem value="Shop" className="text-sm">Shop</SelectItem>
                          <SelectItem value="Project" className="text-sm">Project</SelectItem>
                          <SelectItem value="Architect" className="text-sm">Architect</SelectItem>
                          <SelectItem value="custom" className="text-sm">Others</SelectItem>
                        </SelectContent>
                      </Select>
                      {customerData.clientType === 'custom' && (
                        <Input
                          id="customClientType"
                          value={customerData.customClientType || ''}
                          onChange={(e) => handleInputChange('customClientType', e.target.value)}
                          className="w-full mt-1 text-sm rounded-md px-3 py-2 text-gray-800"
                          disabled={!isEditing}
                        />
                      )}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
              {isEditing && (
                <div className="mt-6 flex justify-end space-x-2">
                  <Button onClick={() => setIsEditing(false)} variant="outline" className="px-4 py-2 text-sm font-semibold">
                    Cancel
                  </Button>
                  <Button onClick={handleSave} className="px-4 py-2 text-sm font-semibold">
                    Save Changes
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        {/* Right Panel */}
        <div className="w-2/3">
          <div className="bg-white rounded-lg shadow-lg">
            <Tabs value={rightTab} onValueChange={(value) => setRightTab(value as "visits" | "notes" | "Brands" | "Likes")}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="visits" className="px-4 py-2">Visits</TabsTrigger>
                <TabsTrigger value="notes" className="px-4 py-2">Notes</TabsTrigger>
                <TabsTrigger value="Brands" className="px-4 py-2">Brands Used</TabsTrigger>
                <TabsTrigger value="Likes" className="px-4 py-2">Likes</TabsTrigger>
              </TabsList>

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
      </div>
    </div>
  );
}