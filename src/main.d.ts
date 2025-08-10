interface TankConfiguration {
    model: 'basic' | 'heavy' | 'light';
    turretType: 'standard' | 'heavy' | 'sniper';
    armorColor: string;
    camouflage: 'none' | 'forest' | 'desert' | 'urban';
    scale: number;
}
declare class TankConfigurator {
    private scene;
    private camera;
    private renderer;
    private tank;
    private tankBody;
    private tankTurret;
    private lights;
    private config;
    constructor();
    private init;
    private createLights;
    private createGround;
    private createTank;
    private createTankBody;
    private createTracks;
    private createTankTurret;
    private createGunBarrel;
    private setupControls;
    private setupMouseControls;
    private updateTankModel;
    private updateTurretType;
    private updateArmorColor;
    private updateCamouflage;
    private updateScale;
    private resetConfiguration;
    private onWindowResize;
    private animate;
}
export { TankConfigurator };
export type { TankConfiguration };
//# sourceMappingURL=main.d.ts.map