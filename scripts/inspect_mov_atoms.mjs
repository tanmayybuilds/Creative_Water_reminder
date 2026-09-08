import fs from "fs";
import path from "path";

const movPath = path.resolve(process.cwd(), "public/memes/raw/gucci dance transparent og.mov");
const fd = fs.openSync(movPath, "r");
const stat = fs.fstatSync(fd);
console.log("File size:", stat.size);

const header = Buffer.alloc(256);
fs.readSync(fd, header, 0, 256, 0);
console.log("Header hex:", header.slice(0, 32).toString("hex"));
console.log("Header ascii:", header.slice(0, 64).toString("ascii").replace(/[^\x20-\x7E]/g, "."));

const tail = Buffer.alloc(256);
fs.readSync(fd, tail, 0, 256, Math.max(0, stat.size - 256));
console.log("Tail hex:", tail.slice(-32).toString("hex"));
console.log("Tail ascii:", tail.slice(-64).toString("ascii").replace(/[^\x20-\x7E]/g, "."));

fs.closeSync(fd);
