# Homepage Background Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a first-visit particle intro hero that auto-transitions into a restrained structured legal network background used on the home screen and backend surfaces.

**Architecture:** Split the current single background effect into two focused Vue components: one short-lived particle intro background and one long-lived structured network background. Let `App.vue` own the intro state machine, early-dismiss interactions, and which surfaces render the long-lived background so the visual system is reusable without entangling existing chat state.

**Tech Stack:** Vue 3 with `<script setup lang="ts">`, WebGL via raw canvas shaders, existing app-local CSS in `frontend/src/style.css`, Vite build verification.

---

## File Map

- Create: `frontend/src/components/IntroParticleHeroBackground.vue`
  - Short-lived first-visit WebGL particle layer centered around the product name and subtitle.
- Create: `frontend/src/components/StructuredLegalNetworkBackground.vue`
  - Long-lived low-motion legal network background for home and backend surfaces.
- Modify: `frontend/src/App.vue`
  - Replace the single background import, add intro state/timers/event dismissal, and mount the new backgrounds in the right places.
- Modify: `frontend/src/style.css`
  - Add the intro overlay, transition states, background host containers, and ensure readable layering for home and backend content.
- Test: `frontend` build via `npm run build`

### Task 1: Add the structured long-lived legal network background

**Files:**
- Create: `frontend/src/components/StructuredLegalNetworkBackground.vue`
- Modify: `frontend/src/App.vue`
- Modify: `frontend/src/style.css`
- Test: `frontend` build

- [ ] **Step 1: Write the failing integration target**

The new component must support a restrained network look and expose a reusable root class for both the home screen and backend content shells.

```vue
<!-- frontend/src/App.vue -->
<script setup lang="ts">
import StructuredLegalNetworkBackground from './components/StructuredLegalNetworkBackground.vue'
</script>

<template>
  <section class="home-stage">
    <StructuredLegalNetworkBackground class="page-network-background" />
  </section>
</template>
```

Expected current result before implementation: import fails because `frontend/src/components/StructuredLegalNetworkBackground.vue` does not exist.

- [ ] **Step 2: Verify the target is currently missing**

Run:

```bash
test -f frontend/src/components/StructuredLegalNetworkBackground.vue
```

Expected: command exits non-zero because the component has not been created yet.

- [ ] **Step 3: Create the minimal structured network component**

Create `frontend/src/components/StructuredLegalNetworkBackground.vue` with a focused WebGL implementation and a CSS fallback:

```vue
<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

const canvasRef = ref<HTMLCanvasElement | null>(null)
const shaderAvailable = ref(true)

let animationFrame = 0
let resizeObserver: ResizeObserver | null = null
let gl: WebGLRenderingContext | null = null
let pointerX = 0.5
let pointerY = 0.5
let pointerDrift = 0

const vertexShaderSource = `
attribute vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`

const fragmentShaderSource = `
precision highp float;

uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;
uniform float u_drift;

float hash(float n) {
  return fract(sin(n) * 43758.5453123);
}

vec2 latticePoint(float id) {
  float x = mod(id, 6.0);
  float y = floor(id / 6.0);
  return vec2(
    mix(-0.92, 0.92, x / 5.0),
    mix(-0.68, 0.68, y / 4.0)
  );
}

vec2 nodePosition(float id, float t) {
  vec2 base = latticePoint(id);
  float phase = hash(id * 8.17);
  vec2 offset = vec2(
    sin(t * (0.055 + phase * 0.035) + phase * 6.2831),
    cos(t * (0.048 + phase * 0.028) + phase * 4.7123)
  ) * (0.012 + phase * 0.02);

  vec2 mouse = vec2(mix(-1.0, 1.0, u_mouse.x), mix(0.8, -0.8, u_mouse.y));
  vec2 toMouse = mouse - base;
  vec2 drift = normalize(toMouse + vec2(0.0001)) * min(length(toMouse), 0.45) * u_drift * 0.03;
  return base + offset + drift;
}

float segmentDistance(vec2 p, vec2 a, vec2 b) {
  vec2 pa = p - a;
  vec2 ba = b - a;
  float denom = max(dot(ba, ba), 0.0001);
  float h = clamp(dot(pa, ba) / denom, 0.0, 1.0);
  return length(pa - ba * h);
}

void main() {
  vec2 uv = (2.0 * gl_FragCoord.xy - u_resolution.xy) / u_resolution.y;
  float t = u_time;

  vec3 color = vec3(0.038, 0.055, 0.092);
  color += 0.05 * vec3(0.22, 0.18, 0.1) * exp(-6.0 * dot(uv - vec2(0.0, 0.12), uv - vec2(0.0, 0.12)));

  const int NODE_COUNT = 30;
  for (int i = 0; i < NODE_COUNT; i++) {
    float id = float(i);
    vec2 pos = nodePosition(id, t);
    vec2 right = nodePosition(mod(id + 1.0, 6.0) + floor(id / 6.0) * 6.0, t);
    vec2 down = nodePosition(mod(id + 6.0, float(NODE_COUNT)), t);

    float nodeDistance = length(uv - pos);
    float nodeGlow = exp(-340.0 * nodeDistance * nodeDistance / 0.00018);
    vec3 nodeColor = mix(vec3(0.76, 0.67, 0.43), vec3(0.87, 0.91, 0.97), hash(id * 3.1));
    color += nodeColor * nodeGlow * 0.16;

    if (mod(id, 6.0) < 5.0) {
      float line = exp(-segmentDistance(uv, pos, right) * 240.0);
      color += mix(vec3(0.18, 0.24, 0.36), vec3(0.64, 0.55, 0.34), hash(id + 2.0)) * line * 0.045;
    }

    if (id < 24.0) {
      float line = exp(-segmentDistance(uv, pos, down) * 255.0);
      color += mix(vec3(0.15, 0.22, 0.34), vec3(0.56, 0.5, 0.32), hash(id + 4.0)) * line * 0.038;
    }
  }

  float vignette = smoothstep(1.42, 0.2, length(uv * vec2(1.0, 1.12)));
  color *= vignette;

  gl_FragColor = vec4(clamp(color, 0.0, 1.0), 1.0);
}
`

function compileShader(context: WebGLRenderingContext, type: number, source: string) {
  const shader = context.createShader(type)
  if (!shader) {
    throw new Error('Shader creation failed')
  }
  context.shaderSource(shader, source)
  context.compileShader(shader)
  if (!context.getShaderParameter(shader, context.COMPILE_STATUS)) {
    const info = context.getShaderInfoLog(shader) || 'Unknown shader compile error'
    context.deleteShader(shader)
    throw new Error(info)
  }
  return shader
}

function createProgram(context: WebGLRenderingContext) {
  const vertexShader = compileShader(context, context.VERTEX_SHADER, vertexShaderSource)
  const fragmentShader = compileShader(context, context.FRAGMENT_SHADER, fragmentShaderSource)
  const program = context.createProgram()
  if (!program) {
    throw new Error('Program creation failed')
  }

  context.attachShader(program, vertexShader)
  context.attachShader(program, fragmentShader)
  context.linkProgram(program)

  context.deleteShader(vertexShader)
  context.deleteShader(fragmentShader)

  if (!context.getProgramParameter(program, context.LINK_STATUS)) {
    const info = context.getProgramInfoLog(program) || 'Unknown program link error'
    context.deleteProgram(program)
    throw new Error(info)
  }

  return program
}

function resizeCanvas() {
  const canvas = canvasRef.value
  if (!canvas || !gl) {
    return
  }

  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  const width = Math.max(1, Math.floor(canvas.clientWidth * dpr))
  const height = Math.max(1, Math.floor(canvas.clientHeight * dpr))

  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width
    canvas.height = height
    gl.viewport(0, 0, width, height)
  }
}

function startShader() {
  const canvas = canvasRef.value
  if (!canvas) {
    return
  }

  gl = canvas.getContext('webgl', { alpha: true, antialias: true, premultipliedAlpha: true })
  if (!gl) {
    shaderAvailable.value = false
    return
  }

  const program = createProgram(gl)
  const positionLocation = gl.getAttribLocation(program, 'a_position')
  const resolutionLocation = gl.getUniformLocation(program, 'u_resolution')
  const timeLocation = gl.getUniformLocation(program, 'u_time')
  const mouseLocation = gl.getUniformLocation(program, 'u_mouse')
  const driftLocation = gl.getUniformLocation(program, 'u_drift')

  const buffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    -1, -1,
    1, -1,
    -1, 1,
    -1, 1,
    1, -1,
    1, 1,
  ]), gl.STATIC_DRAW)

  gl.useProgram(program)
  gl.enableVertexAttribArray(positionLocation)
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0)

  const startTime = performance.now()
  const render = () => {
    if (!gl || !canvasRef.value) {
      return
    }

    pointerDrift = Math.max(0.0, pointerDrift * 0.96)
    resizeCanvas()

    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.uniform2f(resolutionLocation, canvasRef.value.width, canvasRef.value.height)
    gl.uniform1f(timeLocation, (performance.now() - startTime) / 1000)
    gl.uniform2f(mouseLocation, pointerX, pointerY)
    gl.uniform1f(driftLocation, Math.min(pointerDrift, 1.0))
    gl.drawArrays(gl.TRIANGLES, 0, 6)

    animationFrame = window.requestAnimationFrame(render)
  }

  resizeCanvas()
  render()
}

function handlePointerMove(event: PointerEvent) {
  pointerX = event.clientX / window.innerWidth
  pointerY = event.clientY / window.innerHeight
  pointerDrift = 0.35
}

onMounted(() => {
  startShader()
  window.addEventListener('pointermove', handlePointerMove)

  if (canvasRef.value) {
    resizeObserver = new ResizeObserver(() => resizeCanvas())
    resizeObserver.observe(canvasRef.value)
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('pointermove', handlePointerMove)
  if (animationFrame) {
    window.cancelAnimationFrame(animationFrame)
  }
  resizeObserver?.disconnect()
  gl = null
})
</script>

<template>
  <div class="structured-network-background" :class="{ 'is-fallback': !shaderAvailable }" aria-hidden="true">
    <canvas v-if="shaderAvailable" ref="canvasRef" class="structured-network-canvas" />
    <div class="structured-network-fallback" />
    <div class="structured-network-grid" />
  </div>
</template>

<style scoped>
.structured-network-background {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.structured-network-canvas,
.structured-network-fallback,
.structured-network-grid {
  position: absolute;
  inset: 0;
}

.structured-network-fallback {
  background:
    radial-gradient(circle at 50% 22%, rgba(179, 151, 96, 0.12), transparent 22%),
    linear-gradient(180deg, rgba(8, 16, 28, 0.96) 0%, rgba(11, 21, 35, 0.92) 54%, rgba(10, 16, 24, 0.96) 100%);
}

.structured-network-grid {
  background:
    linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px),
    linear-gradient(rgba(255, 255, 255, 0.018) 1px, transparent 1px);
  background-size: 120px 120px;
  mask-image: radial-gradient(circle at center, black 18%, transparent 92%);
  opacity: 0.22;
}

.is-fallback .structured-network-grid {
  opacity: 0.16;
}
</style>
```

- [ ] **Step 4: Mount the new background behind the main app surfaces**

Update `frontend/src/App.vue` to import the new component and replace the current always-on hero background on the home stage with the new structured background host:

```vue
<script setup lang="ts">
import IntroParticleHeroBackground from './components/IntroParticleHeroBackground.vue'
import StructuredLegalNetworkBackground from './components/StructuredLegalNetworkBackground.vue'
</script>
```

```vue
<section v-if="!isConversationMode" class="home-stage">
  <StructuredLegalNetworkBackground />
  <div class="home-stage-inner">
    <!-- existing brand and input content -->
  </div>
</section>
```

Also add the same background host to the broader content area so history and notes surfaces share the same visual language:

```vue
<main class="content-shell" :class="{ 'has-page-network': currentPage !== 'home' || isConversationMode }">
  <StructuredLegalNetworkBackground v-if="currentPage !== 'home' || isConversationMode" />
  <!-- existing page content -->
</main>
```

- [ ] **Step 5: Add the required layering styles**

Extend `frontend/src/style.css` with the background host rules:

```css
.content-shell {
  position: relative;
  isolation: isolate;
}

.content-shell.has-page-network::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 0;
  background: linear-gradient(180deg, rgba(8, 14, 24, 0.95) 0%, rgba(10, 18, 30, 0.88) 100%);
  border-radius: 32px 0 0 0;
  pointer-events: none;
}

.content-shell > * {
  position: relative;
  z-index: 1;
}

.home-stage {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  min-height: 620px;
  background: linear-gradient(180deg, rgba(9, 16, 27, 0.96) 0%, rgba(11, 20, 32, 0.92) 100%);
}

.home-stage-inner {
  position: relative;
  z-index: 1;
}
```

- [ ] **Step 6: Run the build and verify the structured background passes**

Run:

```bash
cd frontend && npm run build
```

Expected: Vite build succeeds and emits updated CSS/JS assets without TypeScript or shader compile errors.

- [ ] **Step 7: Commit**

```bash
git add frontend/src/components/StructuredLegalNetworkBackground.vue frontend/src/App.vue frontend/src/style.css
git commit -m "feat: add structured legal network background"
```

### Task 2: Add the first-visit particle intro overlay

**Files:**
- Create: `frontend/src/components/IntroParticleHeroBackground.vue`
- Modify: `frontend/src/App.vue`
- Modify: `frontend/src/style.css`
- Test: `frontend` build

- [ ] **Step 1: Write the failing integration target**

The home page needs a full-screen intro overlay component that can be shown above the structured background, centered around the brand copy, then faded out.

```vue
<IntroParticleHeroBackground
  v-if="showIntroHero"
  class="intro-hero-layer"
  :exiting="introHeroExiting"
/>
```

Expected current result before implementation: the import fails because `frontend/src/components/IntroParticleHeroBackground.vue` does not exist.

- [ ] **Step 2: Verify the target is currently missing**

Run:

```bash
test -f frontend/src/components/IntroParticleHeroBackground.vue
```

Expected: command exits non-zero because the component has not been created yet.

- [ ] **Step 3: Create the minimal intro particle component**

Create `frontend/src/components/IntroParticleHeroBackground.vue` using the more active particle behavior currently living in `HeroShaderBackground.vue`, but scoped for the intro overlay:

```vue
<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const props = defineProps<{
  exiting?: boolean
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const shaderAvailable = ref(true)

let animationFrame = 0
let resizeObserver: ResizeObserver | null = null
let gl: WebGLRenderingContext | null = null
let pointerX = 0.5
let pointerY = 0.34
let pointerActivity = 0

const layerClass = computed(() => ({
  'is-exiting': !!props.exiting,
  'is-fallback': !shaderAvailable.value,
}))

const vertexShaderSource = `
attribute vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`

const fragmentShaderSource = `
precision highp float;

uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;
uniform float u_activity;

const float PI = 3.14159265359;
const int NODE_COUNT = 34;
const int EXTRA_NODE_COUNT = 16;

float hash(float n) {
  return fract(sin(n) * 43758.5453123);
}

vec2 clusterCenter(float id) {
  float cluster = mod(id, 4.0);
  if (cluster < 1.0) return vec2(-0.28, 0.18);
  if (cluster < 2.0) return vec2(0.0, 0.24);
  if (cluster < 3.0) return vec2(0.28, 0.18);
  return vec2(0.0, -0.02);
}

vec2 pointerPosition() {
  return vec2(
    mix(-1.0, 1.0, u_mouse.x),
    mix(0.8, -0.8, u_mouse.y)
  );
}

vec2 nodePosition(float id, float t) {
  float seedA = hash(id * 13.17 + 0.37);
  float seedB = hash(id * 29.73 + 4.11);
  float seedC = hash(id * 7.31 + 9.27);
  float seedD = hash(id * 19.91 + 2.83);

  vec2 center = clusterCenter(id) + vec2(
    mix(-0.28, 0.28, seedA),
    mix(-0.18, 0.18, seedB)
  );

  vec2 drift = vec2(
    sin(t * (0.12 + seedC * 0.13) + seedA * PI * 2.0),
    cos(t * (0.1 + seedD * 0.11) + seedB * PI * 2.0)
  ) * (0.038 + seedC * 0.05);

  vec2 mouse = pointerPosition();
  vec2 toMouse = mouse - center;
  vec2 mousePull = normalize(toMouse + vec2(0.0001)) * min(length(toMouse), 0.5) * u_activity * 0.11;
  vec2 gather = normalize(center + vec2(0.0001, 0.0001)) * (0.04 + 0.035 * sin(t * 0.18 + id * 0.3));

  return center * 0.9 + drift + mousePull - gather * 0.08;
}

float segmentDistance(vec2 p, vec2 a, vec2 b) {
  vec2 pa = p - a;
  vec2 ba = b - a;
  float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
  return length(pa - ba * h);
}

vec3 particleColor(float id) {
  float warmMix = hash(id * 5.17 + 1.0);
  vec3 deepBlue = vec3(0.16, 0.31, 0.58);
  vec3 coldWhite = vec3(0.86, 0.91, 0.96);
  vec3 mutedGold = vec3(0.72, 0.58, 0.32);
  return mix(mix(deepBlue, coldWhite, 0.55), mutedGold, warmMix * 0.34);
}

void main() {
  vec2 uv = (2.0 * gl_FragCoord.xy - u_resolution.xy) / u_resolution.y;
  float t = u_time;
  vec2 mouse = pointerPosition();

  vec3 color = vec3(0.024, 0.042, 0.085);
  color += 0.14 * vec3(0.06, 0.14, 0.28) * exp(-4.5 * dot(uv - vec2(0.0, 0.22), uv - vec2(0.0, 0.22)));
  color += 0.08 * vec3(0.18, 0.14, 0.08) * exp(-7.0 * dot(uv - vec2(0.0, -0.02), uv - vec2(0.0, -0.02)));
  color += 0.05 * vec3(0.75, 0.67, 0.42) * exp(-20.0 * dot(uv - mouse, uv - mouse)) * u_activity;

  for (int i = 0; i < NODE_COUNT; i++) {
    float id = float(i);
    vec2 pos = nodePosition(id, t);
    vec2 neighborA = nodePosition(mod(id + 1.0, float(NODE_COUNT)), t);
    vec2 neighborB = nodePosition(mod(id + 7.0, float(NODE_COUNT)), t);

    float d = length(uv - pos);
    float size = 0.0038 + hash(id * 2.3 + 8.0) * 0.0048;
    float glow = exp(-220.0 * d * d / max(size * size, 0.00001));
    float core = smoothstep(size * 1.1, size * 0.2, d);

    float lineA = exp(-segmentDistance(uv, pos, neighborA) * 175.0);
    float lineB = exp(-segmentDistance(uv, pos, neighborB) * 190.0);
    float linkMask = smoothstep(0.36, 0.08, length(pos - neighborA)) * 0.65
      + smoothstep(0.42, 0.12, length(pos - neighborB)) * 0.35;

    vec3 pc = particleColor(id);
    color += pc * glow * 0.22;
    color += mix(pc, vec3(0.95, 0.97, 1.0), 0.5) * core * 0.48;
    color += mix(vec3(0.14, 0.24, 0.42), vec3(0.72, 0.6, 0.36), hash(id + 3.0)) * (lineA + lineB) * linkMask * 0.07;
  }

  for (int i = 0; i < EXTRA_NODE_COUNT; i++) {
    float id = float(i) + 100.0;
    vec2 pos = nodePosition(id, t + 0.6) + (mouse - vec2(0.0, 0.1)) * 0.28;
    float d = length(uv - pos);
    float size = 0.0024 + hash(id * 1.7) * 0.0034;
    float glow = exp(-260.0 * d * d / max(size * size, 0.00001));
    vec3 pc = mix(vec3(0.46, 0.72, 0.94), vec3(0.82, 0.72, 0.45), hash(id + 9.0));
    color += pc * glow * u_activity * 0.32;
  }

  float vignette = smoothstep(1.55, 0.18, length(uv * vec2(1.0, 1.15)));
  color *= vignette;
  gl_FragColor = vec4(clamp(color, 0.0, 1.0), 1.0);
}
`

/* reuse the same compile/create/resize helpers pattern as the structured component */
```

Use the same helper structure as Task 1 for `compileShader`, `createProgram`, `resizeCanvas`, render loop, and cleanup. In `handlePointerMove`, set `pointerActivity = Math.min(pointerActivity + 0.2, 1.0)` to create stronger first-visit interaction.

Template and scoped styles:

```vue
<template>
  <div class="intro-particle-hero" :class="layerClass" aria-hidden="true">
    <canvas v-if="shaderAvailable" ref="canvasRef" class="intro-particle-canvas" />
    <div class="intro-particle-fallback" />
    <div class="intro-particle-overlay" />
  </div>
</template>

<style scoped>
.intro-particle-hero {
  position: absolute;
  inset: 0;
  pointer-events: none;
  transition: opacity 0.72s ease, transform 0.72s ease, filter 0.72s ease;
}

.intro-particle-canvas,
.intro-particle-fallback,
.intro-particle-overlay {
  position: absolute;
  inset: 0;
}

.intro-particle-fallback {
  background:
    radial-gradient(circle at 50% 40%, rgba(190, 157, 96, 0.22), transparent 22%),
    linear-gradient(180deg, rgba(8, 16, 29, 0.98) 0%, rgba(8, 15, 25, 0.96) 100%);
}

.intro-particle-overlay {
  background:
    radial-gradient(circle at 50% 40%, rgba(255, 255, 255, 0.04), transparent 30%),
    linear-gradient(180deg, rgba(3, 8, 15, 0.08) 0%, rgba(3, 8, 15, 0.26) 100%);
}

.is-exiting {
  opacity: 0;
  transform: scale(1.015);
  filter: blur(8px);
}
</style>
```

- [ ] **Step 4: Add intro state, timers, and early-dismiss events in `App.vue`**

Add the state near the other refs:

```ts
const showIntroHero = ref(true)
const introHeroExiting = ref(false)
let introHeroTimer: number | null = null
let introHeroExitTimer: number | null = null
```

Add the lifecycle helpers:

```ts
function finishIntroHero() {
  if (!showIntroHero.value || introHeroExiting.value) {
    return
  }
  introHeroExiting.value = true
  if (introHeroTimer) {
    window.clearTimeout(introHeroTimer)
    introHeroTimer = null
  }
  introHeroExitTimer = window.setTimeout(() => {
    showIntroHero.value = false
    introHeroExiting.value = false
    introHeroExitTimer = null
  }, 720)
}

function handleIntroDismiss() {
  finishIntroHero()
}
```

In `onMounted`:

```ts
onMounted(() => {
  handleHashChange()
  window.addEventListener('hashchange', handleHashChange)
  introHeroTimer = window.setTimeout(() => {
    finishIntroHero()
  }, 2800)
  window.addEventListener('pointerdown', handleIntroDismiss)
  window.addEventListener('wheel', handleIntroDismiss, { passive: true })
  window.addEventListener('keydown', handleIntroDismiss)
  loadInputConfig()
  loadSavedHistory()
})
```

In `onBeforeUnmount`:

```ts
if (introHeroTimer) {
  window.clearTimeout(introHeroTimer)
}
if (introHeroExitTimer) {
  window.clearTimeout(introHeroExitTimer)
}
window.removeEventListener('pointerdown', handleIntroDismiss)
window.removeEventListener('wheel', handleIntroDismiss)
window.removeEventListener('keydown', handleIntroDismiss)
```

Also dismiss on direct intent:

```ts
function focusComposer() {
  finishIntroHero()
}
```

Attach it to the composer input:

```vue
<textarea @focus="focusComposer" />
```

- [ ] **Step 5: Mount the intro overlay above the home stage only**

Update the top of the home stage template:

```vue
<section v-if="!isConversationMode" class="home-stage">
  <StructuredLegalNetworkBackground />
  <IntroParticleHeroBackground
    v-if="currentPage === 'home' && showIntroHero"
    :exiting="introHeroExiting"
  />
  <div class="home-stage-inner" :class="{ 'intro-active': showIntroHero }">
    <div class="home-heading" :class="{ 'is-intro-centered': showIntroHero }">
      <p class="home-brand-kicker">AI Legal Intelligence</p>
      <h1 class="home-title">法小智</h1>
      <p class="home-subtitle">你的个人智能法律知识库</p>
    </div>
    <!-- existing home input block -->
  </div>
</section>
```

- [ ] **Step 6: Add the intro presentation styles**

Extend `frontend/src/style.css`:

```css
.home-stage {
  min-height: 78vh;
}

.home-stage-inner {
  display: grid;
  align-content: center;
  min-height: inherit;
  padding: 52px 56px;
  transition: transform 0.6s ease, opacity 0.6s ease;
}

.home-stage-inner.intro-active {
  justify-items: center;
  text-align: center;
}

.home-heading.is-intro-centered {
  max-width: 760px;
  gap: 14px;
}

.home-title {
  font-size: clamp(3.2rem, 8vw, 5.6rem);
  letter-spacing: 0.06em;
}

.home-subtitle {
  color: rgba(214, 222, 236, 0.82);
}
```

- [ ] **Step 7: Run the build and verify the intro overlay passes**

Run:

```bash
cd frontend && npm run build
```

Expected: the build succeeds with both background components and the intro state logic compiling cleanly.

- [ ] **Step 8: Commit**

```bash
git add frontend/src/components/IntroParticleHeroBackground.vue frontend/src/App.vue frontend/src/style.css
git commit -m "feat: add homepage particle intro overlay"
```

### Task 3: Remove the old single-background coupling and verify the visual system end-to-end

**Files:**
- Modify: `frontend/src/App.vue`
- Modify: `frontend/src/style.css`
- Delete or stop using: `frontend/src/components/HeroShaderBackground.vue`
- Test: `frontend` build

- [ ] **Step 1: Write the failing cleanup target**

The app should no longer rely on `HeroShaderBackground.vue`; the background responsibilities must be handled by the two new components with clear ownership.

```ts
import HeroShaderBackground from './components/HeroShaderBackground.vue'
```

Expected final state: this import is removed entirely.

- [ ] **Step 2: Remove the old import and old template usage**

Update `frontend/src/App.vue`:

```ts
// remove this line entirely
import HeroShaderBackground from './components/HeroShaderBackground.vue'
```

Also remove any legacy `<HeroShaderBackground />` nodes from the home stage template so only the new components remain.

- [ ] **Step 3: Decide whether to delete the obsolete component**

If `rg "HeroShaderBackground" frontend/src` returns only the component file itself, delete the obsolete file:

Run:

```bash
rg "HeroShaderBackground" frontend/src
```

Expected after cleanup: no references from `App.vue` or any other source file.

If the only remaining result is `frontend/src/components/HeroShaderBackground.vue`, remove it.

```bash
rm frontend/src/components/HeroShaderBackground.vue
```

- [ ] **Step 4: Tighten the long-lived background for reading-heavy screens**

Update `frontend/src/style.css` so cards and chat surfaces stay readable on the darker shared background:

```css
.conversation-shell,
.history-card,
.review-card,
.summary-card {
  background: rgba(250, 249, 246, 0.76);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow:
    0 22px 60px rgba(2, 6, 12, 0.28),
    inset 0 1px 0 rgba(255, 255, 255, 0.22);
}

.sidebar-shell {
  background:
    linear-gradient(180deg, rgba(10, 18, 28, 0.94) 0%, rgba(12, 21, 32, 0.92) 100%);
  border-right: 1px solid rgba(193, 169, 122, 0.08);
}

.sidebar-brand-title,
.sidebar-section-title,
.sidebar-nav-item,
.sidebar-history-item strong {
  color: #edf1f7;
}

.sidebar-brand-subtitle,
.sidebar-empty,
.sidebar-history-item span {
  color: rgba(204, 214, 230, 0.72);
}
```

- [ ] **Step 5: Run the full build verification**

Run:

```bash
cd frontend && npm run build
```

Expected: build succeeds after removing the old component coupling.

- [ ] **Step 6: Manual verification checklist**

Run the dev server if needed:

```bash
cd frontend && npm run dev
```

Verify manually:

```text
1. Open the app on the home page.
2. Confirm the first-visit particle intro is visible immediately.
3. Wait about 2.8 seconds and confirm it fades into the structured network background.
4. Refresh and confirm the intro appears again.
5. Refresh, then click or scroll immediately and confirm the intro exits early.
6. Navigate to history and notes and confirm the structured network language persists without the particle overlay.
7. Open a conversation and confirm cards remain readable against the darker background.
```

- [ ] **Step 7: Commit**

```bash
git add frontend/src/App.vue frontend/src/style.css frontend/src/components/IntroParticleHeroBackground.vue frontend/src/components/StructuredLegalNetworkBackground.vue
git rm -f frontend/src/components/HeroShaderBackground.vue
git commit -m "feat: split intro and persistent app backgrounds"
```

## Self-Review

### Spec coverage

- First-visit particle hero: covered by Task 2.
- Auto transition after 2.8 seconds and early dismiss on interaction: covered by Task 2.
- Structured long-lived legal network for home and backend: covered by Task 1.
- Clear component boundaries instead of a single shader: covered by Tasks 1 through 3.
- Visual readability and fallback handling: covered by Tasks 1 and 3.

### Placeholder scan

- Removed generic “add error handling later” language.
- Each code-edit step includes exact target files and representative code blocks.
- Each verification step includes exact commands and expected outcomes.

### Type consistency

- Intro state uses `showIntroHero` and `introHeroExiting` consistently in both script and template.
- Long-lived background component is named `StructuredLegalNetworkBackground` consistently.
- Intro overlay component is named `IntroParticleHeroBackground` consistently.
