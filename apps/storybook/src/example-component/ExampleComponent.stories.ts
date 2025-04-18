import "@svebcomponents/example-component";
import { createRenderFunction } from "@svebcomponents/utils";

const render = createRenderFunction({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- TODO: figure out how to correctly type this
  svelteComponent: {} as any,
  customElementTagName: "example-component",
});

export default {
  title: "Example/Button",
  tags: ["autodocs"],
  render,
  argTypes: {
    userName: { control: "text" },
  },
};

export const Primary = {
  args: {
    userName: "Example User Name",
  },
};
