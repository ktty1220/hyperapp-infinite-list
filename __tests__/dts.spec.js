/*eslint-env jest*/
import path from 'path';
import * as ts from 'typescript';

describe('type error check', () => {
  test('compile check.tsx', () => {
    const program = ts.createProgram([path.join(__dirname, 'check.tsx')], {
      jsx: 'react',
      jsxFactory: 'h',
      strict: true,
      allowSyntheticDefaultImports: true,
      allowUnreachableCode: false,
      allowUnusedLabels: false,
      suppressImplicitAnyIndexErrors: true,
      noImplicitReturns: true,
      noUnusedLocals: true,
      noUnusedParameters: true,
      noFallthroughCasesInSwitch: true,
      forceConsistentCasingInFileNames: true,
      noEmit: true
    });

    const errors = [];
    ts.getPreEmitDiagnostics(program)
      .concat(program.emit().diagnostics)
      .forEach((d) => {
        if (d.file) {
          const { line, character } = d.file.getLineAndCharacterOfPosition(d.start);
          const message = ts.flattenDiagnosticMessageText(d.messageText, '\n');
          errors.push(`${d.file.fileName} (${line + 1},${character + 1}): ${message}`);
        } else {
          errors.push(`${ts.flattenDiagnosticMessageText(d.messageText, '\n')}`);
        }
      });

    expect(errors).toHaveLength(0);
  });
});
