const fs = require('fs');
let file = 'src/components/roles/role-form-dialog.tsx';

let content = fs.readFileSync(file, 'utf8');

// The current layout for groups is:
// <div className="flex flex-wrap gap-x-12 gap-y-8 mt-2">
//   ...
//     <div className="space-y-3.5"> (for permissions)

// We want to change to: groups vertically (flex-col space-y-6), permissions horizontally (flex-row flex-wrap gap-x-6 gap-y-4)

const oldLayout = `<div className="flex flex-wrap gap-x-12 gap-y-8 mt-2">
                                    {Object.entries(groupedPerms).map(([groupName, groupPerms]) => (
                                      <div key={groupName} className="min-w-[140px]">
                                        <h5 className="text-[11px] font-bold text-blue-600 uppercase tracking-wider mb-4">{groupName}</h5>
                                        <div className="space-y-3.5">
                                          {groupPerms.map((p: any) => (
                                            <div key={p.id} className="flex items-center space-x-3">`;

const newLayout = `<div className="flex flex-col space-y-8 mt-2">
                                    {Object.entries(groupedPerms).map(([groupName, groupPerms]) => (
                                      <div key={groupName} className="w-full">
                                        <h5 className="text-[12px] font-bold text-gray-500 uppercase tracking-wider mb-4 border-b pb-2">{groupName}</h5>
                                        <div className="flex flex-wrap gap-x-10 gap-y-4">
                                          {groupPerms.map((p: any) => (
                                            <div key={p.id} className="flex items-center space-x-3 w-[140px]">`;

content = content.replace(oldLayout, newLayout);

fs.writeFileSync(file, content);
console.log("Done");
