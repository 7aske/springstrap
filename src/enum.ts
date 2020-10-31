import { uncapitalize, snakeToCamel } from "./utils";

export class Enum {
	private readonly _domain: string;
	private readonly _options: SpringStrapOptions;
	private readonly _column: string;
	private readonly _className: string;
	private readonly _values: { [key: string]: string }[];
	constructor(domain: string, def: EnumType, options: SpringStrapOptions) {
		this._domain = domain;
		this._column = def.column;
		this._className = def.className;
		this._values = def.values;
		this._options = options;
	}

	public get fieldCode() {
		let out = "";
		out += `@Column(name = "${this._column}")\n`;
		out += `@Enumerated(EnumType.STRING)\n`;
		out += `private ${this._className} ${snakeToCamel(this._column)};\n`;
		return out;
	}

	public get code() {
		let out = `${this.packageName}\n\n`;
		out += `public enum ${this._className} {\n\t`;
		out += `${this._values.map(val => `${[Object.keys(val)[0]]}("${Object.values(val)[0]}")`).join(",\n\t")};\n`;
		out += "\n\tprivate final String name;\n"
		out += `\n\t${this._className}(String name) {\n\t\tthis.name = name;\n\t}\n`;
		out += `\n\tpublic String getName() {\n\t\treturn name;\n\t}\n`;
		out += `}`;
		return out;
	}

	public get packageName() {
		if (!this._domain) return "package entity.domain;";
		return `package ${this._domain}.entity.domain;`;
	}

	public get domain(): string {
		return this._domain;
	}

	get column(): string {
		return this._column;
	}

	get className(): string {
		return this._className;
	}

	get values(): { [p: string]: string }[] {
		return this._values;
	}
}
