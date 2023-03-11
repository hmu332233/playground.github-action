import * as fs from 'fs';

function mkdir(dirPath: string) {
  const isExists = fs.existsSync(dirPath);
  if (!isExists) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

export function createJsonFile(path: string, data: any) {
  const dateString = new Date().toISOString().slice(0, 10);

  const lastObj = {
    updatedAt: dateString,
  };

  mkdir(path);
  fs.writeFileSync(`${path}/meta.json`, JSON.stringify(lastObj));
  fs.writeFileSync(`${path}/index.json`, JSON.stringify(data));
}

export function readJsonFile(path: string) {
  return JSON.parse(fs.readFileSync(`${path}/index.json`, 'utf8'));
}
