import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

export function loadScripts(scriptPaths, context = {}) {
  vm.createContext(context);
  for (const scriptPath of scriptPaths) {
    const filename = path.join(__dirname, '..', scriptPath);
    const script = fs.readFileSync(filename, { encoding: 'utf-8' });
    vm.runInContext(script, context, filename);
  }
  return context;
}
