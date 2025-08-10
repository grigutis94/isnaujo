import * as THREE from 'three';
class TankConfigurator {
    scene;
    camera;
    renderer;
    tank;
    tankBody;
    tankTurret;
    lights = [];
    config = {
        model: 'basic',
        turretType: 'standard',
        armorColor: '#4a4a4a',
        camouflage: 'none',
        scale: 1.0
    };
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.init();
        this.createLights();
        this.createTank();
        this.setupControls();
        this.animate();
    }
    init() {
        // Renderer setup
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.setClearColor(0x2c3e50);
        const container = document.getElementById('canvas-container');
        if (container) {
            container.appendChild(this.renderer.domElement);
        }
        // Camera position
        this.camera.position.set(10, 8, 10);
        this.camera.lookAt(0, 0, 0);
        // Scene background
        this.scene.background = new THREE.Color(0x2c3e50);
        // Add ground
        this.createGround();
        // Hide loading screen
        const loading = document.getElementById('loading');
        if (loading) {
            loading.classList.add('hidden');
        }
        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());
    }
    createLights() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
        this.scene.add(ambientLight);
        this.lights.push(ambientLight);
        // Directional light (sun)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 10, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);
        this.lights.push(directionalLight);
        // Point light for extra illumination
        const pointLight = new THREE.PointLight(0xffffff, 0.3);
        pointLight.position.set(-10, 10, -10);
        this.scene.add(pointLight);
        this.lights.push(pointLight);
    }
    createGround() {
        const groundGeometry = new THREE.PlaneGeometry(50, 50);
        const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x3e4e3e });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.scene.add(ground);
    }
    createTank() {
        this.tank = new THREE.Group();
        // Create tank body
        this.createTankBody();
        // Create tank turret
        this.createTankTurret();
        // Add tank to scene
        this.scene.add(this.tank);
    }
    createTankBody() {
        const bodyGeometry = new THREE.BoxGeometry(4, 1.5, 6);
        const bodyMaterial = new THREE.MeshPhongMaterial({
            color: this.config.armorColor,
            shininess: 30
        });
        this.tankBody = new THREE.Mesh(bodyGeometry, bodyMaterial);
        this.tankBody.position.y = 0.75;
        this.tankBody.castShadow = true;
        this.tankBody.receiveShadow = true;
        this.tank.add(this.tankBody);
        // Add tracks
        this.createTracks();
    }
    createTracks() {
        const trackGeometry = new THREE.BoxGeometry(0.5, 1, 6.2);
        const trackMaterial = new THREE.MeshPhongMaterial({ color: 0x2c2c2c });
        // Left track
        const leftTrack = new THREE.Mesh(trackGeometry, trackMaterial);
        leftTrack.position.set(-2.25, 0.5, 0);
        leftTrack.castShadow = true;
        this.tank.add(leftTrack);
        // Right track
        const rightTrack = new THREE.Mesh(trackGeometry, trackMaterial);
        rightTrack.position.set(2.25, 0.5, 0);
        rightTrack.castShadow = true;
        this.tank.add(rightTrack);
    }
    createTankTurret() {
        const turretGroup = new THREE.Group();
        // Turret base
        const turretGeometry = new THREE.CylinderGeometry(1.5, 1.5, 1, 16);
        const turretMaterial = new THREE.MeshPhongMaterial({
            color: this.config.armorColor,
            shininess: 30
        });
        this.tankTurret = new THREE.Mesh(turretGeometry, turretMaterial);
        this.tankTurret.position.y = 2;
        this.tankTurret.castShadow = true;
        turretGroup.add(this.tankTurret);
        // Gun barrel
        this.createGunBarrel(turretGroup);
        this.tank.add(turretGroup);
    }
    createGunBarrel(turretGroup) {
        const barrelGeometry = new THREE.CylinderGeometry(0.1, 0.15, 4, 8);
        const barrelMaterial = new THREE.MeshPhongMaterial({ color: 0x1a1a1a });
        const barrel = new THREE.Mesh(barrelGeometry, barrelMaterial);
        barrel.rotation.z = Math.PI / 2;
        barrel.position.set(2, 2, 0);
        barrel.castShadow = true;
        turretGroup.add(barrel);
    }
    setupControls() {
        // Tank model selection
        const tankModelSelect = document.getElementById('tank-model');
        tankModelSelect?.addEventListener('change', (e) => {
            this.config.model = e.target.value;
            this.updateTankModel();
        });
        // Turret type selection
        const turretTypeSelect = document.getElementById('turret-type');
        turretTypeSelect?.addEventListener('change', (e) => {
            this.config.turretType = e.target.value;
            this.updateTurretType();
        });
        // Armor color
        const armorColorPicker = document.getElementById('armor-color');
        armorColorPicker?.addEventListener('change', (e) => {
            this.config.armorColor = e.target.value;
            this.updateArmorColor();
        });
        // Camouflage
        const camouflageSelect = document.getElementById('camouflage');
        camouflageSelect?.addEventListener('change', (e) => {
            this.config.camouflage = e.target.value;
            this.updateCamouflage();
        });
        // Scale
        const scaleSlider = document.getElementById('scale');
        const scaleValue = document.getElementById('scale-value');
        scaleSlider?.addEventListener('input', (e) => {
            this.config.scale = parseFloat(e.target.value);
            if (scaleValue)
                scaleValue.textContent = this.config.scale.toFixed(1);
            this.updateScale();
        });
        // Reset button
        const resetBtn = document.getElementById('reset-btn');
        resetBtn?.addEventListener('click', () => this.resetConfiguration());
        // Mouse controls for camera
        this.setupMouseControls();
    }
    setupMouseControls() {
        let isMouseDown = false;
        let mouseX = 0;
        let mouseY = 0;
        const rotationSpeed = 0.005;
        this.renderer.domElement.addEventListener('mousedown', (e) => {
            isMouseDown = true;
            mouseX = e.clientX;
            mouseY = e.clientY;
        });
        this.renderer.domElement.addEventListener('mouseup', () => {
            isMouseDown = false;
        });
        this.renderer.domElement.addEventListener('mousemove', (e) => {
            if (!isMouseDown)
                return;
            const deltaX = e.clientX - mouseX;
            const deltaY = e.clientY - mouseY;
            // Rotate camera around the tank
            const spherical = new THREE.Spherical();
            spherical.setFromVector3(this.camera.position);
            spherical.theta -= deltaX * rotationSpeed;
            spherical.phi += deltaY * rotationSpeed;
            spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi));
            this.camera.position.setFromSpherical(spherical);
            this.camera.lookAt(0, 1, 0);
            mouseX = e.clientX;
            mouseY = e.clientY;
        });
        // Mouse wheel for zoom
        this.renderer.domElement.addEventListener('wheel', (e) => {
            const zoomSpeed = 0.1;
            const direction = this.camera.position.clone().normalize();
            if (e.deltaY > 0 && this.camera.position.length() < 50) {
                this.camera.position.add(direction.multiplyScalar(zoomSpeed));
            }
            else if (e.deltaY < 0 && this.camera.position.length() > 5) {
                this.camera.position.sub(direction.multiplyScalar(zoomSpeed));
            }
        });
    }
    updateTankModel() {
        // Update tank dimensions based on model
        const body = this.tankBody;
        if (!body)
            return;
        switch (this.config.model) {
            case 'heavy':
                body.scale.set(1.2, 1.3, 1.1);
                break;
            case 'light':
                body.scale.set(0.8, 0.9, 0.9);
                break;
            default: // basic
                body.scale.set(1, 1, 1);
                break;
        }
    }
    updateTurretType() {
        // This would update turret geometry based on type
        // For now, just scale the turret
        const turret = this.tankTurret;
        if (!turret)
            return;
        switch (this.config.turretType) {
            case 'heavy':
                turret.scale.set(1.2, 1.1, 1.2);
                break;
            case 'sniper':
                turret.scale.set(0.9, 1.2, 0.9);
                break;
            default: // standard
                turret.scale.set(1, 1, 1);
                break;
        }
    }
    updateArmorColor() {
        const color = new THREE.Color(this.config.armorColor);
        if (this.tankBody?.material instanceof THREE.MeshPhongMaterial) {
            this.tankBody.material.color = color;
        }
        if (this.tankTurret?.material instanceof THREE.MeshPhongMaterial) {
            this.tankTurret.material.color = color;
        }
    }
    updateCamouflage() {
        // This would apply different textures/patterns
        // For now, just modify the material properties
        const materials = [this.tankBody?.material, this.tankTurret?.material];
        materials.forEach(material => {
            if (material instanceof THREE.MeshPhongMaterial) {
                switch (this.config.camouflage) {
                    case 'forest':
                        material.color.setHex(0x2d4a2d);
                        break;
                    case 'desert':
                        material.color.setHex(0x8b7355);
                        break;
                    case 'urban':
                        material.color.setHex(0x404040);
                        break;
                    default: // none
                        material.color = new THREE.Color(this.config.armorColor);
                        break;
                }
            }
        });
    }
    updateScale() {
        this.tank.scale.set(this.config.scale, this.config.scale, this.config.scale);
    }
    resetConfiguration() {
        this.config = {
            model: 'basic',
            turretType: 'standard',
            armorColor: '#4a4a4a',
            camouflage: 'none',
            scale: 1.0
        };
        // Reset UI controls
        document.getElementById('tank-model').value = 'basic';
        document.getElementById('turret-type').value = 'standard';
        document.getElementById('armor-color').value = '#4a4a4a';
        document.getElementById('camouflage').value = 'none';
        document.getElementById('scale').value = '1';
        document.getElementById('scale-value').textContent = '1.0';
        // Apply changes
        this.updateTankModel();
        this.updateTurretType();
        this.updateArmorColor();
        this.updateCamouflage();
        this.updateScale();
    }
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    animate() {
        requestAnimationFrame(() => this.animate());
        this.renderer.render(this.scene, this.camera);
    }
}
// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new TankConfigurator();
});
export { TankConfigurator };
//# sourceMappingURL=main.js.map