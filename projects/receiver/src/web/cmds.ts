import { commands, Position, Range, Selection, TextDocument, TextDocumentContentChangeEvent, TextEditor, TextEditorRevealType, window, workspace } from 'vscode'

export function changeText(editor: TextEditor, change: TextDocumentContentChangeEvent): Thenable<boolean> {
  let range = change.range as any
  range = new Range(range[0], range[1])
  return editor.edit(eb => {
    if (change.text === '') eb.delete(range)
    else eb.replace(range, change.text)
  })
}

export function setSelection(editor: TextEditor, sel: Selection) {
  editor.selection = new Selection(sel.anchor, sel.active)
  editor.revealRange(new Range(editor.selection.start, editor.selection.end), TextEditorRevealType.InCenter)
}

export async function closeDoc(td: TextDocument) {
  await window.showTextDocument(td, { preview: false })
  await commands.executeCommand('workbench.action.closeActiveEditor')
}

export async function showDoc(content: string, langId: string) {
  let doc = window.activeTextEditor?.document
  if (doc?.languageId !== langId) doc = findDoc(langId) ?? (await workspace.openTextDocument({ content: langId, language: langId }))
  await window.showTextDocument(doc, { preview: false })
  window.activeTextEditor?.edit(te => {
    te.insert(new Position(0, 0), content)
  })
}

function findDoc(langId: string): TextDocument | undefined {
  return workspace.textDocuments.find(doc => doc.languageId === langId)
}
