const fs = require('fs');
let code = fs.readFileSync('src/components/audits/audit-list-page.tsx', 'utf8');

// Replace state variables and fetch effect
const newState = \
  const [audits, setAudits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    async function fetchAudits() {
      try {
        const params = new URLSearchParams();
        if (statusFilter !== "all") params.append("status", statusFilter);
        if (search) params.append("search", search);
        params.append("page", page.toString());
        params.append("limit", "10");
        
        const res = await fetch(\\/api/audits?\\);
        if (!res.ok) throw new Error("Failed to load audits");
        const json = await res.json();
        if (json.data && json.pagination) {
          setAudits(json.data);
          setTotalPages(json.pagination.totalPages);
          setTotal(json.pagination.total);
        } else {
          // fallback if api not updated yet
          setAudits(Array.isArray(json) ? json : []);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    
    const timeoutId = setTimeout(() => {
      fetchAudits();
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [statusFilter, search, page]);
\;

code = code.replace(
  /const \[audits, setAudits\] = useState<any\[\]>\(\[\]\);[\s\S]*?\}, \[statusFilter\]\);/m,
  newState
);

// Add search input
const filterDiv = \
        <div className="flex gap-2 items-center">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search audits..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-8 w-[250px]"
            />
          </div>
          <Select value={statusFilter} onValueChange={(val) => { setStatusFilter(val); setPage(1); }}>
\;

code = code.replace(
  /<div className="flex gap-2 items-center">\s*<Select value={statusFilter} onValueChange={setStatusFilter}>/m,
  filterDiv
);

// Add pagination
const paginationStr = \
          </Table>
          
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Showing {(page - 1) * 10 + 1} to {Math.min(page * 10, total)} of {total} entries
            </div>
            <div className="flex items-center space-x-2">
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
                disabled={page === totalPages || totalPages === 0}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
\;

code = code.replace(
  /<\/Table>\s*<\/CardContent>/m,
  paginationStr
);

fs.writeFileSync('src/components/audits/audit-list-page.tsx', code);
