import fs from 'fs';

const filePath = 'd:/projects/threadly/Server_typescript_migration/server/src/repo/adminRepo.ts';
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(
  'deleteStory\n};',
  'deleteStory,\n  getSinglePost\n};'
);

fs.writeFileSync(filePath, content, 'utf8');
console.log("Successfully patched adminRepo.ts for export");
