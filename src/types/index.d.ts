interface ICamera {
	fov: number;
	near: number;
	far: number;
	initialPos: [number, number, number] = [0, 0, 0];
	lookAt: [number, number, number] = [0, 0, 0];
}

interface IRenderer {
	webGL?: THREE.WebGLRendererParameters;
	clearColor?: string | number;
	pixelRatio?: number;
}

interface IViewerParams {
	camera: ICamera;
	width: number;
	height: number;
	element: Element | null;
	renderer: IRenderer;
}

interface IWindowParams {
	position: [number, number, number];
	rotation: [number, number, number];
	parent?: THREE.Mesh;
}
