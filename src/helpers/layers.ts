export type LayerType = "background" | "video" | "camera";
export type ShaderType =
  | "pixelate"
  | "adjustment"
  | "blur"
  | "hsb_blur"
  | "hue_offset"
  | "hue_posterize"
  | "brightness_posterize"
  | "palette_recolour"
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
  | "posterize"
  | "luma_key"
  | "mask_to"
  | "mask_from";
export type ModulatorType = "lfo" | "random" | "ring" | "compressor";

export const AVAILABLE_LAYERS: LayerType[] = ["background", "video", "camera"];
export const AVAILABLE_SHADERS: ShaderType[] = [
  "pixelate",
  "adjustment",
  "blur",
  "hsb_blur",
  "hue_offset",
  "hue_posterize",
  "brightness_posterize",
  "palette_recolour",
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
  "luma_key",
  "mask_to",
  "mask_from",
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
    "palette_recolour",
    "adjustment",
  ],
  distortion: ["montecarlo", "pixelate", "scramble", "blur", "hsb_blur"],
  stylize: ["anaglyph", "crosses", "hlines", "hnoise", "vlines"],
  keying: ["chroma", "luma_key", "mask_to", "mask_from"],
};
