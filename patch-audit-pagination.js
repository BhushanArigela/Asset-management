const fs = require('fs');
const file = 'src/components/audits/audit-list-page.tsx';
let content = fs.readFileSync(file, 'utf8');

const target = `<div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Showing {(page - 1) * 10 + 1} to {Math.min(page * 10, total)} of {total} entries
                </div>
                <div className="flex items-center space-x-2">`;

const replacement = `<div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-4">
                <div className="text-sm text-muted-foreground text-center sm:text-left w-full sm:w-auto">
                  Page {page} of {totalPages || 1} (Total {total} audits)
                </div>
                <div className="flex items-center space-x-2 w-full sm:w-auto justify-center sm:justify-end">`;

// Using Regex to ignore potential whitespace/newline differences
const targetRegex = /<div className="flex items-center justify-between mt-4">\s*<div className="text-sm text-muted-foreground">\s*Showing \{\(page - 1\) \* 10 \+ 1\} to \{Math\.min\(page \* 10, total\)\} of \{total\} entries\s*<\/div>\s*<div className="flex items-center space-x-2">/;

if (targetRegex.test(content)) {
    content = content.replace(targetRegex, replacement);
    fs.writeFileSync(file, content);
    console.log("Done");
} else {
    console.log("Failed to match regex");
}
