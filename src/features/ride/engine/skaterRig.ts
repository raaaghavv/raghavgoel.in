import * as THREE from "three";
import { jersey as J, skaterColors as C, skaterLighting as L } from "@/config/theme";
import { motion } from "@/config/motion";
import type { Pose } from "./poses";

type V3 = [number, number, number];

/** Builds the toon-shaded skater rig and returns handles the engine drives each frame. */
export function createSkater(canvas: HTMLCanvasElement) {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  const scene = new THREE.Scene();
  const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, -2000, 2000);
  cam.position.z = 1000;
  scene.add(new THREE.AmbientLight(0xffffff, L.ambient));
  const sun = new THREE.DirectionalLight(0xffffff, L.sun);
  sun.position.set(...L.sunDirection);
  scene.add(sun);

  const bands = new Uint8Array(L.bands.flatMap((b) => [b, b, b, 255]));
  const grad = new THREE.DataTexture(bands, L.bands.length, 1, THREE.RGBAFormat);
  grad.minFilter = grad.magFilter = THREE.NearestFilter;
  grad.generateMipmaps = false;
  grad.needsUpdate = true;

  const mats = new Map<string, THREE.Material>();
  const toon = (c: string) => {
    let m = mats.get(c);
    if (!m) mats.set(c, (m = new THREE.MeshToonMaterial({ color: c, gradientMap: grad })));
    return m;
  };
  const lineMat = new THREE.MeshBasicMaterial({ color: C.outline, side: THREE.BackSide });
  const disposables: { dispose(): void }[] = [grad, lineMat];

  /** toon mesh + inverted-hull outline; geometry stays where authored, offset by pos */
  function part(
    parent: THREE.Object3D,
    geo: THREE.BufferGeometry,
    color: string,
    pos: V3 = [0, 0, 0],
    rot: V3 = [0, 0, 0],
    outline = L.outline,
  ) {
    geo.computeBoundingBox();
    const c = new THREE.Vector3(),
      s = new THREE.Vector3();
    geo.boundingBox!.getCenter(c);
    geo.boundingBox!.getSize(s);
    geo.translate(-c.x, -c.y, -c.z);
    disposables.push(geo);
    const m = new THREE.Mesh(geo, toon(color));
    if (outline) {
      const o = new THREE.Mesh(geo, lineMat);
      o.scale.set(...([s.x, s.y, s.z].map((v) => (v + outline * 2) / Math.max(v, 1e-3)) as V3));
      m.add(o);
    }
    m.position.copy(c).add(new THREE.Vector3(...pos));
    m.rotation.set(...rot);
    parent.add(m);
    return m;
  }
  const group = (parent: THREE.Object3D, pos: V3 = [0, 0, 0]) => {
    const g = new THREE.Group();
    g.position.set(...pos);
    parent.add(g);
    return g;
  };

  /** Jersey number: canvas texture on two curved patches hugging the hoodie (front +x, back -x). */
  function addJersey(parent: THREE.Object3D) {
    const cv = document.createElement("canvas");
    cv.width = cv.height = 256;
    const tex = new THREE.CanvasTexture(cv);
    tex.colorSpace = THREE.SRGBColorSpace;
    const draw = () => {
      const g = cv.getContext("2d")!;
      const family = getComputedStyle(document.documentElement).getPropertyValue(J.fontVar).trim();
      g.clearRect(0, 0, 256, 256);
      g.font = `150px ${family ? family + "," : ""} ${J.fallbackFont}`;
      g.textAlign = "center";
      g.textBaseline = "middle";
      g.lineJoin = "round";
      g.lineWidth = 22;
      g.strokeStyle = J.outline;
      g.strokeText(J.number, 128, 136);
      g.fillStyle = J.fill;
      g.fillText(J.number, 128, 136);
      tex.needsUpdate = true;
    };
    draw();
    document.fonts.ready.then(draw);
    const mat = new THREE.MeshToonMaterial({ map: tex, transparent: true, gradientMap: grad, alphaTest: 0.05 });
    disposables.push(tex, mat);
    // torso radius grows 0.36 → 0.40 over its 0.92 height; the patch spans y 0.34–0.80 and sits just above the surface
    const r = (y: number) => 0.36 + (y / 0.92) * 0.04 + 0.012;
    const y0 = 0.34,
      y1 = 0.8,
      arc = 1.5;
    [Math.PI / 2, -Math.PI / 2].forEach((center) => {
      const geo = new THREE.CylinderGeometry(r(y1), r(y0), y1 - y0, 24, 1, true, center - arc / 2, arc);
      geo.scale(1, 1, 0.78);
      disposables.push(geo);
      const m = new THREE.Mesh(geo, mat);
      m.position.y = (y0 + y1) / 2;
      parent.add(m);
    });
  }

  const L1 = 0.72,
    L2 = 0.72,
    ANKLE = 0.5;
  const body = new THREE.Group(); // origin = wheels on the ground
  const hips = group(body, [0, 1.9, 0]);
  part(hips, new THREE.SphereGeometry(0.34, 18, 12).scale(1, 0.7, 1), C.pants);

  function leg(z: number) {
    const thigh = group(hips, [0, -0.05, z]);
    part(thigh, new THREE.CylinderGeometry(0.16, 0.14, L1, 14), C.pants, [0, -L1 / 2, 0]);
    const shin = group(thigh, [0, -L1, 0]);
    part(shin, new THREE.SphereGeometry(0.155, 14, 10), C.pants);
    part(shin, new THREE.CylinderGeometry(0.14, 0.12, L2, 14), C.pants, [0, -L2 / 2, 0]);
    const foot = group(shin, [0, -L2, 0]);
    part(foot, new THREE.BoxGeometry(0.34, 0.34, 0.3), C.skate, [0, -0.08, 0]);
    part(foot, new THREE.BoxGeometry(0.5, 0.2, 0.3), C.skate, [0.1, -0.2, 0]);
    part(foot, new THREE.BoxGeometry(0.36, 0.07, 0.32), C.sole, [0, 0.1, 0], [0, 0, 0], 0.03);
    part(foot, new THREE.BoxGeometry(0.6, 0.06, 0.3), C.sole, [0.1, -0.33, 0], [0, 0, 0], 0.03);
    [-0.1, 0.3].forEach((x) =>
      [-0.12, 0.12].forEach((wz) =>
        part(
          foot,
          new THREE.CylinderGeometry(0.09, 0.09, 0.07, 14),
          C.wheels,
          [x, -0.41, wz],
          [Math.PI / 2, 0, 0],
          0.03,
        ),
      ),
    );
    return { thigh, shin, foot };
  }
  const legL = leg(0.2),
    legR = leg(-0.2);

  const spine = group(hips, [0, 0.08, 0]);
  const torso = new THREE.CylinderGeometry(0.4, 0.36, 0.92, 18);
  torso.scale(1, 1, 0.78);
  part(spine, torso, C.hoodie, [0, 0.46, 0]);
  addJersey(spine);
  part(spine, new THREE.SphereGeometry(0.26, 14, 10), C.hoodie, [-0.2, 0.9, 0]);
  const chest = group(spine, [0, 0.92, 0]);
  part(chest, new THREE.CylinderGeometry(0.1, 0.11, 0.16, 10), C.skin, [0, 0.07, 0], [0, 0, 0], 0.03);
  const head = group(chest, [0.02, 0.44, 0]);
  part(head, new THREE.SphereGeometry(0.32, 22, 16), C.skin);
  part(
    head,
    new THREE.SphereGeometry(0.335, 22, 12, 0, Math.PI * 2, 0, Math.PI / 2),
    C.beanie,
    [0, 0.04, 0],
    [0, 0, 0.25],
  );
  part(head, new THREE.CylinderGeometry(0.34, 0.34, 0.1, 22), C.beanieBand, [0, 0.05, 0], [0, 0, 0.25], 0.03);
  const pupils = [0.115, -0.115].map((z) => {
    const eye = group(head, [0.27, -0.03, z]);
    part(eye, new THREE.SphereGeometry(0.075, 12, 10), C.eyes, [0, 0, 0], [0, 0, 0], 0.02);
    return part(eye, new THREE.SphereGeometry(0.04, 10, 8), C.outline, [0.05, 0, 0], [0, 0, 0], 0);
  });
  part(head, new THREE.TorusGeometry(0.37, 0.035, 8, 26, Math.PI), C.outline, [0, 0.02, 0], [0, Math.PI / 2, 0], 0.02);
  [0.35, -0.35].forEach((z) =>
    part(
      head,
      new THREE.CylinderGeometry(0.13, 0.13, 0.09, 16),
      C.headphones,
      [0, -0.02, z],
      [Math.PI / 2, 0, 0],
      0.03,
    ),
  );

  function arm(z: number) {
    const sh = group(chest, [0, -0.08, z]);
    part(sh, new THREE.SphereGeometry(0.13, 12, 10), C.hoodie);
    part(sh, new THREE.CylinderGeometry(0.12, 0.11, 0.55, 12), C.hoodie, [0, -0.275, 0]);
    const el = group(sh, [0, -0.55, 0]);
    part(el, new THREE.SphereGeometry(0.11, 12, 10), C.hoodie);
    part(el, new THREE.CylinderGeometry(0.09, 0.08, 0.46, 12), C.skin, [0, -0.23, 0]);
    part(el, new THREE.SphereGeometry(0.1, 12, 10), C.skin, [0, -0.5, 0]);
    return { sh, el };
  }
  const armL = arm(0.44),
    armR = arm(-0.44);
  armL.sh.rotation.x = -0.12;
  armR.sh.rotation.x = 0.12;

  const tilt = new THREE.Group(); // 3/4 view + facing direction
  tilt.add(body);
  const pose = new THREE.Group(); // screen position, in-plane rotation, scale
  pose.add(tilt);
  scene.add(pose);

  function apply(p: Pose) {
    const set = (lg: ReturnType<typeof leg>, t: number, k: number) => {
      lg.thigh.rotation.z = t;
      lg.shin.rotation.z = k;
      lg.foot.rotation.z = -(t + k) * 0.92;
    };
    set(legL, p.tL, p.kL);
    set(legR, p.tR, p.kR);
    armL.sh.rotation.z = p.sL;
    armL.el.rotation.z = p.eL;
    armR.sh.rotation.z = p.sR;
    armR.el.rotation.z = p.eR;
    spine.rotation.z = -p.lean;
    head.rotation.set(0, p.hy, p.lean * 0.6 + p.nod + p.hp);
    body.rotation.z = p.bodyLean;
    const drop = (t: number, k: number) => L1 * Math.cos(t) + L2 * Math.cos(t + k);
    hips.position.y = Math.max(drop(p.tL, p.kL), drop(p.tR, p.kR)) + ANKLE + p.lift;
  }

  const _hw = new THREE.Vector3(),
    _d = new THREE.Vector3(),
    _m = new THREE.Matrix4();
  /** yaw/pitch that make the head face a screen point, plus the direction for the pupils */
  function lookAt(sx: number, sy: number) {
    const w = window.innerWidth,
      h = window.innerHeight;
    scene.updateMatrixWorld();
    head.getWorldPosition(_hw);
    _d.set(sx - w / 2 - _hw.x, h / 2 - sy - _hw.y, motion.skater.look.depth);
    _m.copy(chest.matrixWorld).invert();
    _d.transformDirection(_m);
    return {
      yaw: Math.atan2(-_d.z, _d.x),
      pitch: Math.atan2(_d.y, Math.hypot(_d.x, _d.z)),
      dir: { y: _d.y, z: _d.z },
      headScreen: { x: _hw.x + w / 2, y: h / 2 - _hw.y },
    };
  }
  function setPupils(dy: number, dz: number) {
    pupils.forEach((pu) => {
      pu.position.y = dy * 0.028;
      pu.position.z = dz * 0.028;
    });
  }

  function resize() {
    const w = window.innerWidth,
      h = window.innerHeight;
    renderer.setSize(w, h, false);
    cam.left = -w / 2;
    cam.right = w / 2;
    cam.top = h / 2;
    cam.bottom = -h / 2;
    cam.updateProjectionMatrix();
  }
  resize();

  function place(x: number, y: number, scale: number, spin: number, roll: number, tiltX: number, tiltY: number) {
    const w = window.innerWidth,
      h = window.innerHeight;
    pose.position.set(x - w / 2, h / 2 - y, 0);
    pose.scale.setScalar(scale);
    pose.rotation.set(0, spin, roll);
    tilt.rotation.set(tiltX, tiltY, 0);
  }

  return {
    apply,
    lookAt,
    setPupils,
    resize,
    place,
    render: () => renderer.render(scene, cam),
    dispose() {
      disposables.forEach((d) => d.dispose());
      mats.forEach((m) => m.dispose());
      renderer.dispose();
    },
  };
}

export type Skater = ReturnType<typeof createSkater>;
