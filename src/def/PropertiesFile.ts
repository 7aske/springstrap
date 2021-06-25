export default class PropertiesFile {
	private _fileName: string;
	private _properties: Record<string, any> = {};


	constructor(fileName: string, options: SpringStrapOptions, pomXmlOptions: PomXmlOptions) {
		this._fileName = fileName;
		this._properties["spring.datasource.url"] = `jdbc:mysql://localhost:3306/${pomXmlOptions.name}`
		this._properties["spring.datasource.username"] = "root";
		this._properties["spring.datasource.password"] = "";
		if (options.type === "mariadb") {
			this._properties["spring.datasource.driverClassName"] = "org.mariadb.jdbc.Driver";
		} else if (options.type === "mysql") {
			this._properties["spring.datasource.driverClassName"] = "com.mysql.cj.jdbc.Driver";
		}
		this._properties["spring.jpa.database-platform"] = "org.hibernate.dialect.MySQLDialect";

	}

	setProperty(key: string, value: any) {
		this._properties[key] = value;
	}

	get content(): string {
		return Object.keys(this._properties)
			.map(key => `${key}=${this._properties[key]}`)
			.join("\n");
	}

	get fileName(): string {
		return this._fileName + ".properties";
	}
}
