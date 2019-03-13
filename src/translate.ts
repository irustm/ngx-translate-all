import * as minimist from "minimist";
import * as chalk from "chalk";
import * as replace from "replace";
import * as path from "path";
import { existsSync, writeFile, mkdirSync } from "fs";
import { ProjectSymbols } from "ngast";

import { resourceResolver } from "./utils/resource";
import { ElementAst, TextAst, ASTWithSource } from "@angular/compiler";

translate();

export function translate() {
  const error = message => {
    console.error(chalk.default.bgRed.white(message));
  };
  const info = (message, count1?, count2?) => {
    console.log(
      chalk.default.green(message) +
        ` ${count1 ? chalk.default.blue(count1) : ""}` +
        ` ${count2 ? "/ " + chalk.default.yellowBright(count2) : ""}`
    );
  };
  const args: any = minimist(process.argv.slice(2));
  validateArgs([args.in, args.out, args.outPath], error);
  let projectPath = args.p;
  const inLocacte = args.in;
  let outLocacte: string[] = args.out.split(",");
  const outPath = args.outPath;
  if (!projectPath) {
    projectPath = "./tsconfig.json";
  }
  if (!existsSync(projectPath)) {
    error('Cannot find tsconfig at "' + projectPath + '".');
    process.exit(1);
  }
  console.log("Parsing...");
  let parseError: any = null;
  const projectSymbols = new ProjectSymbols(
    projectPath,
    resourceResolver,
    e => (parseError = e)
  );
  let allDirectives = projectSymbols.getDirectives();
  if (!parseError) {
    allDirectives = allDirectives.filter(
      el => el.symbol.filePath.indexOf("node_modules") === -1
    );
    const jsonResult = {};
    allDirectives.forEach(el => {
      try {
        if (el.isComponent()) {
          // Component
          const moduleName = el.getModule().toSummary().type.reference.name;
          const componentName = el.symbol.name;
          const name = moduleName + "." + componentName;
          if (!jsonResult[moduleName]) {
            jsonResult[moduleName] = {};
          }
          jsonResult[moduleName][componentName] = {};
          let texts: string[] = [];
          el.getTemplateAst().templateAst.forEach(element => {
            texts.push(...getTextAst(element as ElementAst));
          });
          const url =
            el.getResolvedMetadata().templateUrl || el.symbol.filePath;
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
        error(e);
        // exception only component
      }
    });
    // saving data
    if (!existsSync(outPath)) {
      mkdirSync(outPath, { recursive: true });
    }
    const locales = [inLocacte, ...outLocacte];
    locales.forEach(locale => {
      const outFile = path.join(outPath, `${locale}.json`);
      writeFile(outFile, JSON.stringify(jsonResult), "utf8", () => {});
    });
  } else {
    error(parseError);
  }
}
function getTextAst(element: ElementAst): string[] {
  const texts: string[] = [];
  if (element && element.children && element.children.length) {
    element.children.forEach((child: any) => {
      const value: TextAst | ASTWithSource | string | any = (child as TextAst)
        .value;
      if (value) {
        if (typeof value === "string" && value.trim() !== "") {
          texts.push(child.value);
        } else {
          const source: string = (value as ASTWithSource).source;
          if (typeof value === "object" && source && source.trim() !== "") {
            texts.push(source);
          }
        }
      } else {
        const childTexts = getTextAst(child as ElementAst);
        childTexts.forEach((el: any) => {
          texts.push(el);
        });
      }
    });
  }
  return texts;
}

function validateArgs(args: any[], error: Function) {
  args.forEach(arg => {
    if (!arg || arg.trim().length === 0) {
      error(`Connot find --${arg} argument`);
      process.exit(1);
    }
  });
}
