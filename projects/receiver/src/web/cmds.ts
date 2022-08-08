import { commands, Diagnostic, DiagnosticSeverity, Position, Range, Selection, TextDocumentContentChangeEvent, TextEditor, TextEditorRevealType, window, workspace } from 'vscode'
import { createDecorations } from './decorations'
import { diagsColl } from './extension'

// Special case: for deser ranges
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function newRange(rangeArr: any): Range {
  return new Range(rangeArr[0], rangeArr[1])
}

export function changeText(editor: TextEditor, change: TextDocumentContentChangeEvent): Thenable<boolean> {
  const range = newRange(change.range)
  return editor.edit(eb => {
    eb.delete(range)
    if (change.text !== '') eb.insert(range.start, change.text)
  })
}

export function setSelection(editor: TextEditor, sel: Selection): void {
  editor.selection = new Selection(sel.anchor, sel.active)
  editor.revealRange(new Range(editor.selection.start, editor.selection.end), TextEditorRevealType.InCenter)
}

export async function closeDoc(): Promise<void> {
  const editor = await clearDoc()
  if (editor) await commands.executeCommand('workbench.action.closeActiveEditor')
}

export async function closeAllDocs(): Promise<void> {
  for (const td of workspace.textDocuments) {
    await window.showTextDocument(td.uri, { preview: true, preserveFocus: false })
    await closeDoc()
  }
}

export async function showDoc(content: string, langId: string): Promise<void> {
  let doc = (await clearDoc())?.document
  if (doc?.languageId !== langId) {
    await closeDoc()
    // doc = findDoc(langId) ?? (await workspace.openTextDocument({ content: '', language: langId }))
    doc = await workspace.openTextDocument({ content: '', language: langId })
    await window.showTextDocument(doc, { preview: false })
    await window.activeTextEditor?.edit(te => te.insert(new Position(0, 0), content))
  } else await window.activeTextEditor?.edit(te => te.insert(new Position(0, 0), content))
}

export async function clearDoc(): Promise<TextEditor | undefined> {
  const editor = window.activeTextEditor
  if (editor) await editor.edit(edit => edit.delete(new Range(new Position(0, 0), new Position(editor.document.lineCount + 1, 0))))
  changeDiagnostics([])
  return editor
}

export function changeDiagnostics(ev: Diagnostic[]): void {
  const editor = window.activeTextEditor

  if (editor) {
    ev.forEach(diag => {
      diag.range = newRange(diag.range)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      diag.severity = DiagnosticSeverity[diag.severity] as any
    })
    diagsColl.set(editor.document.uri, ev)
    createDecorations(editor, ev)
  }
}
