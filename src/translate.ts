import * as minimist from "minimist";
import * as chalk from "chalk";
import { existsSync } from "fs";
import { WorkspaceSymbols } from "ngast";

import { resourceResolver } from "./utils/resource";
import * as ngxTranslate from './ngx-translate';
import * as i18nTranslate from './i18n';
import { CliConfig } from './models/models';

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

export function translate() {
  const config = getCliConfig();
  console.log("Parsing...");

  const workspace = new WorkspaceSymbols(config.projectPath);

  let allDirectives = workspace.getAllComponents();

  // allDirectives = allDirectives.filter(
  //     el => el.filePath.indexOf("node_modules") === -1
  // );
  switch (config.format) {
    case 'ngx-translate':
      ngxTranslate.replacer(allDirectives, config);
      break;
    case 'i18n':
      i18nTranslate.replacer(allDirectives, config);
      break;

    default:
      error('format "' + config.format + '" unsoported, Only: ngx-translate, i18n.');
      process.exit(1);
      break;
  }
}


function validateArgs(args: any, attrs: string[], error: Function) {
  attrs.forEach(attr => {
    if (!args[attr] || args[attr].trim().length === 0) {
      error(`Connot find --${attr} argument`);
      process.exit(1);
    }
  });
}

function getCliConfig(): CliConfig {
  const args: any = minimist(process.argv.slice(2));
  validateArgs(args, ['in', 'out', 'outPath', 'format'], error);
  let projectPath = args.p;
  const inLocacte = args.in;
  const format = args.format;
  let outLocacte: string[] = args.out.split(",");
  const outPath = args.outPath;

  if (!projectPath) {
    projectPath = "./tsconfig.json";
  }
  if (!existsSync(projectPath)) {
    error('Cannot find tsconfig at "' + projectPath + '".');
    process.exit(1);
  }
  return {
    projectPath,
    inLocacte,
    format,
    outLocacte,
    outPath
  }
}
