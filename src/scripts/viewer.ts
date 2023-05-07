import * as THREE from "three";

type updateFunctionsType = { [key: string]: (scene: THREE.Scene, camera: THREE.PerspectiveCamera) => any };
type resizeFunctionsType = { [key: string]: (scene: THREE.Scene, camera: THREE.PerspectiveCamera) => any };

export default class Viewer {
	scene: THREE.Scene;
	camera?: THREE.PerspectiveCamera;
	renderer?: THREE.WebGLRenderer;
	private updateFunctions: updateFunctionsType;
	private resizeFunctions: resizeFunctionsType;

	constructor(public params: IViewerParams) {
		this.scene = new THREE.Scene();
		this.updateFunctions = {};
		this.resizeFunctions = {};

		this.init();
	}

	private init() {
		this.addRenderer(this.params.renderer);
		this.addCamera(this.params.camera);
		this.resize();
		this.update();
	}

	private addCamera(params: ICamera) {
		if (this.renderer) {
			const { width, height } = this.renderer.domElement;
			this.camera = new THREE.PerspectiveCamera(params.fov, width / height, params.near, params.far);
			this.camera.position.set(...params.initialPos);
			this.camera.lookAt(...params.lookAt);

			this.addResize("resize_camera", (_, camera) => {
				if (this.renderer) {
					const { width, height } = this.renderer.domElement;
					camera.aspect = width / height;
					camera.updateProjectionMatrix();
				}
			});
		}
	}

	private addRenderer(params: IRenderer) {
		if (this.renderer) {
			this.renderer.domElement.parentNode?.removeChild(this.renderer.domElement);
			this.renderer.dispose();
		}

		this.renderer = new THREE.WebGLRenderer(params.webGL);

		this.renderer.setSize(this.params.width, this.params.height);
		this.renderer.setClearColor(params.clearColor || "black");
		this.renderer.setPixelRatio(params.pixelRatio || 1);
		this.renderer.shadowMap.enabled = true;

		this.addResize("resize_renderer", () => {
			if (this.renderer && this.renderer.domElement.parentElement) {
				this.renderer.setSize(this.renderer.domElement.parentElement.offsetWidth, this.renderer.domElement.parentElement.offsetHeight);
			}
		});

		if (this.params.element) {
			this.params.element.appendChild(this.renderer.domElement);
		}
	}

	private update() {
		if (this.camera && this.scene) {
			requestAnimationFrame(() => this.update());

			for (let name in this.updateFunctions) {
				const updateFunction = this.updateFunctions[name];

				updateFunction(this.scene, this.camera);
			}

			if (this.renderer) {
				this.renderer.render(this.scene, this.camera);
			}
		}
	}

	private resize() {
		window.addEventListener("resize", () => {
			if (this.camera && this.scene) {
				for (let name in this.resizeFunctions) {
					let resizeFunction = this.resizeFunctions[name];

					resizeFunction(this.scene, this.camera);
				}
			}
		});
	}

	addUpdate(name: string, cb: (scene: THREE.Scene, camera: THREE.PerspectiveCamera) => any) {
		this.updateFunctions[name] = cb;
	}

	removeUpadte(name: string) {
		if (this.updateFunctions[name]) {
			delete this.updateFunctions[name];
		}
	}

	addResize(name: string, cb: (scene: THREE.Scene, camera: THREE.PerspectiveCamera) => any) {
		this.resizeFunctions[name] = cb;
	}

	removeResize(name: string) {
		if (this.resizeFunctions[name]) {
			delete this.resizeFunctions[name];
		}
	}
}
