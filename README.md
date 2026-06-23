# OpenSCAD MakerLab

A browser-based parametric CAD playground inspired by MakerLab's Parametric Model Maker.

Combines **React**, **TypeScript**, **OpenSCAD WebAssembly**, **3MF export**, **Three.js**, and an **Express backend** into a full-stack modeling environment with color-preserving rendering.

---

## Features

* Monaco-based SCAD editor with syntax highlighting
* Browser-side OpenSCAD rendering via WebAssembly (Web Worker, non-blocking)
* Assembly and plate view selector — detected automatically from module names
* 3MF export with preserved colors and materials
* Three.js + ThreeMFLoader 3D preview with orbit controls
* Resizable editor / viewer / customize panes
* Output log panel with error/warning highlighting
* Custom font support
* Express backend with versioned REST API (`/api/v1/`)

---

## Module Naming Convention

Special module names are detected automatically by the view selector.

```scad
module osl_assembly_view() {
  // full assembled model
}

module osl_plate_1() {
  // first print plate
}

module osl_plate_2() {
  // second print plate
}
```

The editor scans for these and exposes **Assembly View**, **Plate 1**, **Plate 2**, etc. in the view selector overlay. Top-level SCAD statements are global and included in every render.

---

## Architecture

```text
┌─────────────────────────────────────────┐
│              Frontend (Vite + React)    │
│                                         │
│  TopAppBar  ─  Code | View | Customize  │
│                                         │
│  EditorPane          ViewerPane         │
│  └─ Monaco Editor    └─ Three.js        │
│                         ThreeMFLoader   │
│  CustomizePane          ViewSelector    │
│  └─ Generate button                    │
│     └─ LogPanel                        │
│                                         │
│  Web Worker                             │
│  └─ OpenSCAD WASM → 3MF → ArrayBuffer  │
└────────────────────┬────────────────────┘
                     │ /api/v1  (proxy in dev)
┌────────────────────▼────────────────────┐
│              Backend (Express)          │
│                                         │
│  /api/v1/health    →  health check      │
│  /api/v1/export    →  export jobs       │
└─────────────────────────────────────────┘
```

---

## Project Structure

```text
openscad-makerlab/
├── frontend/                   # Vite + React app
│   ├── src/
│   │   ├── components/         # UI components
│   │   ├── hooks/              # useOpenScadRenderer
│   │   ├── services/           # SCAD scanner, renderer client, build helpers
│   │   ├── types/              # Shared TS types (RenderTarget, RenderResult…)
│   │   └── workers/            # openscad.worker.ts, fonts.ts
│   ├── public/
│   │   ├── openscad.js         # Custom OpenSCAD WASM runtime
│   │   ├── openscad.wasm
│   │   └── fonts/
│   └── vite.config.ts          # Dev proxy: /api → localhost:3001
│
├── backend/                    # Express API server
│   └── src/
│       ├── server.ts           # Entry point, mounts /api/v1
│       ├── routes/             # Route definitions
│       ├── controllers/        # Request handlers
│       ├── services/           # Business logic, export jobs, 3MF handling
│       └── types/              # Backend TS types
│
└── openscad-wasm/              # Git submodule — custom WASM build
```

---

## Running the Project

Install deps for each workspace:

```bash
cd frontend && npm install
cd ../backend && npm install
```

Start both in separate terminals:

```bash
# Terminal 1 — frontend (http://localhost:5173)
cd frontend && npm run dev

# Terminal 2 — backend (http://localhost:3001)
cd backend && npm run dev
```

The Vite dev server proxies all `/api` requests to the backend automatically — no CORS configuration needed during development.

Build for production:

```bash
cd frontend && npm run build
cd ../backend && npm run build
```

---

## API

Base path: `/api/v1`

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Returns `200 OK` |
| `POST` | `/export` | Export job endpoint |

---

## Fonts

Place font files in `frontend/public/fonts/`. They are mounted into the OpenSCAD virtual filesystem at render time.

```scad
linear_extrude(height = 2)
  text("Hello", font = "Pacifico-Regular", size = 10);
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
cd openscad-wasm
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

From the `openscad-wasm` directory:

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
frontend/public/

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
