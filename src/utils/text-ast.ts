type ElementAst = any;
type TextAst = any;
type ASTWithSource = any;


export function getTextAst(element: ElementAst): string[] {
  const texts: string[] = [];
  if (element && element.children && element.children.length) {
    element.children.forEach((child: any) => {
      const name = child.constructor.name;
      const value: TextAst | ASTWithSource | string | any = (child as TextAst)
        .value;
      if (value) {
        if (name === 'TextAst' && value.trim() !== '') {
          texts.push(child.value);
        } else {
          const source: string = (value as ASTWithSource).source;
          // if (typeof value === 'object' && source && source.trim() !== '') {
          //   texts.push(source);
          // }
          if(value.constructor.name === 'ASTWithSource'){
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
