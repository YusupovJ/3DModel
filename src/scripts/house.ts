import Viewer from "./viewer";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

let params: IViewerParams = {
	camera: {
		fov: 45,
		far: 1000,
		near: 0.1,
		initialPos: [-5, 5, -10],
		lookAt: [0, 0, 0],
	},
	element: document.body,
	height: window.innerHeight,
	width: window.innerWidth,
	renderer: {
		webGL: {
			antialias: true,
			alpha: true,
		},
		clearColor: "lightgray",
		pixelRatio: 1,
	},
};

export default class House {
	scene: THREE.Scene;
	camera?: THREE.PerspectiveCamera;
	viewer: Viewer;
	foundation?: THREE.Mesh;
	roof?: THREE.Mesh;
	objectWindow?: THREE.Mesh;
	dLight?: THREE.DirectionalLight;
	aLight?: THREE.AmbientLight;
	loader: GLTFLoader;
	renderer?: THREE.WebGLRenderer;
	controls?: OrbitControls;
	cube?: THREE.Mesh;
	sphere?: THREE.Mesh;
	floor?: THREE.Mesh;

	constructor() {
		this.viewer = new Viewer(params);
		this.scene = this.viewer.scene;
		this.camera = this.viewer.camera;
		this.renderer = this.viewer.renderer;
		this.loader = new GLTFLoader();

		this.init();
	}

	init() {
		this.addLight();
		this.addOrbit();
		this.addFloor();
		this.addModel();
		// this.addCube();
		// this.addGrid();
		// this.addHome();
		// this.addSphere();
	}

	/* ------------------------------------ */

	addGrid() {
		this.scene.add(new THREE.GridHelper(10, 10));
	}

	addOrbit() {
		if (this.camera && this.renderer) {
			this.controls = new OrbitControls(this.camera, this.renderer.domElement);
			this.viewer.addUpdate("orbit_controls", () => {
				this.controls?.update();
			});
		}
	}

	addLight() {
		this.dLight = new THREE.DirectionalLight("white", 1);
		this.dLight.position.set(20, 20, 10);
		this.dLight.castShadow = true;
		this.scene.add(this.dLight);

		this.aLight = new THREE.AmbientLight("white", 0.2);
		this.scene.add(this.aLight);
	}

	addModel() {
		this.loader.load("src/models/soccer_ball/scene.gltf", (gltf) => {
			const model = gltf.scene;

			model.position.y = 0.6;
			model.traverse((node) => {
				if (node instanceof THREE.Mesh) {
					node.castShadow = true;
				}
			});

			this.viewer.addUpdate("orbit_controls", () => {
				model.rotation.x += 0.05;
			});

			this.scene.add(model);
		});
	}

	addCube() {
		const geometry = new THREE.BoxGeometry(1, 1, 1);
		const material = new THREE.MeshPhongMaterial({ color: "#641111" });

		this.cube = new THREE.Mesh(geometry, material);
		this.cube.position.set(0.5, 0, 0.5);
		this.cube.castShadow = true;

		this.scene.add(this.cube);

		this.viewer.addUpdate("attract", () => {
			if (this.sphere && this.cube) {
				const direction = new THREE.Vector3().subVectors(this.cube.position, this.sphere.position).setLength(0.04);
				this.sphere.position.add(direction);
			}
		});

		let angle = 0;
		this.viewer.addUpdate("orbit", () => {
			if (this.cube) {
				angle += 0.05;
				this.cube.position.z = 2 * Math.cos(angle);
				this.cube.position.x = 2 * Math.sin(angle);
				this.cube.rotation.y += 0.03;
			}
		});
	}

	addSphere() {
		const geometry = new THREE.SphereGeometry(0.5, 100, 100);
		const material = new THREE.MeshPhongMaterial({ color: "#15aca4" });

		this.sphere = new THREE.Mesh(geometry, material);
		this.sphere.position.set(-2.5, 0, 3.5);

		this.scene.add(this.sphere);
	}

	addFloor() {
		const geometry = new THREE.BoxGeometry(20, 0.01, 20);
		const material = new THREE.MeshStandardMaterial({ color: "#999999" });

		this.floor = new THREE.Mesh(geometry, material);
		this.floor.position.y = -0.5;
		this.floor.receiveShadow = true;
		this.scene.add(this.floor);
	}

	/* ------------------------------------ */

	addHome() {
		this.addFoundation();
		this.addRoof();
		this.addWindow({
			position: [0, 0, 0.5],
			rotation: [0, 0, 0],
			parent: this.foundation,
		});
		this.addWindow({
			position: [0.5, 0, 0],
			rotation: [0, 1.57, 0],
			parent: this.foundation,
		});
		this.addWindow({
			position: [-0.5, 0, 0],
			rotation: [0, -1.57, 0],
			parent: this.foundation,
		});
		this.addWindow({
			position: [0, 0, -0.5],
			rotation: [0, 0, 0],
			parent: this.foundation,
		});
	}

	addFoundation() {
		const geometry = new THREE.BoxGeometry(1, 1, 1);
		const material = new THREE.MeshPhongMaterial({ color: "#ffde70" });

		this.foundation = new THREE.Mesh(geometry, material);
		this.foundation.position.z = -5;
		this.foundation.rotation.x = 0.2;

		this.viewer.addUpdate("rotation", () => {
			if (this.foundation) {
				this.foundation.rotation.y += 0.02;
			}
		});

		this.scene.add(this.foundation);
	}

	addRoof() {
		const geometry = new THREE.ConeGeometry(1, 0.7, 4);
		const material = new THREE.MeshPhongMaterial({ color: "#bd1307" });

		this.roof = new THREE.Mesh(geometry, material);
		this.roof.position.y = 0.7;
		this.roof.rotation.y = 2.35;
		this.foundation?.add(this.roof);
	}

	addWindow(params: IWindowParams) {
		if (params.parent) {
			const { position, rotation } = params;

			const geometry = new THREE.BoxGeometry(0.4, 0.4, 0.01);
			const material = new THREE.MeshPhongMaterial({ color: "#0caedf" });

			this.objectWindow = new THREE.Mesh(geometry, material);
			this.objectWindow.position.set(...position);
			this.objectWindow.rotation.set(...rotation);
			params.parent.add(this.objectWindow);
		}
	}
}
