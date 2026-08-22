"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from "recharts";
import { 
  ChevronRight, 
  Home, 
  Calendar as CalendarIcon,
  ShieldAlert,
  FileText,
  MapPin,
  Store,
  Users,
  ClipboardCheck,
  ScrollText,
  Clock
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import Link from "next/link";
import { useSession } from "next-auth/react";

// Sheraton Color Palette
const COLORS = ['#22C55E', '#3B82F6', '#C5A55A', '#8B5CF6', '#EF4444', '#F59E0B'];

interface DashboardData {
  totalAssets: number;
  totalAssetValue: number;
  assetsUnderMaintenance: number;
  damagedAssets: number;
  missingAssets: number;
  warrantiesExpiring: number;
  amcsExpiring: number;
  assetsByStatus: { name: string; value: number }[];
  assetsByCondition: { name: string; value: number }[];
  assetsByCategory: { name: string; value: number }[];
  assetsByBuilding: { name: string; value: number }[];
  assetsByDepartment: { name: string; value: number }[];
  totalLocations: number;
  totalVendors: number;
  activeUsers: number;
  pendingAudits: number;
  totalAuditLogs: number;
  overdueTasks: number;
}

export function DashboardPage() {
  const { data: session } = useSession();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/api/dashboard`);
        if (!res.ok) throw new Error("Failed to fetch dashboard data");
        const json = await res.json();
        setData(json);
      } catch (error) {
        toast.error("Error loading dashboard data");
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  if (loading) {
    return <div className="h-full flex items-center justify-center p-8 text-gray-500">Loading dashboard...</div>;
  }

  if (!data) return null;

  const today = new Date();
  const dateFormatted = today.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const userName = session?.user?.name || "Admin";

  const renderCustomBarShape = (props: any) => {
    const { fill, x, y, width, height } = props;
    return (
      <g>
        <rect x={x} y={y} width={width} height={height} fill={fill} rx={4} ry={4} />
      </g>
    );
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto bg-[#F4F7FE] min-h-screen">
      
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold text-[#1B2A4A] tracking-tight">
            Welcome back, {userName}! 👋
          </h1>
          <p className="text-[15px] text-gray-500 mt-1">Here's what's happening with your assets today.</p>
          
          <div className="flex items-center gap-2 mt-4 text-sm text-gray-500 font-medium">
            <Home className="w-4 h-4" />
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-[#1B2A4A] font-semibold">Dashboard</span>
          </div>
        </div>
        
        <div className="flex items-center bg-white px-4 py-2.5 rounded-lg border border-gray-200 shadow-sm cursor-pointer hover:bg-gray-50 transition-colors text-sm font-semibold text-[#1B2A4A] gap-2">
          <CalendarIcon className="w-4 h-4 text-gray-500" />
          {dateFormatted}
          <ChevronRight className="w-4 h-4 text-gray-400 rotate-90 ml-1" />
        </div>
      </div>

      {/* Top Cards Row 1 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Total Assets */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <img src={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/icon-assets.png`} alt="Total Assets" className="w-[56px] h-[56px] object-contain rounded-[14px]" />
              <div>
                <p className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-1">Total Assets</p>
                <h3 className="text-3xl font-extrabold text-[#1B2A4A]">{data.totalAssets}</h3>
              </div>
            </div>
          </div>
          <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
            <Link href="/assets" className="text-sm font-medium text-gray-500 hover:text-[#1B2A4A] transition-colors">View all assets</Link>
            <Link href="/assets" className="w-6 h-6 rounded-full border border-blue-200 flex items-center justify-center text-blue-500 hover:bg-blue-50 transition-colors">
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Total Value */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <img src={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/icon-value.png`} alt="Total Value" className="w-[56px] h-[56px] object-contain rounded-[14px]" />
              <div>
                <p className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-1">Total Value</p>
                <h3 className="text-2xl font-extrabold text-[#1B2A4A] truncate max-w-[140px]" title={formatCurrency(data.totalAssetValue)}>
                  {formatCurrency(data.totalAssetValue)}
                </h3>
              </div>
            </div>
          </div>
          <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
            <Link href="/reports" className="text-sm font-medium text-gray-500 hover:text-[#1B2A4A] transition-colors">View asset value</Link>
            <Link href="/reports" className="w-6 h-6 rounded-full border border-green-200 flex items-center justify-center text-green-500 hover:bg-green-50 transition-colors">
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Under Maintenance */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <img src={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/icon-maintenance.png`} alt="Under Maintenance" className="w-[56px] h-[56px] object-contain rounded-[14px]" />
              <div>
                <p className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-1">Under Maintenance</p>
                <h3 className="text-3xl font-extrabold text-[#1B2A4A]">{data.assetsUnderMaintenance}</h3>
              </div>
            </div>
          </div>
          <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
            <Link href="/maintenance" className="text-sm font-medium text-gray-500 hover:text-[#1B2A4A] transition-colors">View maintenance</Link>
            <Link href="/maintenance" className="w-6 h-6 rounded-full border border-yellow-200 flex items-center justify-center text-yellow-500 hover:bg-yellow-50 transition-colors">
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Damaged Assets */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <img src={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/icon-damaged.png`} alt="Damaged Assets" className="w-[56px] h-[56px] object-contain rounded-[14px]" />
              <div>
                <p className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-1">Damaged Assets</p>
                <h3 className="text-3xl font-extrabold text-red-600">{data.damagedAssets}</h3>
              </div>
            </div>
          </div>
          <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
            <Link href="/assets" className="text-sm font-medium text-gray-500 hover:text-[#1B2A4A] transition-colors">View damaged assets</Link>
            <Link href="/assets" className="w-6 h-6 rounded-full border border-red-200 flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors">
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

      </div>

      {/* Top Cards Row 2 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Missing Assets */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-[56px] h-[56px] bg-[#FF9500] rounded-[14px] flex items-center justify-center shadow-sm">
                <ShieldAlert className="text-white w-7 h-7" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-1">Missing Assets</p>
                <h3 className="text-3xl font-extrabold text-[#1B2A4A]">{data.missingAssets}</h3>
              </div>
            </div>
          </div>
          <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
            <Link href="/assets" className="text-sm font-medium text-gray-500 hover:text-[#1B2A4A] transition-colors">View missing assets</Link>
            <Link href="/assets" className="w-6 h-6 rounded-full border border-orange-200 flex items-center justify-center text-orange-500 hover:bg-orange-50 transition-colors">
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Warranties Expiring */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-[56px] h-[56px] bg-[#00B4A8] rounded-[14px] flex items-center justify-center shadow-sm">
                <FileText className="text-white w-7 h-7" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-1">Warranties Expiring (30D)</p>
                <h3 className="text-3xl font-extrabold text-[#1B2A4A]">{data.warrantiesExpiring}</h3>
              </div>
            </div>
          </div>
          <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
            <Link href="/reports" className="text-sm font-medium text-gray-500 hover:text-[#1B2A4A] transition-colors">View warranties</Link>
            <Link href="/reports" className="w-6 h-6 rounded-full border border-teal-200 flex items-center justify-center text-teal-500 hover:bg-teal-50 transition-colors">
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* AMCs Expiring */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-[56px] h-[56px] bg-[#AF52DE] rounded-[14px] flex items-center justify-center shadow-sm">
                <FileText className="text-white w-7 h-7" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-1">AMCs Expiring (30D)</p>
                <h3 className="text-3xl font-extrabold text-[#1B2A4A]">{data.amcsExpiring}</h3>
              </div>
            </div>
          </div>
          <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
            <Link href="/reports" className="text-sm font-medium text-gray-500 hover:text-[#1B2A4A] transition-colors">View AMCs</Link>
            <Link href="/reports" className="w-6 h-6 rounded-full border border-purple-200 flex items-center justify-center text-purple-500 hover:bg-purple-50 transition-colors">
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Promo Banner */}
        <div className="bg-[#f0f5ff] rounded-2xl p-5 shadow-sm border border-blue-100 flex flex-col justify-center relative overflow-hidden">
          <div className="z-10 relative">
            <h4 className="text-[17px] font-bold text-[#1B2A4A] mb-1">Keep Your Assets Healthy</h4>
            <p className="text-xs text-[#1B2A4A]/70 mb-4 max-w-[180px]">Schedule regular maintenance to extend asset life cycle.</p>
            <Link href="/maintenance/new" className="inline-block bg-[#1B2A4A] text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-[#1B2A4A]/90 transition-colors">
              Schedule Now
            </Link>
          </div>
          <div className="absolute right-0 bottom-0 top-0 w-1/3 flex items-center justify-end pr-2 opacity-80 pointer-events-none">
            {/* Simple calendar illustration icon placeholder */}
            <div className="relative">
              <div className="w-16 h-16 bg-white rounded-xl border-t-8 border-blue-500 shadow-sm relative -rotate-6"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-blue-500 bg-white rounded-full p-1 shadow-md">
                <Clock className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Charts Section */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-7">
        
        {/* Assets by Category */}
        <Card className="col-span-4 rounded-2xl border-gray-100 shadow-sm overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-6 pt-6 px-6">
            <CardTitle className="text-lg font-bold text-[#1B2A4A]">Assets by Category</CardTitle>
            <div className="text-sm border rounded-md px-3 py-1.5 font-medium text-gray-600 bg-gray-50 flex items-center gap-1 cursor-pointer">
              Top 10 Categories <ChevronRight className="w-3.5 h-3.5 rotate-90" />
            </div>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.assetsByCategory} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={120} tick={{ fontSize: 13, fill: '#64748b', fontWeight: 500 }} />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="value" fill="#004ae1" radius={[0, 4, 4, 0]} barSize={16} shape={renderCustomBarShape} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Assets by Status */}
        <Card className="col-span-3 rounded-2xl border-gray-100 shadow-sm overflow-hidden">
          <CardHeader className="pb-6 pt-6 px-6">
            <CardTitle className="text-lg font-bold text-[#1B2A4A]">Assets by Status</CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="h-[250px] flex items-center w-full">
              {/* Left side: Pie Chart */}
              <div className="w-[220px] shrink-0 h-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.assetsByStatus}
                      cx="50%"
                      cy="50%"
                      innerRadius={75}
                      outerRadius={105}
                      paddingAngle={2}
                      dataKey="value"
                      stroke="none"
                    >
                      {data.assetsByStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      itemStyle={{ color: '#1B2A4A', fontWeight: 600 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Inner Text - Perfectly centered within the left fixed child */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-4xl font-extrabold text-[#1B2A4A] leading-none">{data.totalAssets}</span>
                  <span className="text-sm font-medium text-gray-500 mt-1">Total</span>
                </div>
              </div>
              
              {/* Right side: Custom Legend */}
              <div className="flex-1 flex flex-col gap-3 justify-center pl-10">
                {data.assetsByStatus.map((entry, index) => {
                  const percentage = ((entry.value / data.totalAssets) * 100).toFixed(1);
                  return (
                    <div key={entry.name} className="flex items-center justify-between text-[13px]">
                      <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                        <span className="font-medium text-gray-700 truncate max-w-[140px]" title={entry.name}>{entry.name}</span>
                      </div>
                      <span className="text-gray-500 whitespace-nowrap ml-2">{entry.value} ({percentage}%)</span>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-50">
              <Link href="/reports" className="text-[#3B82F6] text-sm font-bold flex items-center hover:underline">
                View Full Report <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Quick Overview Row */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-[#1B2A4A] mb-5">Quick Overview</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-800">Locations</p>
              <h4 className="text-xl font-extrabold text-[#1B2A4A] leading-tight">{data.totalLocations}</h4>
              <p className="text-[10px] text-gray-500">Total Locations</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-500">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-800">Vendors</p>
              <h4 className="text-xl font-extrabold text-[#1B2A4A] leading-tight">{data.totalVendors}</h4>
              <p className="text-[10px] text-gray-500">Total Vendors</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center text-yellow-500">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-800">Active Users</p>
              <h4 className="text-xl font-extrabold text-[#1B2A4A] leading-tight">{data.activeUsers}</h4>
              <p className="text-[10px] text-gray-500">Active Users</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-500">
              <ClipboardCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-800">Asset Audits</p>
              <h4 className="text-xl font-extrabold text-[#1B2A4A] leading-tight">{data.pendingAudits}</h4>
              <p className="text-[10px] text-gray-500">Pending Audits</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center text-teal-500">
              <ScrollText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-800">Audit Logs</p>
              <h4 className="text-xl font-extrabold text-[#1B2A4A] leading-tight">{data.totalAuditLogs}</h4>
              <p className="text-[10px] text-gray-500">Total Logs</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center text-red-500">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-800">Overdue Tasks</p>
              <h4 className="text-xl font-extrabold text-[#1B2A4A] leading-tight">{data.overdueTasks}</h4>
              <p className="text-[10px] text-gray-500">Tasks</p>
            </div>
          </div>

        </div>
      </div>
      
    </div>
  );
}
