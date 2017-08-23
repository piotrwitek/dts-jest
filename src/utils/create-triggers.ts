import * as path from 'path';
import * as _ts from 'typescript';
import {
  trigger_regex,
  Group,
  Trigger,
  TriggerMatchArray,
  TriggerMatchIndex,
} from '../definitions';
import { default_to } from './default-to';
import { for_each_comment } from './for-each-comment';
import { get_trigger_of_group_info } from './get-trigger-or-group-info';
import { traverse_node } from './traverse-node';

export const create_triggers = (
  source_file: _ts.SourceFile,
  ts: typeof _ts,
): Trigger[] => {
  type PartialTrigger = Pick<
    Trigger,
    'flags' | 'method' | 'description' | 'group'
  >;
  const partial_triggers: { [line: number]: PartialTrigger } = {};

  let last_group: Group | undefined;
  for_each_comment(
    source_file,
    (comment, scanner) => {
      const match = comment.match(trigger_regex);

      if (match === null) {
        return;
      }

      const trigger_match = match as TriggerMatchArray;

      const description = trigger_match[TriggerMatchIndex.Description];
      const info = get_trigger_of_group_info(
        trigger_match[TriggerMatchIndex.Flags],
      );

      if (info.is_group) {
        const { method } = info;
        last_group = {
          method,
          title: default_to(description, 'untitled'),
        };
      } else {
        const { flags, method } = info;
        const position = scanner.getTokenPos();
        const { line } = source_file.getLineAndCharacterOfPosition(position);

        partial_triggers[line] = {
          flags,
          method,
          description,
          group: last_group,
        };
      }
    },
    ts,
  );

  const triggers: Trigger[] = [];
  const line_starts = source_file.getLineStarts();

  traverse_node(
    source_file,
    node => {
      const position = node.getStart(source_file);
      const {
        line: expression_line,
      } = source_file.getLineAndCharacterOfPosition(position);
      const trigger_line = expression_line - 1;

      if (!(trigger_line in partial_triggers)) {
        return;
      }

      try {
        const start = node.getStart(source_file);
        const leading_space_width = start - line_starts[expression_line];
        const expression = node
          .getText(source_file)
          .replace(/\s*;?\s*$/, '')
          .replace(/^ */gm, spaces =>
            ' '.repeat(Math.max(0, spaces.length - leading_space_width)),
          );

        const partial_trigger = partial_triggers[trigger_line];
        delete partial_triggers[trigger_line];

        triggers.push({
          start,
          end: node.getEnd(),
          expression,
          line: trigger_line,
          ...partial_trigger,
        });
      } catch (e) {
        // do nothing
      }
    },
    ts,
  );

  const unattachable_lines = Object.keys(partial_triggers).map(Number);
  if (unattachable_lines.length !== 0) {
    const relative_filename = path.relative(
      process.cwd(),
      source_file.fileName,
    );
    throw new Error(
      `Unattachable trigger(s) detected:\n\n${unattachable_lines
        .map(
          line =>
            `  ${relative_filename}:${line + 1} ${default_to(
              partial_triggers[line].description,
              '',
            )}`,
        )
        .join('\n')
        .replace(/\s+$/gm, '')}`,
    );
  }

  return triggers;
};
