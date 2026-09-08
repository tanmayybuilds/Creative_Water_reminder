import type { MemeDefinition, AssetFormatMode } from "./types";

/**
 * Global asset format provider configuration.
 * Default is "raw" for development MP4 assets.
 * Can be switched to "processed" for future transparent-background WebM assets.
 */
let currentAssetMode: AssetFormatMode = "processed";

export const MemeAssetProvider = {
  getMode(): AssetFormatMode {
    return currentAssetMode;
  },

  setMode(mode: AssetFormatMode): void {
    currentAssetMode = mode;
  },

  /**
   * Resolves the asset URL for a given meme definition based on current asset mode.
   */
  resolveUrl(meme: MemeDefinition): string {
    if (currentAssetMode === "processed") {
      return `/memes/processed/${meme.id}.webm`;
    }
    // Default raw MP4 asset in /memes/raw/
    return `/memes/raw/${meme.filename}`;
  },
};
