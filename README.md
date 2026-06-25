# Khubaib Nazeer — Portfolio

Personal portfolio site for Khubaib Nazeer, CS undergrad at FAST NUCES Lahore.
Plain HTML/CSS/JS — no build step, no framework.

**Live:** https://khubaib7-del.github.io/Khubaib-Nazeer-Protfolio/

## Stack

- Vanilla HTML/CSS/JS (ES modules)
- [GSAP](https://gsap.com/) + ScrollTrigger for scroll-driven animation
- [Lenis](https://github.com/darkroomengineering/lenis) for smooth scroll
- [Three.js](https://threejs.org/) for the hero 3D room scene
- Canvas 2D for the pixel-art finale

## Running locally

No build step — serve the folder with any static file server:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Structure

```
index.html
css/style.css        — all styles
js/                   — main.js + one module per interactive feature
assets/videos/        — project demo clips (compressed before committing — see .gitignore)
content/              — draft bio/project copy, not read at runtime
```

## Deploying

Pushed to `main` → served via GitHub Pages from the repo root.
