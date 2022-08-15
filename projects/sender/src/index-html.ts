export function indexHTML(port: number): string {
  return /*html*/ `
<!DOCTYPE html>
<html>

  <head>
    <meta charset='utf-8' />
    <!-- Mobile tweaks -->
    <meta name='mobile-web-app-capable' content='yes' />
    <meta name='apple-mobile-web-app-capable' content='yes' />
    <meta name='apple-mobile-web-app-title' content='Code' />
    <!-- Disable pinch zooming -->
    <meta name='viewport' content='width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no' />
    <!-- Workbench Icon/Manifest/CSS -->
    <link rel='icon' href='web/favicon.ico' type='image/x-icon' />
    <link rel='manifest' href='web/manifest.json' />
    <link data-name='vs/workbench/workbench.web.main' rel='stylesheet' href='./web/vscode-web/dist/out/vs/workbench/workbench.web.main.css' />
    <link data-name='custom-css' rel='stylesheet' href='web/custom.css' />
  </head>

  <body aria-label=''>
    <!-- Startup (do not modify order of script tags!) -->
    <script src='./web/vscode-web/dist/out/vs/loader.js'></script>
    <script src='./web/vscode-web/dist/out/vs/webPackagePaths.js'></script>
    <script>
     ${jsScript()} 
    </script>
    <script src='./web/vscode-web/dist/out/vs/workbench/workbench.web.main.nls.js'></script>
    <script src='./web/vscode-web/dist/out/vs/workbench/workbench.web.main.js'></script>
    <script src='./web/vscode-web/dist/out/vs/code/browser/workbench/workbench.js'></script>
    <script src='./web/web-customizer.js'></script>
    <script>
      webCustomizer.start(${port});
    </script>
  </body>
</html>
`
}

function jsScript(): string {
  return 'Object.keys(self.webPackagePaths).map(function (key, index) { self.webPackagePaths[key] = `${window.location.origin}/web/vscode-web/dist/node_modules/${key}/${self.webPackagePaths[key]}`; });require.config({ baseUrl: `${window.location.origin}/web/vscode-web/dist/out`, recordStats: true, trustedTypesPolicy: window.trustedTypes?.createPolicy("amdLoader", { createScriptURL(value) {    return value; }, }), paths: self.webPackagePaths, });'
}
