import mariadb from "mariadb";
import fs from "fs";

import { IPNetwork } from "wakeonlan-utilities";

export interface SettingsData {
	autoDetectNetworks: boolean;
	ipNetworks: IPNetwork[];
	wolPort: number;
}

const settingsDataDefault: SettingsData = {
	autoDetectNetworks: true,
	ipNetworks: [],
	wolPort: 9
};

export default class Database {
	private pool: mariadb.Pool;

	constructor() {
		this.pool = mariadb.createPool({
			host: process.env.DATABASE_HOST,
			user: process.env.DATABASE_USER,
			password: fs.readFileSync(process.env.DATABASE_PASSWORD_FILE!, "utf8"),
			database: process.env.DATABASE_DB,
			connectionLimit: 5
		});
	}

	async getSettings(): Promise<SettingsData | null> {
		const settingsData: SettingsData = { ...settingsDataDefault };

		let conn: mariadb.PoolConnection | null = null;
		try {
			conn = await this.pool.getConnection();

			let rows = await conn.query("SELECT * FROM `Settings_IPNetworks`");
			for (const row of rows) {
				settingsData.ipNetworks.push(row);
			}

			rows = await conn.query("SELECT * FROM `Settings`");
			if (rows && rows[0]) {
				const settings = rows[0];
				settingsData.autoDetectNetworks = settings.autoDetectNetworks[0] === 1 ? true : false;
				settingsData.wolPort = settings.port;
			}
		} catch (err) {
			console.error("Error:", err); // TODO: Use a logger here
		} finally {
			if (conn) {
				conn.end();
			}
		}

		return settingsData;
	}
}
