import { HostDiscovery } from "./HostDiscovery"
import ARPCacheEntry from "./ARPCacheEntry"
import { MAC_ADDR_LENGTH } from "../constants"
import { IPFunctions, IPNetwork } from "./IPFunctions";
import { Ping } from "./Ping";
import { ARPCache } from "./ARPCache";

export default class ARPCacheAndPing implements HostDiscovery {
	private readonly PING_WAIT: number = 10; // in milliseconds

	async discover(
		ipSubnet: IPNetwork,
		callbackProgress: (done: number, total: number) => void,
		callbackHostFound: (ipAddress: string, macAddress: Uint8Array) => void
	): Promise<void> {
		if (ipSubnet.prefix < 1 || ipSubnet.prefix > 32) {
			throw new RangeError("ipSubnet.prefix must be between 1 and 32.");
		}

		const ipFirst: number = IPFunctions.getFirstAddress(ipSubnet);
		const ipLast: number = IPFunctions.getLastAddress(ipSubnet);

		const totalIPs = ipLast - ipFirst + 1;
		let hosts: ARPCacheEntry[] = [];

		let i = 0;
		for (let ip = ipFirst; ip <= ipLast; ip++) {
			let ipString: string = IPFunctions.getStringIP(ip);
			console.log(ipString); // TODO: Remove

			Ping.ping(ipString, (error) => {
				if (error) {
					return;
				}
				ARPCache.getARPCache((error, result) => {
					if (error || !result) {
						return;
					}

					let newHosts: ARPCacheEntry[] = [];
					for (let entry of result) {
						console.log(entry); // TODO: Remove

						const numericIP = IPFunctions.getNumericalIP(entry.ip);
						if (numericIP < ipFirst || numericIP > ipLast) {
							continue;
						}

						hosts.forEach((host) => {
							// Skip already processed entries
							if (host.ip === entry.ip && host.mac === entry.mac) {
								return;
							}
							newHosts.push(host);
						});
					}

					for (let host of newHosts) {
						hosts.push(host);
						callbackHostFound(host.ip, this.getByteArrayFromMacAddress(host.mac));
					}
				});
			});

			i++;
			callbackProgress(i, totalIPs);

			await this.delay(this.PING_WAIT);
		}
	}

	async delay(milliseconds: number): Promise<void> {
		return new Promise<void>((resolve) => {
			setTimeout(resolve, milliseconds);
		});
	}

	getByteArrayFromMacAddress(mac: string): Uint8Array {
		const result: Uint8Array = Buffer.alloc(MAC_ADDR_LENGTH);
		const macParts = mac.split(/\:|\-/);
		for (let i = 0; i < macParts.length; i++) {
			result[i] = parseInt(macParts[i], 16);
		}
		return result;
	}

	isAvailable(callback: (res: boolean) => void): void {
		ARPCache.getRawARPCache((error, result) => {
			if (error || !result || result.length === 0) {
				callback(false);
				return;
			}

			Ping.ping("127.0.0.1", (error) => {
				if (error) {
					callback(false);
					return;
				}
				callback(true);
			});
		});
	}
}
