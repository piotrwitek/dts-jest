import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';
import { JestConfig } from '../definitions';
import { transform_actual } from '../transform-actual';

const transform_fixture = (
  relative_path: string,
  tsconfig: Record<string, ts.CompilerOptionsValue> = {},
  debug = true,
) => {
  const source_filename = path.resolve(__dirname, relative_path);
  const source_text = fs.readFileSync(source_filename, 'utf8');
  const jest_config: JestConfig = {
    rootDir: process.cwd(),
    globals: { _dts_jest_: { tsconfig } },
    _dts_jest_internal_test_: debug,
  };
  return transform_actual(source_text, source_filename, jest_config as any);
};

it('should transform correctly', () => {
  expect(
    transform_fixture('../../fixtures/transform-actual/general.ts'),
  ).toMatchSnapshot();
});

it('should throw error with unattachable expected-comment', () => {
  expect(() =>
    transform_fixture('../../fixtures/transform-actual/unattachable.ts'),
  ).toThrowErrorMatchingSnapshot();
  expect(() =>
    transform_fixture('../../fixtures/transform-actual/unattachable-mix.ts'),
  ).toThrowErrorMatchingSnapshot();
});

it('should transform correctly with group', () => {
  expect(
    transform_fixture('../../fixtures/transform-actual/group.ts'),
  ).toMatchSnapshot();
});

it('should transform correctly with group-only', () => {
  expect(
    transform_fixture('../../fixtures/transform-actual/group-only.ts'),
  ).toMatchSnapshot();
});

it('should transform correctly with multiline-comment', () => {
  expect(
    transform_fixture('../../fixtures/transform-actual/multiline-comment.ts'),
  ).toMatchSnapshot();
});

describe('es6', () => {
  it('should transform correctly', () => {
    expect(
      transform_fixture('../../fixtures/transform-actual/es6.ts'),
    ).toMatchSnapshot();
  });

  it('should transform correctly for ts.transpile', () => {
    const tsconfig = {
      module: 'commonjs',
      target: 'es5',
    };
    expect(
      transform_fixture(
        '../../fixtures/transform-actual/es6.ts',
        tsconfig,
        false,
      ),
    ).toMatchSnapshot();
  });
});
