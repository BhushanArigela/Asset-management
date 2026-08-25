const fs = require('fs');
const file = 'src/components/roles/role-form-dialog.tsx';
let content = fs.readFileSync(file, 'utf8');

const target = `                  />
                </div>
              </div>
            </div>`;

const replacement = `                  />
                </div>
              </div>
              {/* Spacer to fix mobile scroll padding issue */}
              <div className="h-4 md:h-0 w-full shrink-0" />
            </div>`;

if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync(file, content);
  console.log("Done");
} else {
  console.log("Regex failed, checking CRLF...");
  const targetCRLF = target.replace(/\n/g, '\r\n');
  if (content.includes(targetCRLF)) {
    content = content.replace(targetCRLF, replacement.replace(/\n/g, '\r\n'));
    fs.writeFileSync(file, content);
    console.log("Done CRLF");
  } else {
    console.log("Still failed.");
  }
}
