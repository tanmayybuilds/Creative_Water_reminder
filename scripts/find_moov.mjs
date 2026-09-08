import fs from "fs";
import path from "path";

const movPath = path.resolve(process.cwd(), "public/memes/raw/gucci dance transparent og.mov");
const fd = fs.openSync(movPath, "r");
const stat = fs.fstatSync(fd);
const buf = Buffer.alloc(1024 * 1024 * 4); // 4MB chunks
let found = false;

for (let offset = 0; offset < stat.size; offset += 1024 * 1024 * 4 - 8) {
  const bytesRead = fs.readSync(fd, buf, 0, Math.min(buf.length, stat.size - offset), offset);
  const idx = buf.indexOf("moov");
  if (idx !== -1) {
    console.log("Found 'moov' atom at offset:", offset + idx);
    found = true;
    break;
  }
}

if (!found) {
  console.log("No 'moov' atom found in the entire file.");
}
fs.closeSync(fd);
