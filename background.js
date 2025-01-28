import * as THREE from 'three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#bg'),
    antialias: true
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.setZ(30);

const particlesGeometry = new THREE.BufferGeometry();
const particlesCount = 15000;
const posArray = new Float32Array(particlesCount * 3);
const colors = new Float32Array(particlesCount * 3);

for(let i = 0; i < particlesCount * 3; i += 3) {
    const r = Math.random() * 100;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI * 2;
    
    posArray[i] = r * Math.sin(theta) * Math.cos(phi);
    posArray[i + 1] = r * Math.sin(theta) * Math.sin(phi);
    posArray[i + 2] = r * Math.cos(theta);
    
    const color = new THREE.Color();
    color.setHSL(Math.random() * 0.2 + 0.5, 0.7, 0.5);
    colors[i] = color.r;
    colors[i + 1] = color.g;
    colors[i + 2] = color.b;
}

particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

const particlesMaterial = new THREE.PointsMaterial({
    size: 0.015,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending
});

const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particlesMesh);

const addFloatingObject = (geometry, material, position, rotation) => {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(...position);
    mesh.rotation.set(...rotation);
    scene.add(mesh);
    return mesh;
};

const objects = [];

for (let i = 0; i < 10; i++) {
    const geometry = new THREE.IcosahedronGeometry(Math.random() * 2 + 0.5, 0);
    const material = new THREE.MeshPhongMaterial({
        color: 0x64ffda,
        transparent: true,
        opacity: 0.6,
        wireframe: true
    });
    
    const position = [
        (Math.random() - 0.5) * 100,
        (Math.random() - 0.5) * 100,
        (Math.random() - 0.5) * 100
    ];
    
    const rotation = [
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
    ];
    
    objects.push(addFloatingObject(geometry, material, position, rotation));
}

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0x64ffda, 2);
pointLight.position.set(0, 0, 0);
scene.add(pointLight);

let mouseX = 0;
let mouseY = 0;
let targetX = 0;
let targetY = 0;

document.addEventListener('mousemove', (event) => {
    mouseX = (event.clientX - window.innerWidth / 2) * 0.00005;
    mouseY = (event.clientY - window.innerHeight / 2) * 0.00005;
});

let scrollPercent = 0;

document.addEventListener('scroll', () => {
    scrollPercent = 
        (document.documentElement.scrollTop || document.body.scrollTop) /
        ((document.documentElement.scrollHeight || document.body.scrollHeight) - 
         document.documentElement.clientHeight);
});

const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    
    const elapsedTime = clock.getElapsedTime();
    
    particlesMesh.rotation.y += 0.0002;
    particlesMesh.rotation.x += 0.0001;
    
    targetX = mouseX * 0.5;
    targetY = mouseY * 0.5;
    particlesMesh.rotation.y += 0.5 * (targetX - particlesMesh.rotation.y);
    particlesMesh.rotation.x += 0.5 * (targetY - particlesMesh.rotation.x);
    
    objects.forEach((obj, i) => {
        obj.rotation.x += 0.001 + i * 0.0002;
        obj.rotation.y += 0.002 + i * 0.0001;
        obj.position.y = Math.sin(elapsedTime * 0.5 + i) * 0.5;
    });
    
    camera.position.z = 30 + scrollPercent * 20;
    camera.rotation.y = scrollPercent * Math.PI * 2;
    
    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
