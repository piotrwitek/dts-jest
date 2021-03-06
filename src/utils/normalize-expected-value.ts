import * as _ts from 'typescript';
import { create_message } from './create-message';
import { create_source_file } from './create-source-file';
import { get_diagnostic_message } from './get-diagnostic-message';
import { get_display_line } from './get-display-line';
import { get_node_one_line_text } from './get-node-one-line-text';

interface InternalSourceFile extends _ts.SourceFile {
  parseDiagnostics?: _ts.Diagnostic[];
}

export const normalize_expected_value = (
  value: string,
  filename: string,
  line: number,
  ts: typeof _ts,
) => {
  const source_file = create_source_file(
    filename,
    `var x = ${value}`,
    ts,
  ) as InternalSourceFile;

  // istanbul ignore next
  const { parseDiagnostics: errors = [] } = source_file;

  if (errors.length !== 0) {
    const position_information = `(${filename}:${get_display_line(line)})`;
    throw new Error(
      create_message(`Unexpected error(s) while parsing expected value:`, [
        position_information,
        '',
        ...errors.map(get_diagnostic_message),
      ]),
    );
  }

  const expression = (source_file.statements[0] as _ts.VariableStatement)
    .declarationList.declarations[0].initializer!;

  return get_node_one_line_text(expression, source_file, ts);
};
