import * as phanto from 'phanto';
let { Vao, Shader } = phanto.shaders;
let { Arrows } = phanto.controls;
let { Renderer, Scene, Model, lights, materials, cameras, primitives } = phanto;

class AudioWrapper {
  constructor() {
    this.audio = new Audio();
    this.fadeInID = null;
    this.fadeOutID = null;
    this.stopFadeIn = false;
    this.stopFadeOut = false;
  }

  setSource(src) {
    this.audio.src = src;
  }

  onLoaded(cb) {
    this.audio.oncanplay = cb.bind(this);
  }

  fadeIn() {
    cancelAnimationFrame(this.fadeOutID);
    let lastTime = null;
    let delta = null;
    this.play();

    this.audio.volume = 0;

    let fIN = function(time) {
      this.fadeInID = requestAnimationFrame(fIN);

      lastTime = lastTime || time;
      delta = time - lastTime;
      lastTime = time;
      this.audio.volume = Math.min(this.audio.volume + delta / 15000, 1);

      if (this.audio.volume >= 1 || this.stopFadeIn) {
        cancelAnimationFrame(this.fadeInID);
      }
    }.bind(this);

    this.fadeInID = requestAnimationFrame(fIN);
  }

  fadeOut() {
    cancelAnimationFrame(this.fadeInID);
    let lastTime = null;
    let delta = null;
    this.audio.volume = 1;

    let fOUT = function(time) {
      this.fadeOutID = requestAnimationFrame(fOUT);
      if(this.audio.paused || this.stopFadeOut) return cancelAnimationFrame(this.fadeOutID);

      lastTime = lastTime || time;
      delta = time - lastTime;
      lastTime = time;

      this.audio.volume = Math.max(this.audio.volume - delta / 3000, 0);

      if (this.audio.volume <= 0) {
        this.pause();
      }
    }.bind(this);

    this.fadeOutID = requestAnimationFrame(fOUT);
  }

  play() {
    this.audio.play();
  }

  pause() {
    this.audio.pause();
  }
}

const BASIC_FADE_SHADER = 'basic-fade';

const Resources = (function() {
  let resources = [];
  let loaded = 0;
  let audios = {};

  return {
    add(items) {
      resources = resources.concat(items);
    },
    load() {
      resources.forEach((item) => {
        let audio = new AudioWrapper();
        audio.onLoaded(() => {
          loaded++;
        });

        audio.setSource(item.url);
        audios[item.name] = audio;
      });

      return new Promise(resolve => {
        let stopId = null;

        function check() {
          stopId = requestAnimationFrame(check);

          if (loaded >= resources.length) {
            cancelAnimationFrame(stopId);
            resolve(audios);
          }
        }

        stopId = requestAnimationFrame(check);
      });
    },
    audios
  }
})();

Shader
  .create(BASIC_FADE_SHADER)
  .defaults()
  .vertex()
    .addOutput({name: 'position', type: 'vec3'})
    .addFunction(`
      void main(void) {
        vec4 world_coord = u_model * vec4(a_position, 1.0);
        gl_Position = u_proj * u_view * world_coord;
        position = gl_Position.xyz;
      }
    `)
  .fragment()
    .addInput({name: 'position', type: 'vec3'})
    .addUniform({name: 'u_color', type: 'vec3'})
    .addFunction(`
      float map(float value, float low1, float high1, float low2, float high2) {
        return low2 + (value - low1) * (high2 - low2) / (high1 - low1);
      }
    `)
    .addFunction(`
      void main(void) {
        float z = -position.z;
        float fog = map(z, -25.0, 0.0, 0.0, 1.0);
        final_color = vec4(u_color, 1.0) * vec4(fog, fog, fog, 1.0);
      }
    `)
  .materialHandler((shader, gl, material) => {
    shader.setUColor(gl, material.color);
  });


function basicFade(color) {
  return {
    type: BASIC_FADE_SHADER,
    color
  };
}

function circle(r=1, d=48) {
  let vertices = [];
  let s = 2 * Math.PI / d;

  for (let i = 0; i < d; i++) {
    vertices.push(r * Math.cos(s * i));
    vertices.push(r * Math.sin(s * i));
    vertices.push(0.0);
  }

  return Vao
    .create()
    .setMode('LINE_LOOP')
    .addAttrib({
      data: vertices,
      componentLen: 3,
      location: 0
    });
};

function quad(d=48, full=false) {
  let vertices = [];
  let indexes = [];
  let s = 2 * Math.PI / d;
  let l = Math.floor(d / 12);
  let r = full ? 0 : 0.7;



  for (let p = 0; p <= l; p++) {
    vertices.push(Math.cos(s * p));
    vertices.push(Math.sin(s * p));
    vertices.push(0.0);
  }

  for (let p = 0; p <= l; p++) {
    vertices.push(r * Math.cos(s * p));
    vertices.push(r * Math.sin(s * p));
    vertices.push(0.0);
  }

  for (let p = 0; p < l; p++) {
    indexes.push(0 + p);
    indexes.push((l + 2) + p);
    indexes.push((l + 1) + p);
    indexes.push(0 + p);
    indexes.push(1 + p);
    indexes.push((l + 2) + p);
  }

  return Vao
    .create()
    .setMode('TRIANGLES')
    .addAttrib({
      data: vertices,
      componentLen: 3,
      location: 0
    }).setIndexes(indexes);
}


let renderer = new Renderer({el: 'canvas', clearColor: [0.0, 0.0, 0.0]});
let canvas = renderer.canvas;
let camera = new cameras.Perspective(Math.PI / 3, canvas.width / canvas.height, 0.01, 1000);
let scene = new Scene();
let geo = circle();
let mat = basicFade([1.0, 1.0, 1.0]);

let models = Array(30).fill(0).map((_, i) => {
  return new Model(geo, mat).setTranslate(0, 0, -i).update();
});

let qgeo = quad();
let qmats = [
  basicFade([1.0, 1.0, 1.0]),
  basicFade([1, 0.3, 0.5]),
  // basicFade([1, 1, 0.4]),
  basicFade([0.4, 1, 1]),
  // basicFade([1, 0.5, 0]),

];
let qmodels = Array(models.length / 2).fill(0).map(() => {
  let q = new Model(qgeo, qmats[Math.floor(Math.random() * qmats.length)]);
  let side = Math.floor(Math.random() * 12);
  let z = Math.floor(Math.random() * models.length);
  q.baseRotation = 180 / 6 * side;
  q.baseMaterial = q.material;
  q.setRotate(0, 0, q.baseRotation);
  q.setTranslate(Math.cos(q.baseRotation), Math.sin(q.baseRotation), -z).update();
  return q;
});

scene.setCamera(camera).addItems(models).addItems(qmodels);

let camAngle = 0;
let initialSpeed = 200;
let maxSpeed = 70;
let acceleration = 10;
let speed = 250;
let a = 10;
let over = false;

function handleCollsions(time) {
  let all = qmodels.concat(fullModels.reduce((a, b) => a.concat(b), []));
  all.forEach(m => {
    m.material = m.baseMaterial;
    if (m.transform.position.z > -0.25 && m.transform.position.z < 0) {
      let mangle = m.transform.rotate.z;

      mangle = mangle + 360 * 1000;
      mangle = mangle % 360;

      if (270 - (180 / 6) < mangle && mangle < 270) {
        Resources.audios['impact'].play();
        over = true;
        acceleration = 0;
      }
    }
  });
}

let speedTimer = 0;
let lastTime = 0;
let score = 0;
let addItem = true;

let fgeo = quad(36, true);

let fullModels = [];

let pause = false;

let loop = phanto.utils.createLoop((delta, time) => {
  models.sort((a, b) => a.transform.position.z - b.transform.position.z);
  let lz = models[0].transform.position.z;

  if (over) {
    Resources.audios['soundtrack'].pause();
    acceleration -= delta / 2;
  } else if (speedTimer > 10) {
    acceleration = -10;
    speedTimer = 0;
  }

  if (!over) {
    score = Math.floor(time - lastTime / 100);
  }

  if (!over && score > 33000 && addItem) {
    let f = new Model(fgeo, basicFade([0, 1, 0]));
    let f2 = new Model(fgeo, basicFade([0, 1, 0]));
    let fs = 180 / 6 * Math.floor(Math.random() * 12);

    addItem = false;

    f.baseRotation = fs;
    f.baseMaterial = f.material;
    f2.baseRotation = fs + 180;
    f2.baseMaterial = f2.material;

    f.setRotate(0, 0, fs).setTranslate(0, 0, lz).update();
    f2.setRotate(0, 0, fs + 180).setTranslate(0, 0, lz).update();

    fullModels.push([f, f2]);

    scene.addItem(f);
    scene.addItem(f2);
  }

  speed -= acceleration * delta / 1000;
  speed = Math.max(maxSpeed, speed);

  if (!over) {
    if (phanto.utils.keyboard.RIGHT) {
      a -= delta / 2.5;
    } else if (phanto.utils.keyboard.LEFT) {
      a += delta / 2.5;
    }
  }

  if (speed < maxSpeed + 50) {
    let diff = speed - maxSpeed;
    let o = diff / 50;
    mat.color = [1.0, o, o];
  }

  if (speed == maxSpeed) {
    speedTimer += delta / 1000;
  }

  if (speed > initialSpeed - 100 && !over && acceleration < 0) {
    acceleration = 30;
  }

  camAngle += Math.PI / 40 * delta / speed;
  let x = Math.cos(camAngle);
  let y = Math.sin(camAngle);
  camera.setTranslate(x, y - 0.8, 0.0).update();

  qmodels.forEach((m, i) => {
    let z = m.transform.position.z;
    if (i % 2) {
      m.baseRotation += delta / 10;
    }

    z += delta / speed;
    if (z > 1) {
      z = lz - 1;
      m.baseRotation = 180 / 6 * Math.floor((Math.random() * 12));
    }

    let angle = camAngle + Math.PI / 40 * z;
    let x = Math.cos(angle);
    let y = Math.sin(angle);

    m.setRotate(0, 0, m.baseRotation + a);
    m.setTranslate(x, y, z).update();
  });

  fullModels.forEach((m) => {
    let m0 = m[0];
    let m1 = m[1];

    let z = m0.transform.position.z;
    z += delta / speed;
    if (z > 1) {
      z = lz - 1;
      m0.baseRotation = 180 / 6 * Math.floor((Math.random() * 12));
      m1.baseRotation = m0.baseRotation + 180;
    }

    let angle = camAngle + Math.PI / 40 * z;
    let x = Math.cos(angle);
    let y = Math.sin(angle);

    m0.setRotate(0, 0, m0.baseRotation + a);
    m0.setTranslate(x, y, z).update();

    m1.setRotate(0, 0, m1.baseRotation + a);
    m1.setTranslate(x, y, z).update();
  });

  models.forEach((m, i) => {
    let z = m.transform.position.z;
    z += delta / speed;
    if (z > 1) { z = lz - 1; }

    let angle = camAngle + Math.PI / 40 * (z);
    let x = Math.cos(angle);
    let y = Math.sin(angle);

    m.setRotate(0, 0, a);
    m.setTranslate(x, y, z).update();
  });

  if (!over) {
    handleCollsions(time);
  }

  renderer.clear().renderScene(scene, true);
});

Resources.add([
  {
    name: 'soundtrack',
    url: 'static/soundtrack.mp3'
  },
  {
    name: 'impact',
    url: 'static/impact.mp3'
  }
]);

Resources.load().then(() => {
  Resources.audios['soundtrack'].fadeIn();
  loop.start();
});
