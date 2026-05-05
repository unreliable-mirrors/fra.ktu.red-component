export type LayerType = "background" | "video";
export type ShaderType = "pixelate" | "bnw" | "montecarlo";
export type ModulatorType = "lfo" | "random";

export const AVAILABLE_LAYERS: LayerType[] = ["background", "video"];
export const AVAILABLE_SHADERS: ShaderType[] = [
  "pixelate",
  "bnw",
  "montecarlo",
];
export const AVAILABLE_MODULATORS: ModulatorType[] = ["lfo", "random"];

export const CATEGORIZED_SHADERS: Record<string, ShaderType[]> = {
  color: ["bnw"],
  distortion: ["montecarlo", "pixelate"],
};
