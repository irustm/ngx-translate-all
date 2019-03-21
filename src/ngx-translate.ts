import { DirectiveSymbol } from 'ngast';
import { getTextAst } from './utils/text-ast';
import { ElementAst } from '@angular/compiler';
import { existsSync, writeFile, mkdirSync } from "fs";
import * as replace from "replace";
import * as path from "path";
import { CliConfig } from './models/models';

export function replacer(allDirectives: DirectiveSymbol[], config: CliConfig): void {
  const jsonResult = {};
  allDirectives.forEach(el => {
    try {
      if (el.isComponent()) {
        // Component
        const moduleName = el.getModule().toSummary().type.reference.name;
        const componentName = el.symbol.name;
        const name = moduleName + '.' + componentName;
        if (!jsonResult[moduleName]) {
          jsonResult[moduleName] = {};
        }
        jsonResult[moduleName][componentName] = {};
        let texts: string[] = [];
        el.getTemplateAst().templateAst.forEach(element => {
          texts.push(...getTextAst(element as ElementAst));
        });
        const url = el.getResolvedMetadata().templateUrl || el.symbol.filePath;
        texts.forEach((text, i) => {
          jsonResult[moduleName][componentName][i] = text;
          replace({
            regex: text,
            replacement: `{{ '${name}.${i}' | translate }}`,
            paths: [url]
          });
        });
      } else {
        // Directive
      }
    } catch (e) {
      // Component
      console.error(e);
      // exception only component
    }
  });
  // saving data
  if (!existsSync(config.outPath)) {
    mkdirSync(config.outPath, { recursive: true });
  }
  const locales = [config.inLocacte, ...config.outLocacte];
  locales.forEach(locale => {
    const outFile = path.join(config.outPath, `${locale}.json`);
    writeFile(outFile, JSON.stringify(jsonResult), 'utf8', () => {});
  });
}
