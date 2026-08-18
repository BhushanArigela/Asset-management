import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CategoryTab } from "@/components/masters/classifications/category-tab";
import { SubCategoryTab } from "@/components/masters/classifications/sub-category-tab";
import { BrandTab } from "@/components/masters/classifications/brand-tab";
import { ConditionTab } from "@/components/masters/classifications/condition-tab";
import { StatusTab } from "@/components/masters/classifications/status-tab";

export const metadata = {
  title: "Classifications Master - Sheraton Asset Management",
};

export default function ClassificationsPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-[#1B2A4A]">Classifications Master</h2>
      </div>
      <Tabs defaultValue="categories" className="space-y-4">
        <TabsList>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="sub-categories">Sub-Categories</TabsTrigger>
          <TabsTrigger value="brands">Brands</TabsTrigger>
          <TabsTrigger value="conditions">Conditions</TabsTrigger>
          <TabsTrigger value="statuses">Statuses</TabsTrigger>
        </TabsList>
        <TabsContent value="categories" className="space-y-4">
          <CategoryTab />
        </TabsContent>
        <TabsContent value="sub-categories" className="space-y-4">
          <SubCategoryTab />
        </TabsContent>
        <TabsContent value="brands" className="space-y-4">
          <BrandTab />
        </TabsContent>
        <TabsContent value="conditions" className="space-y-4">
          <ConditionTab />
        </TabsContent>
        <TabsContent value="statuses" className="space-y-4">
          <StatusTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
