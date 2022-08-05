import { DecorationInstanceRenderOptions, DecorationOptions, DecorationRenderOptions, Diagnostic, TextEditor, window } from 'vscode'
function decorationRenderOptions(background: string, color: string): DecorationRenderOptions {
  return {
    backgroundColor: background,
    // gutterIconSize: $config.gutterIconSize,
    // gutterIconPath: gutter?.errorIconPath,
    after: {
      //...afterProps,
      color: color,
    },
    //backgroundColor: errorMessageBackground,
    //},
    //light: {
    //backgroundColor: errorBackgroundLight,
    //gutterIconSize: $config.gutterIconSize,
    //gutterIconPath: gutter?.errorIconPathLight,
    //after: {
    //color: errorForegroundLight,
    //},
    //},
    isWholeLine: true,
  }
}

const decorationTypeError = window.createTextEditorDecorationType(decorationRenderOptions('#e454541b', '#ff6464'))
const decorationTypeWarning = window.createTextEditorDecorationType(decorationRenderOptions('#ff942f1b', '#fa973a'))
const decorationTypeInfo = window.createTextEditorDecorationType(decorationRenderOptions('#00b7e420', '#00b7e4'))
const decorationTypeHint = window.createTextEditorDecorationType(decorationRenderOptions('#17a2a220', '#2faf64'))

export function createDecorations(editor: TextEditor, diags: Diagnostic[]) {
  const decorationOptionsError: DecorationOptions[] = []
  const decorationOptionsWarning: DecorationOptions[] = []
  const decorationOptionsInfo: DecorationOptions[] = []
  const decorationOptionsHint: DecorationOptions[] = []

  for (const diag of diags) {
    const severity = diag.severity

    const decInstanceRenderOptions: DecorationInstanceRenderOptions = {
      after: {
        contentText: `  ${diag.message}`,
      },
    }
    const diagnosticDecorationOptions: DecorationOptions = {
      range: diag.range,
      renderOptions: decInstanceRenderOptions,
    }
    switch (severity) {
      case 0:
        decorationOptionsError.push(diagnosticDecorationOptions)
        break
      case 1:
        decorationOptionsWarning.push(diagnosticDecorationOptions)
        break
      case 2:
        decorationOptionsInfo.push(diagnosticDecorationOptions)
        break
      case 3:
        decorationOptionsHint.push(diagnosticDecorationOptions)
        break
    }
  }
  editor.setDecorations(decorationTypeHint, decorationOptionsHint)
  editor.setDecorations(decorationTypeInfo, decorationOptionsInfo)
  editor.setDecorations(decorationTypeWarning, decorationOptionsWarning)
  editor.setDecorations(decorationTypeError, decorationOptionsError)
}
