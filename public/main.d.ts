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
declare global {
    interface Window {
        updateTank3D?: (config: TankConfiguration) => void;
        resetCamera3D?: () => void;
        toggleWireframe3D?: () => void;
        tankConfig?: TankConfiguration;
    }
}
declare class TankConfigurator3D {
    private scene;
    private camera;
    private renderer;
    private tank;
    private lights;
    private isWireframe;
    private config;
    constructor();
    private init;
    private createLights;
    private createGround;
    private createTank;
    private createVerticalTank;
    private createHorizontalTank;
    private createSphericalTank;
    private setupMouseControls;
    updateTank(config: TankConfiguration): void;
    resetCamera(): void;
    toggleWireframe(): void;
    private onWindowResize;
    private animate;
}
export { TankConfigurator3D };
export type { TankConfiguration };
//# sourceMappingURL=main.d.ts.map