import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import GUI from 'lil-gui';

/**
 * Base
 */
const gui = new GUI();
const canvas = document.querySelector('canvas.webgl');
const scene = new THREE.Scene();

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 5, 5);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.set(1024, 1024);
directionalLight.shadow.camera.far = 15;
directionalLight.shadow.camera.left = -7;
directionalLight.shadow.camera.right = 7;
directionalLight.shadow.camera.top = 7;
directionalLight.shadow.camera.bottom = -7;
scene.add(directionalLight);

/**
 * Camera
 */
const sizes = { width: window.innerWidth, height: window.innerHeight };
const camera = new THREE.PerspectiveCamera(10, sizes.width / sizes.height, 0.1, 1000);
scene.add(camera);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.target.set(0, 0.75, 0);

// Posiciones y rotaciones
const camStartPos = new THREE.Vector3(24.68, 11.13, -20.68);
const camMidPos = new THREE.Vector3(-11.62, 4.82, -3.38);
const camEndPos = new THREE.Vector3(-1, 1, 4);

const camStartRot = new THREE.Euler(-2.68, 0.82, 2.79);
const camMidRot = new THREE.Euler(-2.26, -1.14, -2.31);
const camEndRot = new THREE.Euler(-0.24, -0.24, -0.06);

let camTime = 0;
const camSpeed = 0.003;

camera.position.copy(camStartPos);
camera.rotation.copy(camStartRot);

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor('#aaaaaa');

window.addEventListener('resize', () => {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Materials helper
 */
function processMaterials(object) {
    object.traverse((child) => {
        if (child.isMesh && child.material.isMeshStandardMaterial) {
            child.material.envMapIntensity = 2.5;
            child.material.needsUpdate = true;
            child.castShadow = true;
            child.receiveShadow = true;
            child.userData.originalEmissive = child.material.emissive.clone();
        }
    });
}

/**
 * Loader
 */
const gltfLoader = new GLTFLoader();

/**
 * Animation mixer
 */
let mixers = [];

/**
 * Referencias a modelos
 */
let anchobyModel = null;
let whaleSharkModel = null;
let GoldModel = null;

/**
 * Shader de Bend
 */
function applyBendShader(mesh) {
    mesh.traverse((child) => {
        if (child.isMesh && child.material.isMeshStandardMaterial) {
            child.material.onBeforeCompile = (shader) => {
                shader.uniforms.time = { value: 0 };
                shader.vertexShader = `
                    uniform float time;
                    ${shader.vertexShader}
                `.replace(
                    `#include <begin_vertex>`,
                    `#include <begin_vertex>
                    float bendFactor = sin(position.z * 2.0 + time) * 0.1;
                    transformed.x += bendFactor;
                    transformed.y += sin(time + position.x * 2.0) * 0.02;`
                );
                child.userData.shader = shader;
            };
            child.material.needsUpdate = true;
        }
    });
}

/**
 * Load models
 */
function loadModel(path, scale = 0.025, yOffset = 0, xOffset = 0, rotateY = 0) {
    gltfLoader.load(
        path,
        (gltf) => {
            if (path.includes('chava.glb')) {
                gltf.scene.scale.set(scale * 20, scale * 20, scale * 20);
            } else if (path.includes('anchoby.gltf')) {
                gltf.scene.scale.set(scale * 0.009, scale * 0.009, scale * 0.009);
            } else if (path.includes('WhaleShark.gltf')) {
                gltf.scene.scale.set(0.01, 0.01, 0.01);
            } else if (path.includes('Gold.gltf')) {
                gltf.scene.scale.set(0.05, 0.05, 0.05);
            } else {
                gltf.scene.scale.set(scale, scale, scale);
            }

            gltf.scene.position.y = yOffset;
            gltf.scene.position.x = xOffset;
            gltf.scene.rotation.y = rotateY;

            processMaterials(gltf.scene);
            scene.add(gltf.scene);

            if (path.includes('anchoby.gltf')) {
                anchobyModel = gltf.scene;
                applyBendShader(anchobyModel);
            }
            if (path.includes('WhaleShark.gltf')) {
                whaleSharkModel = gltf.scene;
                applyBendShader(whaleSharkModel);
            }
            if (path.includes('Gold.gltf')) {
                GoldModel = gltf.scene;
                applyBendShader(GoldModel);
            }

            if (gltf.animations && gltf.animations.length > 0) {
                const mixer = new THREE.AnimationMixer(gltf.scene);
                gltf.animations.forEach((clip) => mixer.clipAction(clip).play());
                mixers.push(mixer);
            }
        },
        undefined,
        (error) => {
            console.error(`Error loading model ${path}:`, error);
        }
    );
}

// Cargar modelos
loadModel('/models/01/gigante.gltf', 0.025, 0.40, 0);
loadModel('/models/02/anchoby.gltf', -7, 0.8, 0.2, Math.PI);
loadModel('/models/Duck/WhaleShark.gltf', 1, 1, -0.2, 0);
loadModel('/models/04/Gold.gltf', 0.05, 0.5, -0.4, 0.5);
loadModel('/models/Fox/mini.gltf', 0.04, 0.323, -0.05, 0);

/**
 * Fondo
 */
const textureLoader = new THREE.TextureLoader();
textureLoader.load('/models/img/Inside.png', (texture) => {
    scene.background = texture;
});

/**
 * Raycaster para click y hover
 */
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let currentHover = null;

function getRootModel(object) {
    while (object.parent && ![anchobyModel, whaleSharkModel, GoldModel].includes(object)) {
        object = object.parent;
    }
    return object;
}

window.addEventListener('mousemove', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const clickableObjects = [anchobyModel, whaleSharkModel, GoldModel].filter(Boolean);
    const intersects = raycaster.intersectObjects(clickableObjects, true);

    if (intersects.length > 0) {
        document.body.style.cursor = 'pointer';
        const hovered = intersects[0].object;
        if (currentHover !== hovered) {
            if (currentHover) currentHover.material.emissive.copy(currentHover.userData.originalEmissive);
            hovered.material.emissive.set(0x00ff00);
            currentHover = hovered;
        }
    } else {
        document.body.style.cursor = 'default';
        if (currentHover) {
            currentHover.material.emissive.copy(currentHover.userData.originalEmissive);
            currentHover = null;
        }
    }
});

window.addEventListener('click', () => {
    raycaster.setFromCamera(mouse, camera);
    const clickableObjects = [anchobyModel, whaleSharkModel, GoldModel].filter(Boolean);
    const intersects = raycaster.intersectObjects(clickableObjects, true);

    if (intersects.length > 0) {
        const clicked = getRootModel(intersects[0].object);

        if (clicked === anchobyModel) window.location.href = '/anchoby.html';
        if (clicked === whaleSharkModel) window.location.href = '/whaleshark.html';
        if (clicked === GoldModel) window.location.href = '/gold.html';
    }
});

/**
 * Animate
 */
const clock = new THREE.Clock();

function tick() {
    const elapsedTime = clock.getElapsedTime();
    const deltaTime = clock.getDelta();

    mixers.forEach((mixer) => mixer.update(deltaTime));

    // Movimiento flotante + Bend
    if (anchobyModel) {
        anchobyModel.position.y = 0.8 + Math.sin(elapsedTime * 2) * 0.05;
        anchobyModel.traverse((c) => { if(c.userData.shader) c.userData.shader.uniforms.time.value = elapsedTime; });
    }
    if (whaleSharkModel) {
        whaleSharkModel.position.y = 1 + Math.sin(elapsedTime * 1.5) * 0.07;
        whaleSharkModel.traverse((c) => { if(c.userData.shader) c.userData.shader.uniforms.time.value = elapsedTime; });
    }
    if (GoldModel) {
        GoldModel.position.y = 0.5 + Math.sin(elapsedTime * 1.2) * 0.05;
        GoldModel.traverse((c) => { if(c.userData.shader) c.userData.shader.uniforms.time.value = elapsedTime; });
    }

    // Animación de cámara orgánica
    if (camTime < 1) {
        camTime += camSpeed;

        if (camTime < 0.5) {
            camera.position.lerpVectors(camStartPos, camMidPos, camTime * 2);
            camera.rotation.set(
                THREE.MathUtils.lerp(camStartRot.x, camMidRot.x, camTime * 2),
                THREE.MathUtils.lerp(camStartRot.y, camMidRot.y, camTime * 2),
                THREE.MathUtils.lerp(camStartRot.z, camMidRot.z, camTime * 2)
            );
        } else {
            camera.position.lerpVectors(camMidPos, camEndPos, (camTime - 0.5) * 2);
            camera.rotation.set(
                THREE.MathUtils.lerp(camMidRot.x, camEndRot.x, (camTime - 0.5) * 2),
                THREE.MathUtils.lerp(camMidRot.y, camEndRot.y, (camTime - 0.5) * 2),
                THREE.MathUtils.lerp(camMidRot.z, camEndRot.z, (camTime - 0.5) * 2)
            );
        }
    }

    controls.update();
    renderer.render(scene, camera);
    window.requestAnimationFrame(tick);
}

tick();
