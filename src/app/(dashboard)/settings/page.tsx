"use client";
import { useSession } from "next-auth/react";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Save, Mail, Home, Server, Hash, User, Lock, ShieldCheck, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";

const smtpFormSchema = z.object({
  host: z.string().min(1, "SMTP Host is required"),
  port: z.coerce.number().min(1, "Port is required"),
  secure: z.boolean().default(false),
  user: z.string().min(1, "Username is required"),
  password: z.string().optional(),
  fromEmail: z.string().email("Valid from email is required"),
  fromName: z.string().min(1, "From name is required"),
});

export default function SettingsPage() {
  const { data: session } = useSession();
  const canEditSettings = hasPermission(session?.user?.permissions, [PERMISSIONS.SETTINGS_EDIT] as any);

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [isTesting, setIsTesting] = useState(false);

  const form = useForm<z.infer<typeof smtpFormSchema>>({
    resolver: zodResolver(smtpFormSchema),
    defaultValues: {
      host: "",
      port: 465,
      secure: true,
      user: "",
      password: "",
      fromEmail: "",
      fromName: "Asset Management System",
    },
  });

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/api/settings/smtp`);
        if (res.ok) {
          const data = await res.json();
          if (data) {
            form.reset({
              host: data.host,
              port: data.port,
              secure: data.secure,
              user: data.user,
              password: "", // Keep password empty unless changing
              fromEmail: data.fromEmail,
              fromName: data.fromName,
            });
          }
        }
      } catch (error) {
        console.error("Failed to load settings:", error);
        toast.error("Failed to load SMTP settings");
      } finally {
        setIsFetching(false);
      }
    }
    loadSettings();
  }, [form]);

  
  const handleTestConnection = async () => {
    try {
      const values = form.getValues();
      if (!values.host || !values.port || !values.user) {
        toast.error("Please fill in Host, Port, and Username before testing.");
        return;
      }
      setIsTesting(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/api/settings/smtp/test`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to connect");
      }
      
      toast.success("Connection successful! SMTP settings are valid.");
    } catch (error: any) {
      toast.error(error.message || "Connection failed. Please check your settings.");
    } finally {
      setIsTesting(false);
    }
  };


  async function onSubmit(values: z.infer<typeof smtpFormSchema>) {
    setIsLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/api/settings/smtp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to save settings");
      }

      toast.success("SMTP settings saved successfully");
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex-1 p-4 md:p-8 pt-6 max-w-[1200px] mx-auto w-full bg-[#f8fafc] min-h-[calc(100vh-64px)]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-[28px] font-bold tracking-tight text-[#0f172a]">Settings</h2>
          <p className="text-[15px] text-gray-500 mt-1">Manage your system preferences and configuration</p>
        </div>
        <div className="flex items-center gap-2 text-[14px] text-gray-500 font-medium">
          <Home className="w-[18px] h-[18px]" />
          <span>/</span>
          <span>Settings</span>
          <span>/</span>
          <span className="text-blue-600">SMTP Configuration</span>
        </div>
      </div>
      
      <Card className="rounded-[16px] border border-gray-100 shadow-sm overflow-hidden bg-white">
        {/* Gradient Header Box */}
        <div className="bg-gradient-to-r from-[#f0f4fe] via-[#f0f4fe] to-[#e1eafc] p-6 md:p-8 flex justify-between items-center relative overflow-hidden border-b border-blue-50">
          <div className="flex items-center gap-5 z-10 relative">
            <div className="w-[60px] h-[60px] bg-[#dce6fa] text-blue-600 rounded-[16px] flex items-center justify-center shrink-0">
              <Mail className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-[22px] font-bold text-gray-900 leading-none mb-2">SMTP Configuration</h3>
              <p className="text-[14px] text-gray-600 max-w-[280px] sm:max-w-sm md:max-w-[340px] lg:max-w-lg">
                Configure the SMTP server used for sending system emails (e.g., password resets).
              </p>
            </div>
          </div>
          
          {/* Decorative Elements */}
          <div className="hidden md:block absolute right-12 top-1/2 -translate-y-1/2 opacity-90 z-0">
            <div className="relative">
              {/* Envelope graphic simulation */}
              <div className="w-[110px] h-[75px] bg-[#2563eb] rounded-lg shadow-lg relative z-10 overflow-hidden mt-4 mr-8">
                <div className="absolute inset-0 bg-[#3b82f6]" style={{ clipPath: "polygon(0 0, 50% 50%, 100% 0)" }}></div>
                <div className="absolute inset-0 bg-[#60a5fa] opacity-30" style={{ clipPath: "polygon(0 100%, 50% 50%, 100% 100%)" }}></div>
              </div>
              {/* Floating gear */}
              <div className="absolute bottom-[-10px] right-2 w-[42px] h-[42px] bg-[#f0f4fe] border-[3px] border-white rounded-full shadow-md flex items-center justify-center z-20 text-blue-500">
                <SettingsIcon className="w-5 h-5 text-[#2563eb]" />
              </div>
              {/* Floating paper planes */}
              <div className="absolute -top-4 -left-12 text-[#93c5fd] transform -rotate-12">
                <SendIcon className="w-8 h-8" />
              </div>
              <div className="absolute top-8 -left-20 text-[#bfdbfe] transform rotate-12 scale-75">
                <SendIcon className="w-8 h-8" />
              </div>
            </div>
          </div>
        </div>

        <CardContent className="p-6 md:p-8">
          {isFetching ? (
            <div className="h-[300px] flex items-center justify-center">
              <p className="text-muted-foreground">Loading settings...</p>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
                  <FormField
                    control={form.control}
                    name="host"
                    render={({ field }) => (
                      <FormItem className="space-y-0">
                        <FormLabel className="font-semibold text-[15px] text-gray-800 block mb-3">SMTP Host</FormLabel>
                        <FormControl>
                          <div className="flex items-center gap-3">
                            <div className="w-[48px] h-[48px] bg-[#f0f4fe] border border-input text-blue-500 rounded-[12px] flex items-center justify-center shrink-0">
                              <Server className="w-5 h-5" />
                            </div>
                            <Input placeholder="mail.tecnolynx.com" className="flex-1 h-[48px] rounded-[12px] border-input shadow-sm" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="port"
                    render={({ field }) => (
                      <FormItem className="space-y-0">
                        <FormLabel className="font-semibold text-[15px] text-gray-800 block mb-3">SMTP Port</FormLabel>
                        <FormControl>
                          <div className="flex items-center gap-3">
                            <div className="w-[48px] h-[48px] bg-purple-50 border border-input text-purple-500 rounded-[12px] flex items-center justify-center shrink-0">
                              <Hash className="w-5 h-5" />
                            </div>
                            <Input type="number" placeholder="465" className="flex-1 h-[48px] rounded-[12px] border-input shadow-sm" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="user"
                    render={({ field }) => (
                      <FormItem className="space-y-0">
                        <FormLabel className="font-semibold text-[15px] text-gray-800 block mb-3">Username</FormLabel>
                        <FormControl>
                          <div className="flex items-center gap-3">
                            <div className="w-[48px] h-[48px] bg-[#f0f4fe] border border-input text-blue-500 rounded-[12px] flex items-center justify-center shrink-0">
                              <User className="w-5 h-5" />
                            </div>
                            <Input placeholder="operations@tecnolynx.com" className="flex-1 h-[48px] rounded-[12px] border-input shadow-sm" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem className="space-y-0">
                        <FormLabel className="font-semibold text-[15px] text-gray-800 block mb-3">Password</FormLabel>
                        <FormControl>
                          <div className="flex items-center gap-3">
                            <div className="w-[48px] h-[48px] bg-purple-50 border border-input text-purple-500 rounded-[12px] flex items-center justify-center shrink-0">
                              <Lock className="w-5 h-5" />
                            </div>
                            <Input type="password" placeholder="Leave blank to keep unchanged" className="flex-1 h-[48px] rounded-[12px] border-input shadow-sm" {...field} />
                          </div>
                        </FormControl>
                        <p className="text-[13px] text-gray-500 mt-2 ml-[60px]">
                          Only enter a password if you want to change it.
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="fromEmail"
                    render={({ field }) => (
                      <FormItem className="space-y-0">
                        <FormLabel className="font-semibold text-[15px] text-gray-800 block mb-3">From Email Address</FormLabel>
                        <FormControl>
                          <div className="flex items-center gap-3">
                            <div className="w-[48px] h-[48px] bg-emerald-50 border border-input text-emerald-500 rounded-[12px] flex items-center justify-center shrink-0">
                              <Mail className="w-5 h-5" />
                            </div>
                            <Input placeholder="operations@tecnolynx.com" className="flex-1 h-[48px] rounded-[12px] border-input shadow-sm" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="fromName"
                    render={({ field }) => (
                      <FormItem className="space-y-0">
                        <FormLabel className="font-semibold text-[15px] text-gray-800 block mb-3">From Name</FormLabel>
                        <FormControl>
                          <div className="flex items-center gap-3">
                            <div className="w-[48px] h-[48px] bg-amber-50 border border-input text-amber-500 rounded-[12px] flex items-center justify-center shrink-0">
                              <User className="w-5 h-5" />
                            </div>
                            <Input placeholder="Asset Management System" className="flex-1 h-[48px] rounded-[12px] border-input shadow-sm" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="secure"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-[16px] border border-gray-100 shadow-sm p-5 mt-8 bg-[#fafafa]">
                      <div className="flex items-center gap-4">
                        <div className="w-[50px] h-[50px] bg-[#ecfdf5] text-[#10b981] rounded-full flex items-center justify-center shrink-0">
                          <ShieldCheck className="w-[26px] h-[26px]" />
                        </div>
                        <div className="space-y-1">
                          <FormLabel className="text-[16px] font-bold text-gray-900 cursor-pointer">Use SSL/TLS</FormLabel>
                          <p className="text-[14px] text-gray-500">
                            Enable secure connection (usually port 465 for true SSL).
                          </p>
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="data-[state=checked]:bg-[#2563eb] scale-125 mr-2"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-6">
                  {canEditSettings && (<Button type="submit" disabled={isLoading} className="bg-[#2563eb] hover:bg-blue-700 text-white px-6 py-6 rounded-[12px] font-semibold text-[15px] w-full sm:w-auto">
                    {isLoading ? (
                      "Saving..."
                    ) : (
                      <>
                        <Save className="mr-2 h-5 w-5" />
                        Save Settings
                      </>
                    )}
                  </Button>)}
                  <Button type="button" variant="outline" className="px-6 py-6 rounded-[12px] font-semibold text-[15px] border-input text-gray-800 bg-white hover:bg-gray-50 hover:text-gray-900 w-full sm:w-auto" onClick={handleTestConnection} disabled={isTesting}>
                    {isTesting ? <RefreshCw className="mr-2 h-5 w-5 text-gray-600 animate-spin" /> : <RefreshCw className="mr-2 h-5 w-5 text-gray-600" />}
                    {isTesting ? "Testing..." : "Test Connection"}
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function SettingsIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function SendIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M3.732 3.96l17.478 7.391a.69.69 0 0 1 0 1.272L3.732 20.04a.69.69 0 0 1-.955-.838l2.673-6.685h7.108a.69.69 0 0 0 0-1.38H5.45L2.777 4.798A.69.69 0 0 1 3.732 3.96z" />
    </svg>
  )
}
