import { CompanyTab } from "@/components/masters/locations/company-tab";
import { BuildingTab } from "@/components/masters/locations/building-tab";
import { FloorTab } from "@/components/masters/locations/floor-tab";
import { RoomTab } from "@/components/masters/locations/room-tab";
import { DepartmentTab } from "@/components/masters/locations/department-tab";
import { TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RoutedTabs } from "@/components/ui/routed-tabs";

export const metadata = {
  title: "Locations Master - Sheraton Asset Management",
};

export default function LocationsPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-[#1B2A4A]">Locations Master</h2>
      </div>
      <RoutedTabs defaultValue="companies" className="space-y-4 w-full">
        <div className="w-full overflow-x-auto pb-2">
          <TabsList className="inline-flex w-max min-w-full justify-start">
            <TabsTrigger value="companies">Companies</TabsTrigger>
            <TabsTrigger value="buildings">Buildings</TabsTrigger>
            <TabsTrigger value="floors">Floors</TabsTrigger>
            <TabsTrigger value="rooms">Rooms</TabsTrigger>
            <TabsTrigger value="departments">Departments</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="companies" className="space-y-4">
          <CompanyTab />
        </TabsContent>
        <TabsContent value="buildings" className="space-y-4">
          <BuildingTab />
        </TabsContent>
        <TabsContent value="floors" className="space-y-4">
          <FloorTab />
        </TabsContent>
        <TabsContent value="rooms" className="space-y-4">
          <RoomTab />
        </TabsContent>
        <TabsContent value="departments" className="space-y-4">
          <DepartmentTab />
        </TabsContent>
      </RoutedTabs>
    </div>
  );
}
