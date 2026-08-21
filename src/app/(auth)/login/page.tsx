"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { User, Lock, Eye, EyeOff } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
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
  password: z.string().min(1, { message: "Password is required." }),
});

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: values.email,
        password: values.password,
      });

      if (res?.error) {
        toast.error("Invalid credentials. Please try again.");
      } else {
        toast.success("Login successful");
        router.push("/");
      }
    } catch (error) {
      toast.error("An error occurred during login.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left Side - Hero Section */}
      <div 
        className="hidden md:flex flex-1 flex-col items-start justify-start relative bg-cover bg-center p-12 lg:p-24 pt-32 lg:pt-40" 
        style={{ backgroundImage: `url('${process.env.NEXT_PUBLIC_BASE_PATH || ""}/login-bg-left.jpg')` }}
      >
        <div className="z-10 max-w-lg relative">
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-2">Enterprise</h1>
          <h2 className="text-3xl lg:text-[34px] font-semibold text-[#c6ebf9] mb-6">Asset Management System</h2>
          <div className="h-[2px] w-12 bg-[#1e96f6] mb-8"></div>
          <p className="text-[#c6ebf9] text-base lg:text-[17px] leading-[1.6]">
            Monitor. Manage. Maximize.<br />
            A unified platform to track, manage and<br />
            optimize your enterprise assets efficiently<br />
            and securely.
          </p>
        </div>
      </div>

      {/* Right Side - Login Form */}
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

          {/* Login Card */}
          <div className="w-full bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100">
            <h2 className="text-[28px] font-bold text-[#1a2332] mb-1">Login</h2>
            <p className="text-[13px] text-gray-400 mb-8">
              Enter your email and password to access your account
            </p>

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

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#1a2332] font-semibold text-[13px]">Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400">
                            <Lock className="h-[18px] w-[18px]" strokeWidth={1.5} />
                          </div>
                          <Input
                            placeholder="••••••••••••••••"
                            type={showPassword ? "text" : "password"}
                            autoComplete="current-password"
                            disabled={isLoading}
                            className="pl-10 pr-10 h-11 rounded-xl bg-transparent border-gray-200 focus-visible:ring-1 focus-visible:ring-[#1e96f6] shadow-sm text-sm tracking-widest"
                            {...field}
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-400 hover:text-gray-600 focus:outline-none"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff className="h-[18px] w-[18px]" strokeWidth={1.5} /> : <Eye className="h-[18px] w-[18px]" strokeWidth={1.5} />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex items-center justify-between pt-1 pb-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="remember" className="border-gray-300 rounded-[4px] data-[state=checked]:bg-[#1e96f6] data-[state=checked]:border-[#1e96f6]" />
                    <label
                      htmlFor="remember"
                      className="text-[13px] font-medium leading-none text-gray-500 cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Remember me
                    </label>
                  </div>
                  <Link href="#" className="text-[13px] font-semibold text-[#1e96f6] hover:underline">
                    Forgot Password?
                  </Link>
                </div>

                <div className="pt-2">
                  <Button 
                    className="w-full bg-[#1B2A4A] hover:bg-[#1B2A4A]/90 text-white rounded-xl h-12 text-[15px] font-semibold transition-all shadow-md" 
                    type="submit" 
                    disabled={isLoading}
                  >
                    {isLoading ? "Signing in..." : "Sign in"}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}
