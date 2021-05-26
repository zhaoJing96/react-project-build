/**
 * three.js本身包含了基础的工具包
 * 部分不包含的,需要全局注册
 */
 import * as THREE from 'three';
 import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
 import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
 import { TWEEN } from 'three/examples/jsm/libs/tween.module.min.js';
 import { CSS2DObject, CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
 import { CSS3DObject, CSS3DRenderer } from 'three/examples/jsm/renderers/CSS3DRenderer.js';
 THREE.GLTFLoader = GLTFLoader;
 THREE.OrbitControls = OrbitControls;
 THREE.TWEEN = TWEEN;
 THREE.CSS2DObject = CSS2DObject;
 THREE.CSS2DRenderer = CSS2DRenderer;
 THREE.CSS3DObject = CSS3DObject;
 THREE.CSS3DRenderer = CSS3DRenderer;
 export default THREE;