import { commands, Position, Range, Selection, TextDocument, TextDocumentContentChangeEvent, TextEditor, TextEditorRevealType, window, workspace } from 'vscode'

export function newRange(rangeArr: any): Range {
  return new Range(rangeArr[0], rangeArr[1])
}

export function changeText(editor: TextEditor, change: TextDocumentContentChangeEvent): Thenable<boolean> {
  const range = newRange(change.range)
  return editor.edit(eb => {
    if (change.text === '') eb.delete(range)
    else eb.replace(range, change.text)
  })
}

export function setSelection(editor: TextEditor, sel: Selection) {
  editor.selection = new Selection(sel.anchor, sel.active)
  editor.revealRange(new Range(editor.selection.start, editor.selection.end), TextEditorRevealType.InCenter)
}

export async function closeDoc() {
  if (await clearDoc()) await commands.executeCommand('workbench.action.closeActiveEditor')
}

export async function showDoc(content: string, langId: string) {
  let doc = window.activeTextEditor?.document
  if (doc?.languageId !== langId) doc = findDoc(langId) ?? (await workspace.openTextDocument({ content: '', language: langId }))
  await window.showTextDocument(doc, { preview: false })
  window.activeTextEditor?.edit(te => te.insert(new Position(0, 0), content))
}

function findDoc(langId: string): TextDocument | undefined {
  return workspace.textDocuments.find(doc => doc.languageId === langId)
}

export async function clearDoc(): Promise<TextEditor | undefined> {
  const editor = window.activeTextEditor
  if (editor) await editor.edit(edit => edit.delete(new Range(new Position(0, 0), new Position(editor.document.lineCount + 1, 0))))
  return editor
}
