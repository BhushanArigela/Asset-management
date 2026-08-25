const fs = require('fs');
const file = 'src/components/ui/data-table.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace the start of pagination div
content = content.replace(
  '<div className="flex items-center justify-between py-4">',
  '{!hideToolbar && (<div className="flex flex-col sm:flex-row sm:items-center justify-between py-4 gap-4">'
);

// Replace the end of pagination div
content = content.replace(
  'Next\n          </Button>\n        </div>\n      </div>\n      </CardContent>\n    </Card>',
  'Next\n          </Button>\n        </div>\n      </div>)}\n      </CardContent>\n    </Card>'
);

fs.writeFileSync(file, content);
console.log("Done");
