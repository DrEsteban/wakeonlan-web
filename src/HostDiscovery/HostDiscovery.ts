export interface IPNetwork {
	ip: string,
	prefix: number
}

export interface HostDiscovery {
	discover(
		ipSubnet: IPNetwork,
		callbackProgress: (done: number, total: number) => void,
		callbackHostFound: (ipAddress: string, macAddress: Uint8Array) => void
	): Promise<void>;

	isAvailable(callback: (res: boolean) => void): void;
}
