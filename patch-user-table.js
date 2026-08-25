const fs = require('fs');
const file = 'src/components/users/user-list-page.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  '<DataTable columns={columns} data={users} />',
  '<DataTable columns={columns} data={users} hideToolbar={true} />'
);

fs.writeFileSync(file, content);
console.log("Done");
