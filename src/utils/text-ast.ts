import { ElementAst, TextAst, ASTWithSource } from '@angular/compiler';
export function getTextAst(element: ElementAst): string[] {
  const texts: string[] = [];
  if (element && element.children && element.children.length) {
    element.children.forEach((child: any) => {
      const value: TextAst | ASTWithSource | string | any = (child as TextAst)
        .value;
      if (value) {
        if (typeof value === 'string' && value.trim() !== '') {
          texts.push(child.value);
        } else {
          const source: string = (value as ASTWithSource).source;
          if (typeof value === 'object' && source && source.trim() !== '') {
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
