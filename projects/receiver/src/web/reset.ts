import { workspace } from 'vscode'
import { closeDoc } from './cmds'

async function closeAllDocs() {
  console.log('close docs: ', workspace.textDocuments)
  workspace.textDocuments.forEach(td => closeDoc(td))
}

export function reset() {
  closeAllDocs()
}
