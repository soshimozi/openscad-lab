# Browser OpenSCAD Playground

A browser-based parametric CAD playground inspired by MakerLab's Parametric Model Maker.

This project combines **React**, **TypeScript**, **OpenSCAD WebAssembly**, **3MF export**, and **Three.js** to create a fully browser-native modeling environment with color-preserving rendering.

---

## Features

* Monaco-based SCAD editor
* Browser-side OpenSCAD rendering using WebAssembly
* Multi-plate support

```scad
module mw_plate_1() {
}

module mw_plate_2() {
}

module mw_assembly_view() {
}
```

* Assembly and plate views
* 3MF export with preserved colors and materials
* Three.js + ThreeMFLoader preview
* Custom font support
* Resizable editor / viewer / customize panes
* Load and save SCAD files
* Render logs

---

## Architecture

```text
React

App
├── TopToolbar
│    Code | View | Customize
│
├── EditorPane
│    Monaco Editor
│    Load / Save / Logs
│
├── CustomizePane
│    Parameters
│    Generate
│
└── ViewerPane
      Three.js
      ThreeMFLoader


Web Worker

SCAD Source
      ↓
OpenSCAD WASM
      ↓
3MF Export
      ↓
ArrayBuffer
      ↓
ThreeMFLoader
      ↓
Three.js Scene
```

---

## Project Structure

```text
src/

components/
├── TopToolbar
├── EditorPane
├── CustomizePane
├── ViewerPane
├── LogDrawer
└── DownloadDialog

hooks/
└── useOpenScadRenderer

services/
├── sourceFiles
└── modelExport

workers/
├── openscad.worker.ts
└── fonts.ts

public/
├── openscad.js
├── openscad.wasm
└── fonts/
```

---

## Multi-Plate Support

Special module names are recognized automatically.

```scad
module mw_plate_1() {

}

module mw_plate_2() {

}

module mw_assembly_view() {

}
```

The editor scans for these modules and exposes:

* Assembly View
* Plate 1
* Plate 2
* etc.

Top-level SCAD statements are considered global and appear in every plate and assembly view.

---

## Fonts

Fonts are mounted into the OpenSCAD virtual filesystem at runtime.

Place fonts in:

```text
public/fonts/

Pacifico-Regular.ttf
LiberationSans-Regular.ttf
Roboto-Regular.ttf
```

Example:

```scad
Text_Font = "Pacifico-Regular";

linear_extrude(height=2)
text(
    "Hello World",
    font = Text_Font,
    size = 10,
    halign = "center",
    valign = "center"
);
```

---

## Running the Project

Install:

```bash
npm install
```

Start:

```bash
npm run dev
```

Build:

```bash
npm run build
```

---

# Building Custom OpenSCAD WASM

The stock OpenSCAD WASM build available online may not include all features.

This project uses a custom build with:

* Lib3MF enabled
* 3MF export
* Color/material preservation
* Manifold backend
* Emscripten

---

## Clone the Repository

Clone recursively:

```bash
git clone --recursive <repo-url>
cd <repo>
```

Or if already cloned:

```bash
git submodule update --init --recursive
```

---

## Build the WASM Docker Environment

Enter the submodule:

```bash
cd openscad_wasm
```

Build the Docker image:

```bash
./scripts/wasm-base-docker-run.sh
```

This creates:

```text
openscad-wasm-ccache:local
```

The Docker image contains:

* Emscripten
* Boost
* CGAL
* Qt
* Manifold
* Lib3MF
* Ninja
* OpenSCAD dependencies

This avoids the dependency and version issues often encountered when building directly on a Linux distribution.

---

## Enter the Build Container

From the `openscad_wasm` directory:

```bash
docker run -it --rm \
  -v "$PWD":/src/openscad \
  -w /src/openscad \
  openscad-wasm-ccache:local \
  /bin/bash
```

Verify:

```bash
ls CMakeLists.txt
which emcmake
```

Expected:

```text
CMakeLists.txt
/emsdk/upstream/emscripten/emcmake
```

---

## Configure OpenSCAD WASM

Inside the container:

```bash
emcmake cmake -B build-wasm . \
  -DEXPERIMENTAL=ON \
  -DSNAPSHOT=ON \
  -G Ninja
```

---

## Verify 3MF Support

Check:

```bash
grep -i "lib3mf\|3mf" build-wasm/CMakeCache.txt
```

You should see:

```text
ENABLE_LIB3MF
```

and:

```text
lib3mf.a
```

in the Emscripten sysroot.

---

## Build

```bash
cmake --build build-wasm --parallel
```

Eventually you should see:

```text
Linking CXX executable openscad.js
```

---

## Build Artifacts

The final artifacts are:

```text
build-wasm/

openscad.js
openscad.wasm
```

Copy them into:

```text
public/

openscad.js
openscad.wasm
```

The browser application will automatically use the custom runtime.

---

## Why Use Docker?

Do **not** assume OpenSCAD WASM will build correctly on an arbitrary Linux distribution.

The Docker image provides:

* Correct Emscripten version
* Matching Boost
* Matching CGAL
* Correct Qt build
* Lib3MF support
* Known working dependency versions

In practice:

```text
Random Distro
      ↓
Dependency Hell
      ↓
Version Conflicts
      ↓
Build Failures
```

Versus:

```text
Docker
      ↓
emcmake cmake
      ↓
cmake --build
      ↓
openscad.js
openscad.wasm
```

---

## Example

```scad
rotate([0,0,-30]) {

    cube([23,12,10]);

    translate([0.5, 4.4, 9.9]) {

        color("red") {

            linear_extrude(height=2) {

                text(
                    "OpenSCAD",
                    size=3,
                    font="Pacifico-Regular"
                );
            }
        }
    }
}
```

This will render in the browser using:

* OpenSCAD WASM
* 3MF export
* ThreeMFLoader
* Three.js
* Preserved materials and colors

---

## Inspiration

This project was inspired by MakerLab's Parametric Model Maker.

The goal was not simply to create parametric models.

The goal was to reproduce the **entire pipeline**:

```text
SCAD
 ↓
OpenSCAD WASM
 ↓
3MF Export
 ↓
ArrayBuffer
 ↓
ThreeMFLoader
 ↓
Three.js
 ↓
Browser CAD Viewer
```

Which eventually became this project.
