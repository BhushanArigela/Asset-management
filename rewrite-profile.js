const fs = require('fs');
const file = 'src/app/(dashboard)/profile/page.tsx';

const newCode = `"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Save, User, Mail, Shield, Phone, Lock, Key, Eye, EyeOff, ChevronDown, LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().optional(),
  confirmPassword: z.string().optional(),
}).refine((data) => {
  if (data.newPassword && data.newPassword !== data.confirmPassword) {
    return false;
  }
  return true;
}, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
}).refine((data) => {
  if (data.newPassword && !data.currentPassword) {
    return false;
  }
  return true;
}, {
  message: "Current password is required to set a new password",
  path: ["currentPassword"],
});

export default function ProfilePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      phone: "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch(\`\${process.env.NEXT_PUBLIC_BASE_PATH || ""}/api/profile\`);
        if (res.ok) {
          const { data } = await res.json();
          setUserData(data);
          form.reset({
            name: data.name || "",
            phone: data.phone || "",
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
          });
        }
      } catch (error) {
        toast.error("Failed to load profile details.");
      }
    }
    fetchProfile();
  }, [form]);

  async function onSubmit(values: z.infer<typeof profileSchema>) {
    setIsLoading(true);
    try {
      const res = await fetch(\`\${process.env.NEXT_PUBLIC_BASE_PATH || ""}/api/profile\`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name,
          phone: values.phone,
          currentPassword: values.currentPassword || undefined,
          newPassword: values.newPassword || undefined,
        }),
      });

      const result = await res.json();
      if (!res.ok) {
        toast.error(result.error || "Failed to update profile");
      } else {
        toast.success(result.message || "Profile updated successfully");
        form.setValue("currentPassword", "");
        form.setValue("newPassword", "");
        form.setValue("confirmPassword", "");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2 mb-4">
        <h2 className="text-2xl font-bold tracking-tight text-[#1B2A4A]">My Profile</h2>
      </div>
      
      {userData ? (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Account Details Card */}
            <Card className="w-full border shadow-sm">
              <CardHeader className="flex flex-row items-center gap-4 bg-white rounded-t-lg border-b pb-4 pt-6">
                <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <CardTitle className="text-lg text-[#1B2A4A]">Account Details</CardTitle>
                  <CardDescription className="text-gray-500">
                    Update your personal information and password.
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="pt-6 bg-white rounded-b-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Email */}
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-gray-800 mb-1 block">Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <div className="absolute left-1 top-1 bottom-1 w-10 flex items-center justify-center rounded-md bg-blue-50 text-blue-500">
                          <Mail className="w-4 h-4" />
                        </div>
                        <Input value={userData.email || ""} disabled className="pl-14 h-11 bg-gray-50 border-gray-200" />
                      </div>
                    </FormControl>
                    <p className="text-xs text-muted-foreground mt-1">Email cannot be changed.</p>
                  </FormItem>
                  
                  {/* Role */}
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-gray-800 mb-1 block">Role</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <div className="absolute left-1 top-1 bottom-1 w-10 flex items-center justify-center rounded-md bg-green-50 text-green-500">
                          <Shield className="w-4 h-4" />
                        </div>
                        <Input value={userData.role?.name || ""} disabled className="pl-14 pr-10 h-11 bg-gray-50 border-gray-200" />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                          <ChevronDown className="w-4 h-4" />
                        </div>
                      </div>
                    </FormControl>
                  </FormItem>

                  {/* Name */}
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-gray-800 mb-1 block">Full Name</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <div className="absolute left-1 top-1 bottom-1 w-10 flex items-center justify-center rounded-md bg-indigo-50 text-indigo-500">
                              <User className="w-4 h-4" />
                            </div>
                            <Input placeholder="Admin" className="pl-14 h-11 border-gray-200" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Phone */}
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-gray-800 mb-1 block">Phone Number</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <div className="absolute left-1 top-1 bottom-1 w-10 flex items-center justify-center rounded-md bg-orange-50 text-orange-500">
                              <Phone className="w-4 h-4" />
                            </div>
                            <Input placeholder="1234567891" className="pl-14 h-11 border-gray-200" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Password Card */}
            <Card className="w-full border shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between bg-white rounded-t-lg border-b pb-4 pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                    <Lock className="w-6 h-6" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-[#1B2A4A]">Change Password</CardTitle>
                    <CardDescription className="text-gray-500">
                      Ensure your account is using a long, random password to stay secure.
                    </CardDescription>
                  </div>
                </div>
                {/* Decorative icon on right */}
                <div className="hidden sm:flex w-16 h-10 bg-indigo-50/50 rounded-lg items-center justify-center text-indigo-300">
                  <LockKeyhole className="w-6 h-6" />
                </div>
              </CardHeader>
              
              <CardContent className="pt-6 bg-white rounded-b-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Current Password */}
                  <FormField
                    control={form.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel className="text-sm font-semibold text-gray-800 mb-1 block">Current Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <div className="absolute left-1 top-1 bottom-1 w-10 flex items-center justify-center rounded-md bg-indigo-50 text-indigo-500">
                              <Key className="w-4 h-4" />
                            </div>
                            <Input type={showCurrent ? "text" : "password"} placeholder="••••••••" className="pl-14 pr-10 h-11 border-gray-200" {...field} />
                            <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                              {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* New Password */}
                  <FormField
                    control={form.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-gray-800 mb-1 block">New Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <div className="absolute left-1 top-1 bottom-1 w-10 flex items-center justify-center rounded-md bg-green-50 text-green-500">
                              <Lock className="w-4 h-4" />
                            </div>
                            <Input type={showNew ? "text" : "password"} placeholder="••••••••" className="pl-14 pr-10 h-11 border-gray-200" {...field} />
                            <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                              {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Confirm Password */}
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-gray-800 mb-1 block">Confirm New Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <div className="absolute left-1 top-1 bottom-1 w-10 flex items-center justify-center rounded-md bg-green-50 text-green-500">
                              <Lock className="w-4 h-4" />
                            </div>
                            <Input type={showConfirm ? "text" : "password"} placeholder="••••••••" className="pl-14 pr-10 h-11 border-gray-200" {...field} />
                            <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                              {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end pt-2 pb-10">
              <Button type="submit" disabled={isLoading} className="bg-[#312e81] hover:bg-[#3730a3] h-11 px-8 text-sm font-semibold rounded-md">
                <Save className="w-4 h-4 mr-2" />
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
            
          </form>
        </Form>
      ) : (
        <div className="h-[300px] flex items-center justify-center text-muted-foreground">
          Loading profile...
        </div>
      )}
    </div>
  );
}
`;

fs.writeFileSync(file, newCode);
console.log("Done");
