import { type AST } from "svelte/compiler";
// TODO: we have no types for the typescript AST yet, probably should pull in a library to get them
// ... but for now I'll just write my own

interface Identifier extends AST.BaseNode {
  type: "Identifier";
  name: string;
}

export interface TypeAnnotation {
  type:
    | "TSTypeReference"
    // TODO: this is probably right, but I don't know yet
    | "TSTypeLiteral";
  typeName: Identifier;
}

interface InterfaceBody extends AST.BaseNode {
  type: "TSInterfaceBody";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- TODO: write a type for this
  body: any[];
}

export interface InterfaceDeclaration extends AST.BaseNode {
  type: "TSInterfaceDeclaration";
  id: Identifier;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- TODO: write a type for this
  typeParmeters: any[];
  body: InterfaceBody;
}
