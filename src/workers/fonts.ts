let fontsMounted = false;

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

  const fonts = [
    {
      url: "/fonts/Pacifico-Regular.ttf",
      path: "/usr/share/fonts/truetype/Pacifico-Regular.ttf",
    },
    {
      url: "/fonts/LiberationSans-Regular.ttf",
      path: "/usr/share/fonts/truetype/LiberationSans-Regular.ttf",
    },
  ];

  for (const font of fonts) {
    const response = await fetch(font.url);

    if (!response.ok) {
      throw new Error(`Failed to load font: ${font.url}`);
    }

    const buffer = await response.arrayBuffer();

    instance.FS.writeFile(
      font.path,
      new Uint8Array(buffer)
    );
  }

  fontsMounted = true;
}

export { ensureFontsMounted }