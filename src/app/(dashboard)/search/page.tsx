import { AssetSearch } from "@/components/assets/asset-search";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search Assets | Sheraton Asset Management",
};

export default async function SearchPage(props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const searchParams = await props.searchParams;
  const initialQuery = (searchParams.q || searchParams.roomCode || searchParams.search || "") as string;

  return (
    <div className="container mx-auto p-4 md:p-8">
      <AssetSearch initialQuery={initialQuery} />
    </div>
  );
}
