export type LayerType = "background" | "video";
export type ShaderType =
  | "pixelate"
  | "blur"
  | "hsb_blur"
  | "hue_offset"
  | "hue_posterize"
  | "brightness_posterize"
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
  | "hnoise"
  | "light_split"
  | "posterize";
export type ModulatorType = "lfo" | "random" | "ring" | "compressor";

export const AVAILABLE_LAYERS: LayerType[] = ["background", "video"];
export const AVAILABLE_SHADERS: ShaderType[] = [
  "pixelate",
  "blur",
  "hsb_blur",
  "hue_offset",
  "hue_posterize",
  "brightness_posterize",
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
  "light_split",
  "posterize",
];
export const AVAILABLE_MODULATORS: ModulatorType[] = [
  "lfo",
  "random",
  "ring",
  "compressor",
];

export const CATEGORIZED_SHADERS: Record<string, ShaderType[]> = {
  color: [
    "bnw",
    "negative",
    "recolour",
    "light_split",
    "posterize",
    "hue_offset",
    "hue_posterize",
    "brightness_posterize",
  ],
  distortion: ["montecarlo", "pixelate", "scramble", "blur", "hsb_blur"],
  stylize: ["anaglyph", "crosses", "hlines", "hnoise", "vlines"],
  keying: ["chroma"],
};
