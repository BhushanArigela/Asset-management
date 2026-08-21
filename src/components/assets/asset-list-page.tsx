"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Plus, Download, Upload, Search, MoreHorizontal, 
  Eye, Edit, ArrowRightLeft, Wrench, QrCode, Trash2 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { QrCodeModal } from "./qr-modal";
import { useSession } from "next-auth/react";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";

interface Asset {
  id: string;
  assetCode: string;
  name: string;
  category: { name: string };
  building: { name: string };
  floor: { name: string };
  room?: { name: string };
  department?: { name: string };
  status: { name: string; colorCode?: string };
  condition: { name: string; colorCode?: string };
  assetDocuments?: { filePath: string }[];
  imageUrl?: string;
}

export function AssetListPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);

  const [qrModalAssetId, setQrModalAssetId] = useState<string | null>(null);

  const canCreateMaintenance = hasPermission(session?.user?.permissions, [PERMISSIONS.CREATE_MAINTENANCE] as any);
  const canDeleteAsset = hasPermission(session?.user?.permissions, [PERMISSIONS.ASSETS_DELETE] as any);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["assets", page, debouncedSearch],
    queryFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/api/assets?page=${page}&limit=10&search=${debouncedSearch}`);
      if (!res.ok) throw new Error("Failed to fetch assets");
      return res.json();
    },
  });

  const assets: Asset[] = data?.data || [];
  const totalPages = data?.pagination?.totalPages || 1;

  const handleExport = () => {
    toast.success("Export started");
    window.open(`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/api/assets/export?search=${debouncedSearch}`, "_blank");
  };

  const handleDelete = async (assetId: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this asset? This will also remove its entire history (movements, audits, etc.) and cannot be undone.")) {
      return;
    }
    
    try {
      const res = await fetch(`/api/assets/${assetId}`, {
        method: "DELETE",
      });
      const resData = await res.json();
      
      if (res.ok) {
        toast.success("Asset deleted successfully");
        queryClient.invalidateQueries({ queryKey: ["assets"] });
      } else {
        toast.error(resData.error || "Failed to delete asset");
      }
    } catch (error) {
      toast.error("An error occurred while deleting the asset");
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-3xl font-bold tracking-tight">Assets</h2>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <Button variant="outline" onClick={() => router.push("/assets/import")} className="flex-1 sm:flex-none">
            <Download className="mr-2 h-4 w-4" />
            Import
          </Button>
          <Button variant="outline" onClick={handleExport} className="flex-1 sm:flex-none">
            <Upload className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button onClick={() => router.push("/assets/new")} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" /> Register Asset
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-1 items-center space-x-2">
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search assets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Photo</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Condition</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center h-24">
                    Loading assets...
                  </TableCell>
                </TableRow>
              ) : isError ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-red-500 h-24">
                    Failed to load assets.
                  </TableCell>
                </TableRow>
              ) : assets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground h-24">
                    No assets found.
                  </TableCell>
                </TableRow>
              ) : (
                assets.map((asset) => (
                  <TableRow key={asset.id}>
                    <TableCell className="font-medium">{asset.assetCode}</TableCell>
                    <TableCell>
                      {asset.imageUrl ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={asset.imageUrl ? `${process.env.NEXT_PUBLIC_BASE_PATH || ""}${asset.imageUrl}` : undefined} alt="Asset" className="h-10 w-10 object-cover rounded-md border" />
                      ) : asset.assetDocuments && asset.assetDocuments.length > 0 ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={asset.assetDocuments[0]?.filePath ? `${process.env.NEXT_PUBLIC_BASE_PATH || ""}${asset.assetDocuments[0].filePath}` : undefined} alt="Asset" className="h-10 w-10 object-cover rounded-md border" />
                      ) : (
                        <div className="h-10 w-10 bg-muted rounded-md border flex items-center justify-center text-xs text-muted-foreground">No img</div>
                      )}
                    </TableCell>
                    <TableCell>{asset.name}</TableCell>
                    <TableCell>{asset.category?.name}</TableCell>
                    <TableCell>
                      {asset.building?.name} {asset.floor?.name ? `> ${asset.floor.name}` : ""} {asset.room?.name ? `> ${asset.room.name}` : ""}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" style={{ borderColor: asset.status?.colorCode, color: asset.status?.colorCode }}>
                        {asset.status?.name}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" style={{ borderColor: asset.condition?.colorCode, color: asset.condition?.colorCode }}>
                        {asset.condition?.name}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => router.push(`/assets/${asset.id}`)}>
                            <Eye className="mr-2 h-4 w-4" /> View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => router.push(`/assets/${asset.id}/edit`)}>
                            <Edit className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => router.push(`/movements/new?assetId=${asset.id}`)}>
                            <ArrowRightLeft className="mr-2 h-4 w-4" /> Transfer
                          </DropdownMenuItem>
                          {canCreateMaintenance && (
                            <DropdownMenuItem onClick={() => router.push(`/maintenance/new?assetId=${asset.id}`)}>
                              <Wrench className="mr-2 h-4 w-4" /> Maintenance
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => setQrModalAssetId(asset.id)}>
                            <QrCode className="mr-2 h-4 w-4" /> Print QR
                          </DropdownMenuItem>
                          {canDeleteAsset && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleDelete(asset.id)}
                                className="text-red-600 focus:text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" /> Delete Asset
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {!isLoading && !isError && totalPages > 1 && (
            <CardFooter className="flex flex-col sm:flex-row items-center justify-between py-4 gap-4">
              <div className="text-sm text-muted-foreground text-center sm:text-left w-full sm:w-auto">
                Page {page} of {totalPages} (Total {data?.pagination?.total || 0} assets)
              </div>
              <div className="flex items-center space-x-2 w-full sm:w-auto justify-center sm:justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            </CardFooter>
          )}
        </CardContent>
      </Card>
      
      <QrCodeModal 
        assetId={qrModalAssetId} 
        isOpen={!!qrModalAssetId} 
        onClose={() => setQrModalAssetId(null)} 
      />
    </div>
  );
}
