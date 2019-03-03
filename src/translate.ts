import * as minimist from 'minimist';
import * as chalk from 'chalk';
import * as replace from 'replace';
import { existsSync } from 'fs';
import { ProjectSymbols } from 'ngast';

import { resourceResolver } from './utils/resource';
import { ElementAst, TextAst } from '@angular/compiler';

translate();

export function translate() {
  const error = message => {
    console.error(chalk.default.bgRed.white(message));
  };
  const info = (message, count1?, count2?) => {
    console.log(
      chalk.default.green(message) +
        ` ${count1 ? chalk.default.blue(count1) : ''}` +
        ` ${count2 ? '/ ' + chalk.default.yellowBright(count2) : ''}`
    );
  };

  let projectPath = (minimist(process.argv.slice(2)) as any).p;
  if (!projectPath) {
    projectPath = './tsconfig.json';
  }
  if (!existsSync(projectPath)) {
    error('Cannot find tsconfig at "' + projectPath + '".');
    process.exit(1);
  }
  console.log('Parsing...');
  let parseError: any = null;
  const projectSymbols = new ProjectSymbols(
    projectPath,
    resourceResolver,
    e => (parseError = e)
  );
  let allDirectives = projectSymbols.getDirectives();
  if (!parseError) {
    allDirectives = allDirectives.filter(el => el.symbol.filePath.indexOf('node_modules') === -1);
    const jsonResult = {};
    const jsonAny = {};
    allDirectives.forEach(el => {
      try {
        if (el.isComponent()) {
          // Component
          const moduleName = el.getModule().toSummary().type.reference.name;
          const componentName = el.symbol.name;
          const name = moduleName + '.' + componentName;
          console.log(name);
          if (!jsonResult[moduleName]) {
            jsonResult[moduleName] = {};
          }
          jsonResult[moduleName][componentName] = {};
          let texts: TextAst[] = [];
          el.getTemplateAst().templateAst.forEach(element => {
            texts.push(...getTextAst(element as ElementAst));
          });
          const url = el.getResolvedMetadata().templateUrl || el.symbol.filePath;screen
          texts.forEach((text, i) => {
            jsonResult[moduleName][componentName][i] = text.value;
            replace({
              regex: text.value,
              replacement: `{{ '${name}.${i}' | translate }}`,
              paths: [url]
            });
          });
          
        } else {
          // Directive
        }
      } catch (e) {
        // Component
        error(e);
        // exception only component
      }
    });
    console.log(jsonResult);
  } else {
    error(parseError);
  }
}
function getTextAst(element: ElementAst): TextAst[] {
  const texts: TextAst[] = [];
  if (element && element.children && element.children.length) {
    element.children.forEach(child => {
      const value = (child as TextAst).value;
      if (value) {
        if (typeof value === 'string' && value.trim() !== '') {
          texts.push(child as TextAst);
        } else {
          
        }
      } else {
        const childTexts = getTextAst(child as ElementAst);
        childTexts.forEach(el => {
          texts.push(el);
        });
      }
    });
  }
  return texts;
}

