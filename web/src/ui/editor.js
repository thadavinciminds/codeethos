// CodeMirror 6 editor wrapper with Python highlighting and Ctrl+Enter to run.
// Uses a custom muted terminal theme (no bright neon syntax colors).
import { EditorView, basicSetup } from 'codemirror';
import { keymap } from '@codemirror/view';
import { EditorState, Compartment } from '@codemirror/state';
import { indentUnit, HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { tags as t } from '@lezer/highlight';
import { python } from '@codemirror/lang-python';

const theme = EditorView.theme(
  {
    '&': { height: '100%', fontSize: '14px', backgroundColor: 'transparent', color: '#d6d2c4' },
    '.cm-scroller': { fontFamily: "'IBM Plex Mono', monospace", lineHeight: '1.7' },
    '.cm-gutters': { backgroundColor: 'transparent', border: 'none', color: '#45443f' },
    '.cm-activeLineGutter': { backgroundColor: 'transparent', color: '#7d7a70' },
    '.cm-activeLine': { backgroundColor: '#ffffff05' },
    '.cm-content': { padding: '14px 0', caretColor: '#d4a65a' },
    '.cm-cursor': { borderLeft: '2px solid #d4a65a' },
    '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, ::selection': { backgroundColor: '#d4a65a33 !important' },
    '.cm-matchingBracket': { backgroundColor: 'transparent', outline: '1px solid #55534d' },
    '&.cm-focused': { outline: 'none' },
    '.cm-tooltip': { backgroundColor: '#141517', border: '1px solid #34363b', color: '#d6d2c4' },
    '.cm-tooltip-autocomplete ul li[aria-selected]': { backgroundColor: '#24262a', color: '#d6d2c4' },
    '.cm-foldPlaceholder': { backgroundColor: 'transparent', border: 'none', color: '#7d7a70' },
  },
  { dark: true },
);

const highlight = HighlightStyle.define([
  { tag: [t.keyword, t.controlKeyword, t.operatorKeyword, t.definitionKeyword], color: '#c79a6a' },
  { tag: [t.string, t.special(t.string)], color: '#93a86f' },
  { tag: [t.number, t.bool, t.null], color: '#b88a9e' },
  { tag: t.comment, color: '#5e5c55', fontStyle: 'italic' },
  { tag: [t.function(t.variableName), t.function(t.propertyName)], color: '#a7b8c4' },
  { tag: [t.definition(t.variableName), t.className], color: '#e2ddcd' },
  { tag: [t.operator, t.punctuation, t.bracket], color: '#8a877d' },
  { tag: t.standard(t.variableName), color: '#a7b8c4' },
]);

export function createEditor(parent, { doc = '', onRun, onCheck, onChange } = {}) {
  const readOnly = new Compartment();
  const view = new EditorView({
    parent,
    state: EditorState.create({
      doc,
      extensions: [
        keymap.of([
          { key: 'Mod-Enter', run: () => (onRun?.(), true) },
          { key: 'Shift-Enter', run: () => (onCheck?.(), true) },
        ]),
        basicSetup,
        python(),
        theme,
        syntaxHighlighting(highlight),
        indentUnit.of('    '),
        EditorState.tabSize.of(4),
        readOnly.of(EditorState.readOnly.of(false)),
        EditorView.updateListener.of((u) => u.docChanged && onChange?.(u.state.doc.toString())),
      ],
    }),
  });
  return {
    view,
    get: () => view.state.doc.toString(),
    set(code) {
      view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: code } });
    },
    setReadOnly(on) {
      view.dispatch({ effects: readOnly.reconfigure(EditorState.readOnly.of(on)) });
    },
    goToLine(n) {
      if (!n || n > view.state.doc.lines) return;
      const line = view.state.doc.line(n);
      view.dispatch({ selection: { anchor: line.from, head: line.to }, scrollIntoView: true });
      view.focus();
    },
    focus: () => view.focus(),
  };
}
