const fs = require('fs');
const file = 'src/components/audit-logs/audit-log-page.tsx';
let content = fs.readFileSync(file, 'utf8');

// Add pagination state
content = content.replace(
  /const \[actionFilter, setActionFilter\] = useState\("all"\);/,
  `const [actionFilter, setActionFilter] = useState("all");\n  const [page, setPage] = useState(1);\n  const pageSize = 10;`
);

// Reset page on filter change
content = content.replace(
  /fetchLogs\(\);\n    \}, \[moduleFilter, actionFilter\]\);/,
  `setPage(1);\n    fetchLogs();\n    }, [moduleFilter, actionFilter]);`
);

// Slice the logs array
content = content.replace(
  /logs\.map\(\(log\) => \(/,
  `logs.slice((page - 1) * pageSize, page * pageSize).map((log) => (`
);

// Add the pagination footer
const footer = `
            </div>
            
            {logs.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-4 px-2">
                <div className="text-sm text-muted-foreground text-center sm:text-left w-full sm:w-auto">
                  Page {page} of {Math.ceil(logs.length / pageSize) || 1} (Total {logs.length} logs)
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
                    onClick={() => setPage(p => Math.min(Math.ceil(logs.length / pageSize), p + 1))}
                    disabled={page === Math.ceil(logs.length / pageSize) || logs.length === 0}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
`;

content = content.replace(
  /<\/Table>\n            <\/div>\n          <\/CardContent>/,
  `</Table>\n${footer}`
);

fs.writeFileSync(file, content);
console.log("Done");
