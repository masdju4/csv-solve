import { readFileSync, openSync, writeSync, closeSync } from 'node:fs';
import { join } from 'node:path';
import { setFlagsFromString } from 'node:v8';

setFlagsFromString('--no-incremental-marking');
setFlagsFromString('--always-turbofan');

const { run } = await import('./solve.js');

const inputDir = process.env.MAKEFUN_INPUT_DIR ?? '/input';
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

const cases = JSON.parse(readFileSync(join(inputDir, 'cases.json'), 'utf8'));

const fd = openSync(join(outputDir, 'answers.json'), 'w');
writeSync(fd, '[');
let first = true;
for (const c of cases) {
  const s = JSON.stringify(run(c.input));
  writeSync(fd, first ? s : ',' + s);
  first = false;
}
writeSync(fd, ']');
closeSync(fd);
