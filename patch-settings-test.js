const fs = require('fs');
const file = 'src/app/(dashboard)/settings/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const importRegex = /const \[isFetching, setIsFetching\] = useState\(true\);/;
content = content.replace(
  importRegex,
  `const [isFetching, setIsFetching] = useState(true);\n  const [isTesting, setIsTesting] = useState(false);`
);

const testFunc = `
  const handleTestConnection = async () => {
    try {
      const values = form.getValues();
      if (!values.host || !values.port || !values.user) {
        toast.error("Please fill in Host, Port, and Username before testing.");
        return;
      }
      setIsTesting(true);
      const res = await fetch(\`\${process.env.NEXT_PUBLIC_BASE_PATH || ""}/api/settings/smtp/test\`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to connect");
      }
      
      toast.success("Connection successful! SMTP settings are valid.");
    } catch (error: any) {
      toast.error(error.message || "Connection failed. Please check your settings.");
    } finally {
      setIsTesting(false);
    }
  };
`;

content = content.replace(
  /async function onSubmit\(values: z\.infer<typeof smtpFormSchema>\) \{/,
  testFunc + "\n\n  async function onSubmit(values: z.infer<typeof smtpFormSchema>) {"
);

content = content.replace(
  /onClick=\{[^}]*toast\.info\("Test connection functionality coming soon"\)\}/,
  'onClick={handleTestConnection} disabled={isTesting}'
);

content = content.replace(
  /<RefreshCw className="mr-2 h-5 w-5 text-gray-600" \/>\s*Test Connection/g,
  `{isTesting ? <RefreshCw className="mr-2 h-5 w-5 text-gray-600 animate-spin" /> : <RefreshCw className="mr-2 h-5 w-5 text-gray-600" />}\n                    {isTesting ? "Testing..." : "Test Connection"}`
);

fs.writeFileSync(file, content);
console.log("Done");
