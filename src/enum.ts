import { snakeToCamel } from "./utils";
import JavaClass from "./def/JavaClass";

export class Enum extends JavaClass {
	private readonly _column: string;
	private readonly _className: string;
	private readonly _values: { [key: string]: string }[];

	constructor(domain: string, def: EnumType, options?: SpringStrapOptions) {
		super(domain, "entity.domain", options);
		this.lombok = false;
		this.auditable = false;
		this.type = "enum";
		this._column = def.column;
		this._className = def.className ?? snakeToCamel(def.column);
		this._values = def.values;
	}

	public get fieldCode() {
		let out = "";
		out += `@Column(name = "${this._column}")\n`;
		out += `@Enumerated(EnumType.STRING)\n`;
		out += `private ${this._className} ${snakeToCamel(this._column)};\n`;
		return out;
	}

	public get code() {
		const attr = `\t${this._values.map(val => `${[Object.keys(val)[0]]}("${Object.values(val)[0]}")`).join(",\n\t")};\n`;
		return this.wrap("", attr);
	}


	get column(): string {
		return this._column;
	}

	get className(): string {
		return this._className;
	}

	get varName(): string {
		return this._className;
	}

	get values(): { [p: string]: string }[] {
		return this._values;
	}
}
