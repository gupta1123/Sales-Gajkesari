import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash, CheckCircle, XCircle } from "lucide-react";
import { useSelector } from 'react-redux';

type Brand = {
  id?: number;
  brand: string;
  pros: string;
  cons: string;
};

type NewBrand = {
  name: string;
  pros: string[];
  cons: string[];
};

type BrandsSectionProps = {
  storeId: string;
};

type RootState = {
  auth: {
    token: string;
  };
};

export default function BrandsSection({ storeId }: BrandsSectionProps) {

  const [brands, setBrands] = useState<Brand[]>([]);
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const token = useSelector((state: RootState) => state.auth.token);
  const [newBrand, setNewBrand] = useState<NewBrand>({
    name: "",
    pros: [],
    cons: [],
  });
  const [editingBrandId, setEditingBrandId] = useState<number | null>(null);

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      const response = await fetch(`http://ec2-13-49-190-97.eu-north-1.compute.amazonaws.com:8081/store/getById?id=${storeId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      const brandsData: Brand[] = data.proCons || [];
      setBrands(brandsData);
    } catch (error) {
      console.error("Error fetching brands:", error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewBrand({ ...newBrand, [e.target.name]: e.target.value });
  };

  const handleAddProCon = (type: "pros" | "cons") => {
    if (newBrand[type].length < 3) {
      setNewBrand({
        ...newBrand,
        [type]: [...newBrand[type], ""],
      });
    }
  };

  const handleProConChange = (
    type: "pros" | "cons",
    index: number,
    value: string
  ) => {
    const updatedProCon = [...newBrand[type]];
    updatedProCon[index] = value;
    setNewBrand({ ...newBrand, [type]: updatedProCon });
  };

  const handleAddBrand = async () => {
    if (newBrand.name.trim() !== "") {
      const brand = {
        brand: newBrand.name,
        pros: newBrand.pros.join(", "),
        cons: newBrand.cons.join(", "),
      };

      try {
        const response = await fetch(`http://ec2-13-49-190-97.eu-north-1.compute.amazonaws.com:8081/store/editProCons?id=${storeId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify([...brands, brand]),
        });

        if (response.ok) {
          setBrands([...brands, brand]);
          setNewBrand({ name: "", pros: [], cons: [] });
          setIsAdding(false);
        } else {
          console.error("Error adding brand:", response.statusText);
        }
      } catch (error) {
        console.error("Error adding brand:", error);
      }
    }
  };

  const handleEditBrand = (id: number) => {
    setIsEditing(true);
    setEditingBrandId(id);
    const brand = brands.find((b) => b.id === id);
    if (brand) {
      setNewBrand({
        name: brand.brand,
        pros: brand.pros.split(", "),
        cons: brand.cons.split(", "),
      });
    } else {
      console.error("Brand not found");
    }
  };

  const handleUpdateBrand = async () => {
    if (newBrand.name.trim() !== "") {
      const updatedBrands = brands.map((brand) => {
        if (brand.id === editingBrandId) {
          return {
            ...brand,
            brand: newBrand.name,
            pros: newBrand.pros.join(", "),
            cons: newBrand.cons.join(", "),
          };
        }
        return brand;
      });

      try {
        const response = await fetch(`http://ec2-13-49-190-97.eu-north-1.compute.amazonaws.com:8081/store/editProCons?id=${storeId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updatedBrands),
        });

        if (response.ok) {
          setBrands(updatedBrands);
          setNewBrand({ name: "", pros: [], cons: [] });
          setIsEditing(false);
          setEditingBrandId(null);
        } else {
          console.error("Error updating brand:", response.statusText);
        }
      } catch (error) {
        console.error("Error updating brand:", error);
      }
    }
  };

  const handleDeleteBrand = (id: number) => {
    const updatedBrands = brands.filter((brand) => brand.id !== id);
    setBrands(updatedBrands);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Brands</CardTitle>
      </CardHeader>
      <CardContent>
        {!isAdding && !isEditing && brands && brands.length === 0 && (
          <div className="text-center">
            <p className="text-gray-500">No brands available.</p>
            <Button onClick={() => setIsAdding(true)} className="mt-4">
              <Plus className="mr-2" />
              Add Brand
            </Button>
          </div>
        )}

        {(isAdding || isEditing) && (
          <>
            <div className="mb-4">
              <Label>Brand Name</Label>
              <Input
                name="name"
                value={newBrand.name}
                onChange={handleInputChange}
                placeholder="Enter brand name"
              />
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <Label>Pros</Label>
                {newBrand.pros.map((pro, index) => (
                  <Input
                    key={index}
                    value={pro}
                    onChange={(e) =>
                      handleProConChange("pros", index, e.target.value)
                    }
                    placeholder={`Pro ${index + 1}`}
                    className="mb-2"
                  />
                ))}
                {newBrand.pros.length < 3 && (
                  <Button
                    onClick={() => handleAddProCon("pros")}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    <Plus className="mr-2" />
                    Add Pro
                  </Button>
                )}
              </div>
              <div>
                <Label>Cons</Label>
                {newBrand.cons.map((con, index) => (
                  <Input
                    key={index}
                    value={con}
                    onChange={(e) =>
                      handleProConChange("cons", index, e.target.value)
                    }
                    placeholder={`Con ${index + 1}`}
                    className="mb-2"
                  />
                ))}
                {newBrand.cons.length < 3 && (
                  <Button
                    onClick={() => handleAddProCon("cons")}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    <Plus className="mr-2" />
                    Add Con
                  </Button>
                )}
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                onClick={isEditing ? handleUpdateBrand : handleAddBrand}
                variant="default"
              >
                {isEditing ? "Update" : "Add"}
              </Button>
              <Button
                onClick={() => {
                  setIsAdding(false);
                  setIsEditing(false);
                  setEditingBrandId(null);
                  setNewBrand({ name: "", pros: [], cons: [] });
                }}
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </>
        )}

        {brands.length > 0 && (
          <>
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {brands.map((brand, index) => (
                <div
                  key={index}
                  className="p-4 bg-gray-100 rounded-lg shadow-md"
                >
                  <div className="flex justify-between items-center mb-2">
                    <div className="font-bold text-lg">{brand.brand}</div>
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => handleEditBrand(index)}
                        variant="ghost"
                        size="sm"
                      >
                        <Edit className="text-gray-500" />
                      </Button>
                      <Button
                        onClick={() => handleDeleteBrand(index)}
                        variant="ghost"
                        size="sm"
                      >
                        <Trash className="text-red-500" />
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <div className="font-semibold mb-1 flex items-center">
                        <CheckCircle className="text-green-500 mr-1" />
                        Pros
                      </div>
                      <ul className="text-gray-600 text-sm list-disc pl-4">
                        {brand.pros && brand.pros.split(", ").map((pro, index) => (
                          <li key={index}>{pro}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <div className="font-semibold mb-1 flex items-center">
                        <XCircle className="text-red-500 mr-1" />
                        Cons
                      </div>
                      <ul className="text-gray-600 text-sm list-disc pl-4">
                        {brand.cons && brand.cons.split(", ").map((con, index) => (
                          <li key={index}>{con}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {!isAdding && !isEditing && (
              <Button onClick={() => setIsAdding(true)} className="mt-4">
                <Plus className="mr-2" />
                Add Brand
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}