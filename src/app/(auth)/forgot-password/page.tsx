"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { User, ArrowLeft } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
});

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to request password reset.");
      } else {
        toast.success(data.message || "Reset link sent!");
        setIsSuccess(true);
      }
    } catch (error) {
      toast.error("An error occurred while requesting a reset link.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left Side - Hero Section */}
      <div 
        className="hidden md:flex flex-1 flex-col items-start justify-start relative bg-cover bg-center p-8 lg:p-24 pt-24 lg:pt-40" 
        style={{ backgroundImage: `url('${process.env.NEXT_PUBLIC_BASE_PATH || ""}/login-bg-left.jpg')` }}
      >
        <div className="z-10 max-w-lg relative">
          <h1 className="text-3xl lg:text-5xl font-bold text-white mb-2">Enterprise</h1>
          <h2 className="text-2xl lg:text-[34px] font-semibold text-[#c6ebf9] mb-4 lg:mb-6 leading-tight">Asset Management System</h2>
          <div className="h-[2px] w-12 bg-[#1e96f6] mb-6 lg:mb-8"></div>
          <p className="text-[#c6ebf9] text-sm lg:text-[17px] leading-[1.6]">
            Monitor. Manage. Maximize. <br className="hidden lg:block" />
            A unified platform to track, manage and <br className="hidden lg:block" />
            optimize your enterprise assets efficiently <br className="hidden lg:block" />
            and securely.
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div 
        className="flex flex-1 flex-col items-center justify-center p-4 sm:p-8 bg-cover bg-center bg-[#f8fafc]"
        style={{ backgroundImage: `url('${process.env.NEXT_PUBLIC_BASE_PATH || ""}/login-bg-right.jpg')` }}
      >
        <div className="w-full max-w-[420px] flex flex-col items-center space-y-8">
          {/* Logo */}
          <div className="h-20 sm:h-24">
            <img 
              src={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/logo.png`} 
              alt="Sheraton Logo" 
              className="h-full object-contain mix-blend-multiply"
            />
          </div>

          {/* Card */}
          <div className="w-full bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100">
            <h2 className="text-[28px] font-bold text-[#1a2332] mb-1">Forgot Password</h2>
            <p className="text-[13px] text-gray-400 mb-8">
              Enter your email address and we will send you a link to reset your password.
            </p>

            {isSuccess ? (
              <div className="text-center space-y-4">
                <div className="p-4 bg-green-50 text-green-600 rounded-xl text-sm font-medium">
                  Check your inbox for a reset link. It might take a few minutes to appear.
                </div>
                <Link href="/login" className="inline-block pt-4 text-sm font-semibold text-[#1B2A4A] hover:underline">
                  Return to Login
                </Link>
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[#1a2332] font-semibold text-[13px]">Email</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400">
                              <User className="h-[18px] w-[18px]" strokeWidth={1.5} />
                            </div>
                            <Input
                              placeholder=""
                              type="email"
                              autoCapitalize="none"
                              autoComplete="email"
                              autoCorrect="off"
                              disabled={isLoading}
                              className="pl-10 h-11 rounded-xl bg-transparent border-gray-200 focus-visible:ring-1 focus-visible:ring-[#1e96f6] shadow-sm text-sm"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="pt-2">
                    <Button 
                      className="w-full bg-[#1B2A4A] hover:bg-[#1B2A4A]/90 text-white rounded-xl h-12 text-[15px] font-semibold transition-all shadow-md" 
                      type="submit" 
                      disabled={isLoading}
                    >
                      {isLoading ? "Sending..." : "Send Reset Link"}
                    </Button>
                  </div>
                  
                  <div className="text-center mt-4 pt-2">
                    <Link href="/login" className="inline-flex items-center text-sm font-semibold text-gray-500 hover:text-[#1a2332] transition-colors">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to login
                    </Link>
                  </div>
                </form>
              </Form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
