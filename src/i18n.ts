import { DirectiveSymbol } from 'ngast';
import { getTextAst } from './utils/text-ast';
import { ElementAst } from '@angular/compiler';
import * as replace from "replace";
import { CliConfig } from './models/models';

export function replacer(allDirectives: DirectiveSymbol[], config: CliConfig): void {
  allDirectives.forEach(el => {
    try {
      if (el.isComponent()) {
        // Component
        const moduleName = el.getModule().toSummary().type.reference.name;
        const componentName = el.symbol.name;
        const name = moduleName + '.' + componentName;
        let texts: string[] = [];
        el.getTemplateAst().templateAst.forEach(element => {
          texts.push(...getTextAst(element as ElementAst));
        });
        const url = el.getResolvedMetadata().templateUrl || el.symbol.filePath;
        texts.forEach((text, i) => {
          replace({
            regex: `>${text}`,
            replacement:` i18n="${name}">${text}`,
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
}
