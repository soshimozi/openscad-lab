let fontsMounted = false;

export type FontDefinition = {
  id: string;
  displayName: string;
  fontName: string;
  assetPath: string;
};

async function loadFontDefinitions(): Promise<FontDefinition[]> {
  const response = await fetch("/fonts/fonts.json");

  if (!response.ok) {
    throw new Error("Failed to load font registry.");
  }

  return response.json();
}

async function ensureFontsMounted(instance: any) {
  if (fontsMounted) return;

  instance.FS.mkdirTree("/etc/fonts");
  instance.FS.mkdirTree("/usr/share/fonts/truetype");
  instance.FS.mkdirTree("/tmp/fontconfig-cache");

  instance.FS.writeFile(
    "/etc/fonts/fonts.conf",
    `<?xml version="1.0"?>
<!DOCTYPE fontconfig SYSTEM "fonts.dtd">
<fontconfig>
  <dir>/usr/share/fonts</dir>
  <cachedir>/tmp/fontconfig-cache</cachedir>
</fontconfig>`
  );

  const fonts = await loadFontDefinitions();

  for (const font of fonts) {
    const response = await fetch(font.assetPath);

    if (!response.ok) {
      throw new Error(`Failed to load font: ${font.assetPath}`);
    }

    console.log(`loaded ${font.assetPath}`)

    const buffer = await response.arrayBuffer();

    instance.FS.writeFile(
      `/usr/share/fonts/truetype/${font.fontName}.ttf`,
      new Uint8Array(buffer)
    );
  }

  fontsMounted = true;
}

export { ensureFontsMounted }