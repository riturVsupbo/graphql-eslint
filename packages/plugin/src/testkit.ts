import { readFileSync } from 'fs';
import { resolve } from 'path';
import { codeFrameColumns } from '@babel/code-frame';
import { AST, Linter, Rule, RuleTester } from 'eslint';
import { ASTKindToNode } from 'graphql';
import { GraphQLESTreeNode } from './estree-converter/index.js';
import { GraphQLESLintRule, ParserOptions } from './types.js';

export type GraphQLESLintRuleListener<WithTypeInfo extends boolean = false> = Record<
  string,
  any
> & {
  [K in keyof ASTKindToNode]?: (node: GraphQLESTreeNode<ASTKindToNode[K], WithTypeInfo>) => void;
};

export type GraphQLValidTestCase<Options = []> = Omit<
  RuleTester.ValidTestCase,
  'options' | 'parserOptions'
> & {
  options?: Options;
  parserOptions?: Omit<ParserOptions, 'filePath'>;
};

export type GraphQLInvalidTestCase<T = []> = GraphQLValidTestCase<T> & {
  errors: (RuleTester.TestCaseError | string)[] | number;
  output?: string | null;
};

function indentCode(code: string, indent = 4): string {
  return code.replace(/^/gm, ' '.repeat(indent));
}

// A simple version of `SourceCodeFixer.applyFixes`
// https://github.com/eslint/eslint/issues/14936#issuecomment-906746754
function applyFix(code: string, { range, text }: Rule.Fix): string {
  return [code.slice(0, range[0]), text, code.slice(range[1])].join('');
}

type RuleTesterConfig = {
  parser: string;
  parserOptions: Omit<ParserOptions, 'filePath'>;
};

export class GraphQLRuleTester extends RuleTester {
  config: RuleTesterConfig;

  constructor(parserOptions: Omit<ParserOptions, 'filePath'> = {}) {
    const config = {
      parser: require.resolve('@graphql-eslint/eslint-plugin'),
      parserOptions: {
        ...parserOptions,
        skipGraphQLConfig: true,
      },
    };
    super(config);
    this.config = config;
  }

  fromMockFile(path: string): string {
    return readFileSync(resolve(__dirname, `../tests/mocks/${path}`), 'utf-8');
  }

  runGraphQLTests<Options, WithTypeInfo extends boolean = false>(
    ruleId: string,
    rule: GraphQLESLintRule<Options, WithTypeInfo>,
    tests: {
      valid: (GraphQLValidTestCase<Options> | string)[];
      invalid: GraphQLInvalidTestCase<Options>[];
    },
  ): void {
    super.run(ruleId, rule as any, tests);
    const linter = new Linter();
    linter.defineRule(ruleId, rule as any);

    const hasOnlyTest = [...tests.valid, ...tests.invalid].some(
      t => typeof t !== 'string' && t.only,
    );

    // for (const [index, testCase] of tests.valid.entries()) {
    //   const { name, code, filename, only }: RuleTester.ValidTestCase =
    //     typeof testCase === 'string' ? { code: testCase } : testCase;
    //
    //   if (hasOnlyTest && !only) {
    //     continue;
    //   }
    //
    //   const verifyConfig = getVerifyConfig<Options>(ruleId, this.config, testCase);
    //   defineParser(linter, verifyConfig.parser);
    //
    //   const messages = linter.verify(code, verifyConfig, { filename });
    //   const codeFrame = printCode(code, { line: 0, column: 0 });
    //
    //   it(name || `Valid #${index + 1}\n${codeFrame}`, () => {
    //     expect(messages).toEqual([]);
    //   });
    // }

    for (const [idx, testCase] of tests.invalid.entries()) {
      const { only, filename, options, name } = testCase;
      if (hasOnlyTest && !only) {
        continue;
      }

      const code = removeTrailingBlankLines(testCase.code);
      const verifyConfig = getVerifyConfig<Options>(ruleId, this.config, testCase);
      defineParser(linter, verifyConfig.parser);

      const messages = linter.verify(code, verifyConfig, filename);
      if (messages.length === 0) {
        throw new Error('Invalid case should have at least one error.');
      }
      const codeFrame = indentCode(printCode(code, { line: 0, column: 0 }));
      const messageForSnapshot = ['#### ⌨️ Code', codeFrame];

      if (options) {
        const opts = JSON.stringify(options, null, 2).slice(1, -1);
        messageForSnapshot.push('#### ⚙️ Options', indentCode(removeTrailingBlankLines(opts), 2));
      }

      for (const [index, message] of messages.entries()) {
        if (message.fatal) {
          throw new Error(message.message);
        }

        const codeWithMessage = printCode(code, message, 1);
        messageForSnapshot.push(
          printWithIndex('#### ❌ Error', index, messages.length),
          indentCode(codeWithMessage),
        );

        // Don't print suggestions in snapshots for too big codes
        if (message.suggestions && (code.match(/\n/g) || '').length < 1000) {
          for (const [i, suggestion] of message.suggestions.entries()) {
            const title = printWithIndex(
              '#### 💡 Suggestion',
              i,
              message.suggestions.length,
              suggestion.desc,
            );
            const output = applyFix(code, suggestion.fix);
            const codeFrame = printCode(output, { line: 0, column: 0 });
            messageForSnapshot.push(title, indentCode(codeFrame, 2));
          }
        }
      }

      if (rule.meta.fixable) {
        const { fixed, output } = linter.verifyAndFix(code, verifyConfig, filename);
        if (fixed) {
          messageForSnapshot.push('#### 🔧 Autofix output', indentCode(printCode(output)));
        }
      }
      it(name || `Invalid #${idx + 1}`, () => {
        expect(messageForSnapshot.join('\n\n')).toMatchSnapshot();
      });
    }
  }
}

function removeTrailingBlankLines(text: string): string {
  return text.replace(/^\s*\n/, '').trimEnd();
}

function printWithIndex(title: string, index: number, total: number, description?: string): string {
  if (total > 1) {
    title += ` ${index + 1}/${total}`;
  }
  if (description) {
    title += `: ${description}`;
  }
  return title;
}

function getVerifyConfig<Options>(
  ruleId: string,
  testerConfig: RuleTesterConfig,
  testCase: GraphQLInvalidTestCase<Options>,
): Omit<Linter.Config, 'parser'> & { parser: string } {
  const { parser = testerConfig.parser, parserOptions, options } = testCase;

  return {
    ...testerConfig,
    parser,
    parserOptions: {
      ...testerConfig.parserOptions,
      ...parserOptions,
    },
    rules: {
      [ruleId]: Array.isArray(options) ? ['error', ...options] : 'error',
    },
  };
}

const parsers = new WeakMap();

function defineParser(linter: Linter, parser: string): void {
  if (!parser) {
    return;
  }
  if (!parsers.has(linter)) {
    parsers.set(linter, new Set());
  }

  const defined = parsers.get(linter);
  if (!defined.has(parser)) {
    defined.add(parser);
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    linter.defineParser(parser, require(parser));
  }
}

function printCode(
  code: string,
  result: Partial<Linter.LintMessage> = {},
  linesOffset = Number.POSITIVE_INFINITY,
): string {
  const { line, column, endLine, endColumn, message } = result;
  const location = {} as AST.SourceLocation;

  if (typeof line === 'number' && typeof column === 'number') {
    location.start = {
      line,
      column,
    };
  }

  if (typeof endLine === 'number' && typeof endColumn === 'number') {
    location.end = {
      line: endLine,
      column: endColumn,
    };
  }

  return codeFrameColumns(code, location, {
    linesAbove: linesOffset,
    linesBelow: linesOffset,
    message,
  });
}
