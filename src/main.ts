import * as THREE from 'three';

interface TankConfiguration {
    type: 'vertical' | 'horizontal' | 'spherical';
    height: number;
    diameter: number;
    length: number;
    width: number;
    height2: number;
    sphereDiameter: number;
    wallThickness: number;
}

// Extend Window interface for global functions
declare global {
    interface Window {
        updateTank3D?: (config: TankConfiguration) => void;
        resetCamera3D?: () => void;
        toggleWireframe3D?: () => void;
        tankConfig?: TankConfiguration;
    }
}

class TankConfigurator3D {
    private scene: THREE.Scene;
    private camera: THREE.PerspectiveCamera;
    private renderer: THREE.WebGLRenderer;
    private tank!: THREE.Group;
    private lights: THREE.Light[] = [];
    private isWireframe: boolean = false;
    
    private config: TankConfiguration = {
        type: 'vertical',
        height: 10,
        diameter: 5,
        length: 10,
        width: 3,
        height2: 2,
        sphereDiameter: 8,
        wallThickness: 6
    };

    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        
        this.init();
        this.createLights();
        this.createTank();
        this.animate();
    }

    private init(): void {
        const container = document.getElementById('canvas-container');
        if (!container) return;

        // Get container dimensions
        const rect = container.getBoundingClientRect();
        
        // Renderer setup
        this.renderer.setSize(rect.width, rect.height);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.setClearColor(0xf9fafb, 1);
        
        // Clear loading and add canvas
        container.innerHTML = '';
        container.appendChild(this.renderer.domElement);

        // Camera position
        this.camera.aspect = rect.width / rect.height;
        this.camera.updateProjectionMatrix();
        this.camera.position.set(15, 10, 15);
        this.camera.lookAt(0, 0, 0);

        // Scene background
        this.scene.background = new THREE.Color(0xf9fafb);

        // Add ground
        this.createGround();

        // Setup mouse controls
        this.setupMouseControls();

        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());
    }

    private createLights(): void {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);
        this.lights.push(ambientLight);

        // Directional light (sun)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(20, 20, 10);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.1;
        directionalLight.shadow.camera.far = 100;
        directionalLight.shadow.camera.left = -20;
        directionalLight.shadow.camera.right = 20;
        directionalLight.shadow.camera.top = 20;
        directionalLight.shadow.camera.bottom = -20;
        this.scene.add(directionalLight);
        this.lights.push(directionalLight);

        // Point light for extra illumination
        const pointLight = new THREE.PointLight(0xffffff, 0.4);
        pointLight.position.set(-15, 15, -15);
        this.scene.add(pointLight);
        this.lights.push(pointLight);
    }

    private createGround(): void {
        const groundGeometry = new THREE.PlaneGeometry(50, 50);
        const groundMaterial = new THREE.MeshLambertMaterial({ 
            color: 0xe5e7eb,
            transparent: true,
            opacity: 0.8
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.scene.add(ground);
    }

    private createTank(): void {
        if (this.tank) {
            this.scene.remove(this.tank);
        }
        
        this.tank = new THREE.Group();
        
        const material = new THREE.MeshPhongMaterial({ 
            color: 0x0ea5e4,
            shininess: 30,
            wireframe: this.isWireframe
        });

        let tankMesh: THREE.Mesh;

        switch (this.config.type) {
            case 'vertical':
                tankMesh = this.createVerticalTank(material);
                break;
            case 'horizontal':
                tankMesh = this.createHorizontalTank(material);
                break;
            case 'spherical':
                tankMesh = this.createSphericalTank(material);
                break;
            default:
                tankMesh = this.createVerticalTank(material);
        }

        tankMesh.castShadow = true;
        tankMesh.receiveShadow = true;
        this.tank.add(tankMesh);

        // Add to scene
        this.scene.add(this.tank);
    }

    private createVerticalTank(material: THREE.Material): THREE.Mesh {
        const radius = this.config.diameter / 2;
        const height = this.config.height;
        
        const geometry = new THREE.CylinderGeometry(radius, radius, height, 32);
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.y = height / 2;
        
        return mesh;
    }

    private createHorizontalTank(material: THREE.Material): THREE.Mesh {
        const geometry = new THREE.BoxGeometry(
            this.config.length,
            this.config.height2,
            this.config.width
        );
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.y = this.config.height2 / 2;
        
        return mesh;
    }

    private createSphericalTank(material: THREE.Material): THREE.Mesh {
        const radius = this.config.sphereDiameter / 2;
        const geometry = new THREE.SphereGeometry(radius, 32, 16);
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.y = radius;
        
        return mesh;
    }

    private setupMouseControls(): void {
        let isMouseDown = false;
        let mouseX = 0;
        let mouseY = 0;
        let isShiftPressed = false;
        const rotationSpeed = 0.005;
        const panSpeed = 0.1;

        // Track shift key
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Shift') isShiftPressed = true;
        });
        
        window.addEventListener('keyup', (e) => {
            if (e.key === 'Shift') isShiftPressed = false;
        });

        this.renderer.domElement.addEventListener('mousedown', (e) => {
            isMouseDown = true;
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        window.addEventListener('mouseup', () => {
            isMouseDown = false;
        });

        this.renderer.domElement.addEventListener('mousemove', (e) => {
            if (!isMouseDown) return;

            const deltaX = e.clientX - mouseX;
            const deltaY = e.clientY - mouseY;

            if (isShiftPressed) {
                // Pan camera
                const vector = new THREE.Vector3();
                vector.setFromMatrixColumn(this.camera.matrix, 0);
                vector.multiplyScalar(-deltaX * panSpeed * 0.01);
                this.camera.position.add(vector);

                vector.setFromMatrixColumn(this.camera.matrix, 1);
                vector.multiplyScalar(deltaY * panSpeed * 0.01);
                this.camera.position.add(vector);
            } else {
                // Rotate camera around origin
                const spherical = new THREE.Spherical();
                spherical.setFromVector3(this.camera.position);
                spherical.theta -= deltaX * rotationSpeed;
                spherical.phi += deltaY * rotationSpeed;
                spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi));

                this.camera.position.setFromSpherical(spherical);
                this.camera.lookAt(0, 0, 0);
            }

            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        // Mouse wheel for zoom
        this.renderer.domElement.addEventListener('wheel', (e) => {
            e.preventDefault();
            const zoomSpeed = 0.1;
            const direction = this.camera.position.clone().normalize();
            
            if (e.deltaY > 0 && this.camera.position.length() < 100) {
                this.camera.position.add(direction.multiplyScalar(zoomSpeed));
            } else if (e.deltaY < 0 && this.camera.position.length() > 2) {
                this.camera.position.sub(direction.multiplyScalar(zoomSpeed));
            }
        });
    }

    public updateTank(config: TankConfiguration): void {
        this.config = { ...config };
        this.createTank();
    }

    public resetCamera(): void {
        this.camera.position.set(15, 10, 15);
        this.camera.lookAt(0, 0, 0);
    }

    public toggleWireframe(): void {
        this.isWireframe = !this.isWireframe;
        this.createTank();
    }

    private onWindowResize(): void {
        const container = document.getElementById('canvas-container');
        if (!container) return;

        const rect = container.getBoundingClientRect();
        this.camera.aspect = rect.width / rect.height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(rect.width, rect.height);
    }

    private animate(): void {
        requestAnimationFrame(() => this.animate());
        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize if we're on the configurator page
    const canvasContainer = document.getElementById('canvas-container');
    if (canvasContainer) {
        const configurator = new TankConfigurator3D();
        
        // Make functions available globally
        window.updateTank3D = (config: TankConfiguration) => {
            configurator.updateTank(config);
        };
        
        window.resetCamera3D = () => {
            configurator.resetCamera();
        };
        
        window.toggleWireframe3D = () => {
            configurator.toggleWireframe();
        };

        // Update with initial config from the page
        setTimeout(() => {
            if (window.tankConfig) {
                configurator.updateTank(window.tankConfig);
            }
        }, 100);
    }
});

export { TankConfigurator3D };
export type { TankConfiguration };