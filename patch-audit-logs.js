const fs = require('fs');
const file = 'src/components/audit-logs/audit-log-page.tsx';
let content = fs.readFileSync(file, 'utf8');

// Hide columns on mobile
content = content.replace('<TableHead>User</TableHead>', '<TableHead className="hidden md:table-cell">User</TableHead>');
content = content.replace('<TableHead>Module</TableHead>', '<TableHead className="hidden md:table-cell">Module</TableHead>');
content = content.replace('<TableHead>Action</TableHead>', '<TableHead className="hidden md:table-cell">Action</TableHead>');
content = content.replace('<TableHead>Entity</TableHead>', '<TableHead className="hidden md:table-cell">Entity</TableHead>');
content = content.replace('<TableHead>IP Address</TableHead>', '<TableHead className="hidden md:table-cell">IP Address</TableHead>');

content = content.replace('<TableCell>{log.user?.name || log.userId}</TableCell>', '<TableCell className="hidden md:table-cell">{log.user?.name || log.userId}</TableCell>');
content = content.replace('<TableCell>\n                            <span className="px-2 py-1 bg-slate-100 text-xs font-semibold rounded-md">\n                              {log.module}\n                            </span>\n                          </TableCell>', '<TableCell className="hidden md:table-cell">\n                            <span className="px-2 py-1 bg-slate-100 text-xs font-semibold rounded-md">\n                              {log.module}\n                            </span>\n                          </TableCell>');
content = content.replace('<TableCell className="text-muted-foreground text-sm">{log.ipAddress || \'N/A\'}</TableCell>', '<TableCell className="hidden md:table-cell text-muted-foreground text-sm">{log.ipAddress || \'N/A\'}</TableCell>');

// Actually wait, let's just do it with regex to be safe
content = content.replace(/<TableHead>User<\/TableHead>/g, '<TableHead className="hidden md:table-cell">User</TableHead>');
content = content.replace(/<TableHead>Module<\/TableHead>/g, '<TableHead className="hidden md:table-cell">Module</TableHead>');
content = content.replace(/<TableHead>Action<\/TableHead>/g, '<TableHead className="hidden md:table-cell">Action</TableHead>');
content = content.replace(/<TableHead>Entity<\/TableHead>/g, '<TableHead className="hidden md:table-cell">Entity</TableHead>');
content = content.replace(/<TableHead>IP Address<\/TableHead>/g, '<TableHead className="hidden md:table-cell">IP Address</TableHead>');

// For the cells, let's just find them based on the mapped row:
const oldCells = `<TableCell>{log.user?.name || log.userId}</TableCell>
                          <TableCell>
                            <span className="px-2 py-1 bg-slate-100 text-xs font-semibold rounded-md">
                              {log.module}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={getActionColor(log.action)}>
                              {log.action}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono text-xs">{log.entityId}</TableCell>
                          <TableCell className="text-muted-foreground text-sm">{log.ipAddress || 'N/A'}</TableCell>`;

const newCells = `<TableCell className="hidden md:table-cell">{log.user?.name || log.userId}</TableCell>
                          <TableCell className="hidden md:table-cell">
                            <span className="px-2 py-1 bg-slate-100 text-xs font-semibold rounded-md">
                              {log.module}
                            </span>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <Badge variant="outline" className={getActionColor(log.action)}>
                              {log.action}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden md:table-cell font-mono text-xs">{log.entityId}</TableCell>
                          <TableCell className="hidden md:table-cell text-muted-foreground text-sm">{log.ipAddress || 'N/A'}</TableCell>`;

content = content.replace(oldCells, newCells);

const oldExpandedRow = `<div className="p-4 grid grid-cols-2 gap-4 text-sm font-mono bg-slate-900 text-green-400 rounded-md overflow-x-auto">`;
const newExpandedRow = `<div className="md:hidden py-3 space-y-3 px-2 mb-4">
                                <div className="grid grid-cols-3 gap-2 border-b border-gray-100 pb-2">
                                  <div className="font-semibold text-sm text-[#1B2A4A]">User</div>
                                  <div className="col-span-2 text-sm text-gray-700">{log.user?.name || log.userId}</div>
                                </div>
                                <div className="grid grid-cols-3 gap-2 border-b border-gray-100 pb-2">
                                  <div className="font-semibold text-sm text-[#1B2A4A]">Module</div>
                                  <div className="col-span-2 text-sm text-gray-700"><span className="px-2 py-1 bg-slate-100 text-xs font-semibold rounded-md">{log.module}</span></div>
                                </div>
                                <div className="grid grid-cols-3 gap-2 border-b border-gray-100 pb-2">
                                  <div className="font-semibold text-sm text-[#1B2A4A]">Action</div>
                                  <div className="col-span-2 text-sm text-gray-700"><Badge variant="outline" className={getActionColor(log.action)}>{log.action}</Badge></div>
                                </div>
                                <div className="grid grid-cols-3 gap-2 border-b border-gray-100 pb-2">
                                  <div className="font-semibold text-sm text-[#1B2A4A]">Entity ID</div>
                                  <div className="col-span-2 font-mono text-xs text-gray-700">{log.entityId}</div>
                                </div>
                                <div className="grid grid-cols-3 gap-2 border-b border-gray-100 pb-2">
                                  <div className="font-semibold text-sm text-[#1B2A4A]">IP Address</div>
                                  <div className="col-span-2 text-sm text-gray-700">{log.ipAddress || 'N/A'}</div>
                                </div>
                              </div>
                              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-mono bg-slate-900 text-green-400 rounded-md overflow-x-auto">`;

content = content.replace(oldExpandedRow, newExpandedRow);

fs.writeFileSync(file, content);
console.log("Done");
