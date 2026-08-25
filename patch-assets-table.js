const fs = require('fs');
const file = 'src/components/assets/asset-list-page.tsx';

let content = fs.readFileSync(file, 'utf8');

// 1. Add PlusCircle, MinusCircle and useState imports if not present
if (!content.includes('PlusCircle')) {
  content = content.replace(
    'import { Plus, Search, Filter, MoreHorizontal, Upload, Download, Eye, Edit, MapPin, Printer } from "lucide-react";',
    'import { Plus, Search, Filter, MoreHorizontal, Upload, Download, Eye, Edit, MapPin, Printer, PlusCircle, MinusCircle } from "lucide-react";'
  );
}

// 2. Add expandedRows state
if (!content.includes('expandedRows')) {
  content = content.replace(
    'const [isFiltersOpen, setIsFiltersOpen] = useState(false);',
    'const [isFiltersOpen, setIsFiltersOpen] = useState(false);\n  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});\n  const toggleRow = (id: string) => setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));'
  );
}

// 3. Update TableHeader
content = content.replace(
  /<TableHead>Code<\/TableHead>[\s\S]*?<TableHead className="text-right">Actions<\/TableHead>/m,
  `<TableHead>Code</TableHead>
                <TableHead>Photo</TableHead>
                <TableHead className="hidden md:table-cell">Name</TableHead>
                <TableHead className="hidden md:table-cell">Category</TableHead>
                <TableHead className="hidden md:table-cell">Location</TableHead>
                <TableHead className="hidden md:table-cell">Status</TableHead>
                <TableHead className="hidden md:table-cell">Condition</TableHead>
                <TableHead className="text-right">Actions</TableHead>`
);

// 4. Update TableRow in the map
const oldRowStr = `<TableRow key={asset.id}>
                    <TableCell className="font-medium">{asset.assetCode}</TableCell>`;
const newRowStr = `<React.Fragment key={asset.id}>
                    <TableRow>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <button 
                          className="md:hidden focus:outline-none shrink-0"
                          onClick={() => toggleRow(asset.id)}
                        >
                          {expandedRows[asset.id] ? <MinusCircle className="w-[18px] h-[18px] fill-[#ef4444] text-white border-none" /> : <PlusCircle className="w-[18px] h-[18px] fill-[#16a34a] text-white border-none" />}
                        </button>
                        {asset.assetCode}
                      </div>
                    </TableCell>`;
content = content.replace(oldRowStr, newRowStr);

// Add React fragment import if needed
if (!content.includes('import React')) {
  content = content.replace('import { useState', 'import React, { useState');
}

// 5. Hide the cells and Add the sub-row
const oldCellsStr = `<TableCell>{asset.name}</TableCell>
                    <TableCell>{asset.category?.name}</TableCell>
                    <TableCell>
                      {asset.building?.name} {asset.floor?.name ? \`> \${asset.floor.name}\` : ""} {asset.room?.name ? \`> \${asset.room.name}\` : ""}
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
                    </TableCell>`;

const newCellsStr = `<TableCell className="hidden md:table-cell">{asset.name}</TableCell>
                    <TableCell className="hidden md:table-cell">{asset.category?.name}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {asset.building?.name} {asset.floor?.name ? \`> \${asset.floor.name}\` : ""} {asset.room?.name ? \`> \${asset.room.name}\` : ""}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge variant="outline" style={{ borderColor: asset.status?.colorCode, color: asset.status?.colorCode }}>
                        {asset.status?.name}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge variant="outline" style={{ borderColor: asset.condition?.colorCode, color: asset.condition?.colorCode }}>
                        {asset.condition?.name}
                      </Badge>
                    </TableCell>`;

content = content.replace(oldCellsStr, newCellsStr);

// Close the React.Fragment and append the expanded row
const endOfRow = /<\/DropdownMenu>[\s\S]*?<\/TableCell>[\s\S]*?<\/TableRow>/m;
const expandedRowCode = `</DropdownMenu>
                      </TableCell>
                    </TableRow>
                    {expandedRows[asset.id] && (
                      <TableRow className="md:hidden bg-green-50/30">
                        <TableCell colSpan={3}>
                          <div className="py-2 space-y-3 px-2">
                            <div className="grid grid-cols-3 gap-2 border-b border-gray-100 pb-2">
                              <div className="font-semibold text-sm text-[#1B2A4A]">Name</div>
                              <div className="col-span-2 text-sm text-gray-700">{asset.name}</div>
                            </div>
                            <div className="grid grid-cols-3 gap-2 border-b border-gray-100 pb-2">
                              <div className="font-semibold text-sm text-[#1B2A4A]">Category</div>
                              <div className="col-span-2 text-sm text-gray-700">{asset.category?.name}</div>
                            </div>
                            <div className="grid grid-cols-3 gap-2 border-b border-gray-100 pb-2">
                              <div className="font-semibold text-sm text-[#1B2A4A]">Location</div>
                              <div className="col-span-2 text-sm text-gray-700">{asset.building?.name} {asset.floor?.name ? \`> \${asset.floor.name}\` : ""} {asset.room?.name ? \`> \${asset.room.name}\` : ""}</div>
                            </div>
                            <div className="grid grid-cols-3 gap-2 border-b border-gray-100 pb-2">
                              <div className="font-semibold text-sm text-[#1B2A4A]">Status</div>
                              <div className="col-span-2 text-sm text-gray-700">
                                <Badge variant="outline" style={{ borderColor: asset.status?.colorCode, color: asset.status?.colorCode }}>
                                  {asset.status?.name}
                                </Badge>
                              </div>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                              <div className="font-semibold text-sm text-[#1B2A4A]">Condition</div>
                              <div className="col-span-2 text-sm text-gray-700">
                                <Badge variant="outline" style={{ borderColor: asset.condition?.colorCode, color: asset.condition?.colorCode }}>
                                  {asset.condition?.name}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>`;

content = content.replace(endOfRow, expandedRowCode);

fs.writeFileSync(file, content);
console.log("Assets done");
