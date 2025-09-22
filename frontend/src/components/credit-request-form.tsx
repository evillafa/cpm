"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { getApiUrl } from "../config/api-config";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { postJson } from "@/lib/api";

interface FormData {
  fullName: string;
  dateOfBirth: string;
  curp: string;
  addressLine1: string;
  city: string;
  state: string;
  postalCode: string;
  purpose: string;
}

// Pre-filled customer profiles for faster development
interface CustomerProfile extends FormData {
  id: string;
  label: string;
}

const customerProfiles: CustomerProfile[] = [
  {
    id: "new",
    label: "Enter new customer data",
    fullName: "",
    dateOfBirth: "",
    curp: "",
    addressLine1: "",
    city: "",
    state: "",
    postalCode: "",
    purpose: "loanUnderwriting"
  },
  {
    id: "profile1",
    label: "María González López",
    fullName: "María González López",
    dateOfBirth: "1985-06-12",
    curp: "GOLM850612MDFNPR09",
    addressLine1: "Calle Reforma 234",
    city: "Guadalajara",
    state: "Jalisco",
    postalCode: "44100",
    purpose: "loanUnderwriting"
  },
  {
    id: "profile2",
    label: "Carlos Ramírez Vega",
    fullName: "Carlos Ramírez Vega",
    dateOfBirth: "1978-09-23",
    curp: "RAVC780923HDFMGR05",
    addressLine1: "Av. Chapultepec 567",
    city: "Mexico City",
    state: "CDMX",
    postalCode: "06500",
    purpose: "loanUnderwriting"
  },
  {
    id: "profile3",
    label: "Ana Luisa Mendoza Torres",
    fullName: "Ana Luisa Mendoza Torres",
    dateOfBirth: "1990-03-15",
    curp: "META900315MDFNRN08",
    addressLine1: "Blvd. Kukulcán 123",
    city: "Cancún",
    state: "Quintana Roo",
    postalCode: "77500",
    purpose: "loanUnderwriting"
  },
  {
    id: "profile4",
    label: "Javier Hernández Pérez",
    fullName: "Javier Hernández Pérez",
    dateOfBirth: "1982-11-07",
    curp: "HEPJ821107HDFRRV02",
    addressLine1: "Paseo de la Reforma 555",
    city: "Mexico City",
    state: "CDMX",
    postalCode: "06600",
    purpose: "loanUnderwriting"
  },
  {
    id: "profile5",
    label: "Gabriela Sánchez Ortiz",
    fullName: "Gabriela Sánchez Ortiz",
    dateOfBirth: "1988-04-29",
    curp: "SAOG880429MDFNRB03",
    addressLine1: "Av. Insurgentes Norte 789",
    city: "Monterrey",
    state: "Nuevo León",
    postalCode: "64000",
    purpose: "loanUnderwriting"
  }
];

export default function CreditRequestForm() {
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    dateOfBirth: "",
    curp: "",
    addressLine1: "",
    city: "",
    state: "",
    postalCode: "",
    purpose: "loanUnderwriting"
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<string>("new");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleProfileChange = (value: string) => {
    setSelectedProfile(value);
    const profile = customerProfiles.find(p => p.id === value);
    if (profile) {
      setFormData({
        fullName: profile.fullName,
        dateOfBirth: profile.dateOfBirth,
        curp: profile.curp,
        addressLine1: profile.addressLine1,
        city: profile.city,
        state: profile.state,
        postalCode: profile.postalCode,
        purpose: profile.purpose
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('handleSubmit started.')

    // Basic validation
    for (const [key, value] of Object.entries(formData)) {
      if (!value) {
        toast.error(`${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} is required`);
        return;
      }
    }
    
    // Date validation
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(formData.dateOfBirth)) {
      toast.error("Date of Birth must be in YYYY-MM-DD format");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Use the shared API configuration to get the correct URL based on environment
      const url = getApiUrl('/api/credit-rating/assessments');
      console.log('Data is valid, sending request... ' + url)
      await postJson(
        url,
        formData,
        5000 // 5 second timeout
      );
      
      toast.success("Credit assessment request submitted successfully");
      
      // Don't reset the form to allow for multiple submissions with small changes
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Credit Rating Request</CardTitle>
        <CardDescription>Submit customer information for credit assessment</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="profile-select">Select Pre-filled Customer Profile</Label>
            <Select value={selectedProfile} onValueChange={handleProfileChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a customer profile" />
              </SelectTrigger>
              <SelectContent>
                {customerProfiles.map((profile) => (
                  <SelectItem key={profile.id} value={profile.id}>
                    {profile.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedProfile === "new" && (
              <p className="text-xs text-muted-foreground">Enter new customer information below</p>
            )}
            {selectedProfile !== "new" && (
              <p className="text-xs text-muted-foreground">Pre-filled data from selected profile. You can still edit fields as needed.</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Juan Pérez González"
              disabled={isSubmitting}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="dateOfBirth">Date of Birth (YYYY-MM-DD)</Label>
            <Input
              id="dateOfBirth"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              placeholder="1980-01-15"
              disabled={isSubmitting}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="curp">CURP</Label>
            <Input
              id="curp"
              name="curp"
              value={formData.curp}
              onChange={handleChange}
              placeholder="PEGJ800115HDFRZN09"
              disabled={isSubmitting}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="addressLine1">Address Line 1</Label>
            <Input
              id="addressLine1"
              name="addressLine1"
              value={formData.addressLine1}
              onChange={handleChange}
              placeholder="Av. Insurgentes Sur 1602"
              disabled={isSubmitting}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Mexico City"
                disabled={isSubmitting}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="CDMX"
                disabled={isSubmitting}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="postalCode">Postal Code</Label>
            <Input
              id="postalCode"
              name="postalCode"
              value={formData.postalCode}
              onChange={handleChange}
              placeholder="03940"
              disabled={isSubmitting}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="purpose">Purpose</Label>
            <Input
              id="purpose"
              name="purpose"
              value={formData.purpose}
              onChange={handleChange}
              disabled={true}
            />
            <p className="text-xs text-muted-foreground">Fixed value for loan underwriting</p>
          </div>
          
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Request"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
