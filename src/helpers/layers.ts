export type LayerType = "background" | "video";
export type ShaderType =
  | "pixelate"
  | "bnw"
  | "montecarlo"
  | "anaglyph"
  | "vlines"
  | "hlines"
  | "chroma"
  | "scramble"
  | "negative";
export type ModulatorType = "lfo" | "random" | "ring" | "compressor";

export const AVAILABLE_LAYERS: LayerType[] = ["background", "video"];
export const AVAILABLE_SHADERS: ShaderType[] = [
  "pixelate",
  "bnw",
  "montecarlo",
  "anaglyph",
  "vlines",
  "hlines",
  "chroma",
  "scramble",
  "negative",
];
export const AVAILABLE_MODULATORS: ModulatorType[] = [
  "lfo",
  "random",
  "ring",
  "compressor",
];

export const CATEGORIZED_SHADERS: Record<string, ShaderType[]> = {
  color: ["bnw", "negative"],
  distortion: ["montecarlo", "pixelate", "scramble"],
  stylize: ["anaglyph", "hlines", "vlines"],
  keying: ["chroma"],
};
