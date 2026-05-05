export type LayerType = "background" | "video";
export type ShaderType = "pixelate" | "bnw";
export type ModulatorType = "lfo" | "random";

export const AVAILABLE_LAYERS: LayerType[] = ["background", "video"];
export const AVAILABLE_SHADERS: ShaderType[] = ["pixelate", "bnw"];
export const AVAILABLE_MODULATORS: ModulatorType[] = ["lfo", "random"];

export const CATEGORIZED_SHADERS: Record<string, ShaderType[]> = {
  color: ["bnw"],
  distortion: ["pixelate"],
};
