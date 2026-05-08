export type Arrival = {
    linea: string;
    destino: string;
    minutos: number;
}

export type BusStop = {
    id: string;
    routes?: string[];
    direction?: string;
    latitude: number;
    longitude: number;
    name: string;
    arrivals?: Arrival[];
}