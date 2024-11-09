export interface Permiso {
    id: number;
    nombre: string;
    sistema: string;
}

export interface Authority {
    id: number;
    nombre: string;
    sistema: string;
    permisos: Permiso[];
}