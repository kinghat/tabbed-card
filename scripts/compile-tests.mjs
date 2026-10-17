import fs from 'node:fs/promises';
import ts from 'typescript';
await fs.mkdir('.test-build', {recursive: true});
await fs.writeFile('.test-build/package.json', '{"type":"module"}\n', 'utf8');
for (const name of ['editor-model', 'tabbed-card-editor']) {
  const source = await fs.readFile(`src/${name}.ts`, 'utf8');
  const result = ts.transpileModule(source, {compilerOptions: {
    target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext,
  }});
  await fs.writeFile(`.test-build/${name}.js`, result.outputText.replace('"./editor-model"', '"./editor-model.js"'), 'utf8');
}
