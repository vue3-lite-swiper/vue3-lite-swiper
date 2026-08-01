# Introduction

**Vue3 Lite Swiper** is a lightweight Vue 3 carousel component with no carousel-specific runtime dependencies (Vue is a peer dependency). It handles touch and mouse drag, snap positioning, infinite looping, and autoplay.

## Why Vue3 Lite Swiper?

Most carousel libraries ship with their own animation engine, event system, and DOM abstractions. Vue3 Lite Swiper keeps things simple:

- **Lightweight** — No carousel-specific runtime dependencies, small bundle footprint
- **SSR Compatible** — Safe to use in Nuxt and other SSR frameworks out of the box
- **Looping** — Smooth infinite looping without visual jumps or layout shifts
- **TypeScript** — Fully typed slot props with your own data shape
- **Touch & Mouse** — Native drag support works seamlessly on desktop and mobile
- **Two Layout Modes** — Fixed-width grids or fluid auto-sizing to fit any design

## Features

- Touch and mouse drag with snap positioning
- Two layout modes: **fixed** width and **auto** width
- Infinite loop
- Autoplay with a configurable interval and hover pause
- Control via template ref: `next()`, `previous()`, `goToIndex()`
