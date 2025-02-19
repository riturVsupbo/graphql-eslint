import { spawnSync } from 'node:child_process';
import { join, relative } from 'node:path';
import { ESLint } from 'eslint';

const ROOT_CWD = process.cwd();

function countErrors(results: ESLint.LintResult[]): number {
  return results.reduce<number>((acc, curr: ESLint.LintResult & { fatalErrorCount: number }) => {
    if (curr.fatalErrorCount > 0) {
      throw new Error('Found fatal error');
    }
    return acc + curr.errorCount;
  }, 0);
}

function getESLintOutput(cwd: string): ESLint.LintResult[] {
  const { stdout, stderr } = spawnSync('eslint', ['.', '--format', 'json'], { cwd });
  const errorOutput = stderr.toString();
  if (errorOutput) {
    throw new Error(errorOutput);
  }
  const output = stdout.toString();
  const start = output.indexOf('[{');
  const end = output.lastIndexOf('}]') + 2;
  return JSON.parse(output.slice(start, end));
}

function testSnapshot(results: ESLint.LintResult[]): void {
  const normalizedResults = results
    .map(result => ({
      filePath: relative(ROOT_CWD, result.filePath),
      messages: result.messages,
    }))
    .filter(result => result.messages.length > 0);

  expect(normalizedResults).toMatchSnapshot();
}

describe('Examples', () => {
  it('should work on `.graphql` files', () => {
    const cwd = join(ROOT_CWD, 'examples/basic');
    const results = getESLintOutput(cwd);
    expect(countErrors(results)).toBe(6);
    testSnapshot(results);
  });

  it('should work on `.js` files', () => {
    const cwd = join(ROOT_CWD, 'examples/code-file');
    const results = getESLintOutput(cwd);
    expect(countErrors(results)).toBe(4);
    testSnapshot(results);
  });

  it('should work with `graphql-config`', () => {
    const cwd = join(ROOT_CWD, 'examples/graphql-config');
    const results = getESLintOutput(cwd);
    expect(countErrors(results)).toBe(2);
    testSnapshot(results);
  });

  it('should work with `graphql-config` on `.js` files', () => {
    const cwd = join(ROOT_CWD, 'examples/graphql-config-code-file');
    const results = getESLintOutput(cwd);
    expect(countErrors(results)).toBe(3);
    testSnapshot(results);
  });

  it('should work with `eslint-plugin-prettier`', () => {
    const cwd = join(ROOT_CWD, 'examples/prettier');
    const results = getESLintOutput(cwd);
    expect(countErrors(results)).toBe(23);
    testSnapshot(results);
  });

  it('should work in monorepo', () => {
    const cwd = join(ROOT_CWD, 'examples/monorepo');
    const results = getESLintOutput(cwd);
    expect(countErrors(results)).toBe(7);
    testSnapshot(results);
  });

  it('should work in svelte', () => {
    const cwd = join(ROOT_CWD, 'examples/svelte-code-file');
    const results = getESLintOutput(cwd);
    expect(countErrors(results)).toBe(2);
    testSnapshot(results);
  });

  it('should work in vue', () => {
    const cwd = join(ROOT_CWD, 'examples/vue-code-file');
    const results = getESLintOutput(cwd);
    expect(countErrors(results)).toBe(2);
    testSnapshot(results);
  });

  it('should work in multiple projects', () => {
    const cwd = join(ROOT_CWD, 'examples/multiple-projects-graphql-config');
    const results = getESLintOutput(cwd);
    expect(countErrors(results)).toBe(4);
    testSnapshot(results);
  });
});
