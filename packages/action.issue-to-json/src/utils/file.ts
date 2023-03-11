import * as fs from 'fs';

function mkdir(dirPath: string) {
  const isExists = fs.existsSync(dirPath);
  if (!isExists) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

export function createFile(path: string, data: any) {
  const dateString = new Date().toISOString().slice(0, 10);

  const lastObj = {
    updatedAt: dateString,
  };

  mkdir(path);
  fs.writeFileSync(`${path}/meta.json`, JSON.stringify(lastObj));
  fs.writeFileSync(`${path}/index.json`, JSON.stringify(data));
}
