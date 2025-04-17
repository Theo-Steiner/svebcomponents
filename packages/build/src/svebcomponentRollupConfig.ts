import type { RollupOptions } from "rollup";
import svelte from "rollup-plugin-svelte";
import resolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import autoOptions from "@svebcomponents/auto-options";

interface RollupConfigSvebcomponentsOptions {
  /**
   * The entrypoint for the svelte component that is being transformed.
   */
  input: string;
  /**
   * The file rollup should write the output to.
   */
  outDir: string;
}

export const svebcomponentRollupConfig = (
  options: RollupConfigSvebcomponentsOptions,
) => {
  const { input, outDir } = options;
  return {
    input,
    output: {
      dir: options.outDir,
      format: "esm",
      sourcemap: true,
    },
    plugins: [
      resolve({
        browser: true,
        exportConditions: ["svelte"],
        extensions: [".svelte"],
      }),
      autoOptions(),
      svelte(),
      typescript({
        outDir,
      }),
    ],
  } satisfies RollupOptions;
};
