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
  | "negative"
  | "crosses"
  | "recolour"
  | "hnoise";
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
  "crosses",
  "recolour",
  "hnoise",
];
export const AVAILABLE_MODULATORS: ModulatorType[] = [
  "lfo",
  "random",
  "ring",
  "compressor",
];

export const CATEGORIZED_SHADERS: Record<string, ShaderType[]> = {
  color: ["bnw", "negative", "recolour"],
  distortion: ["montecarlo", "pixelate", "scramble"],
  stylize: ["anaglyph", "crosses", "hlines", "hnoise", "vlines"],
  keying: ["chroma"],
};
