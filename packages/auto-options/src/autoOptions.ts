import { parse, type AST } from "svelte/compiler";
import { walk } from "zimmerframe";
import MagicString from "magic-string";
import type { VariableDeclarator } from "estree";
import type { InterfaceDeclaration, TypeAnnotation } from "./types";

// In svelte web component land, even simple things such as exposing props as attributes have to be
// manually configured using <svelte:options customElement={}/>
// to help with this, @svebcomponents/auto-options provides a rollup plugin that tries to cover at least the basic use cases
// out of the box
export const autoOptions = () => {
  return {
    name: "svebcomponents:auto-options",
    enforce: "pre",

    async transform(code: string, id: string) {
      if (!id.endsWith(".svelte")) {
        return null;
      }
      const { instance, options } = parse(code, {
        filename: id,
        modern: true,
      });

      // if the component doesn't have a script, there are no props we need to add to the custom element,
      // so we can skip processing altogether
      if (!instance) {
        return null;
      }
      // TODO: maybe we don't need this
      const isTypeScript = instance.attributes.find(
        (attr) =>
          Array.isArray(attr.value) &&
          attr.value[0] &&
          "data" in attr.value[0] &&
          attr.value[0].data === "ts",
      );
      let propsDeclaration: VariableDeclarator | undefined;
      const typeDeclarations: InterfaceDeclaration[] = [];
      walk(instance.content, null, {
        Program(node) {
          for (const statement of node.body) {
            console.log("statement", statement);
            switch (statement.type) {
              case "VariableDeclaration":
                for (const declaration of statement.declarations) {
                  // since props are always declared as `const props = $props()` in svelte,
                  // we can skip to the next statement if this declaration is not initialized via a call expression
                  if (
                    !declaration.init ||
                    declaration.init.type !== "CallExpression" ||
                    declaration.init.callee.type !== "Identifier" ||
                    declaration.init.callee.name !== "$props"
                  ) {
                    continue;
                  }
                  propsDeclaration = declaration;
                }
                break;
              // TODO: there are other types of declaring types that we should also support
              // @ts-expect-error -- we don't have types for the typescript AST yet
              case "TSInterfaceDeclaration":
                typeDeclarations.push(statement);
            }
          }
        },
      });

      // if we don't have any props, there's nothing to do
      if (!propsDeclaration) {
        return null;
      }

      // if we have types, we want to preferrably use them over what is being destructured
      // since the destructuring might use {...rest} or not destructure at all
      if ("typeAnnotation" in propsDeclaration.id) {
        const propsAnnotation = propsDeclaration.id
          .typeAnnotation as TypeAnnotation;
        if (
          propsAnnotation.type === "TSTypeReference" &&
          propsAnnotation.typeName.type === "Identifier"
        ) {
          const resolvedType = typeDeclarations.find(
            (typeDeclaration) =>
              typeDeclaration.id.name === propsAnnotation.typeName.name,
          );

          console.log("resolvedType", resolvedType?.body);
        }
      }

      if ("properties" in propsDeclaration.id) {
        // console.log(
        //   "declaration.id.properties",
        //   propsDeclaration.id.properties,
        // );
      }

      const customElementOptions = options?.attributes.find(
        (attr): attr is AST.Attribute =>
          "name" in attr && attr.name === "customElement",
      );
      // console.log("ce options", customElementOptions?.value);

      const magicString = new MagicString(code);

      if (!magicString.hasChanged()) {
        return null;
      }

      return {
        code: magicString.toString(),
        map: magicString.generateMap({
          source: id,
          file: id,
          includeContent: true,
        }),
      };
    },
  };
};

export default autoOptions;
