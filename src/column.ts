import { typeConv } from "./types";
import { snakeToCamel, capitalize } from "./utils";

export default class Column {
	private readonly _name: string;
	private readonly _className: string;
	private readonly _type: DDLColumnType;
	private readonly options: DDLColumnOptions;
	private readonly _primaryKey?: { column: string };
	private readonly _foreignKey?: DDLForeignKey;
	private readonly _javaType: string;
	private readonly _varname: string;
	private readonly useLombok: boolean;

	constructor({name, type, options}: DDLColumn, {foreignKey, primaryKey}: { foreignKey?: DDLForeignKey, primaryKey?: { column: string } }, useLombok = false) {
		this._name = name;
		this._className = snakeToCamel(this._name, true).replace(/Fk$|^Fk/, "");
		this._type = type;
		this.options = options;
		this._foreignKey = foreignKey;
		this._primaryKey = primaryKey;
		this._javaType = this.typeConv();
		this.useLombok = useLombok;
		this._varname = snakeToCamel(name).replace(/Fk$|^Fk/, "");
	}

	public get code(): string {
		let out = "";
		if (this._primaryKey && this._foreignKey) {
			out += "@EmbeddedId\n";
			out += `@Column(name = "${this._name}")\n`;
			out += `private ${this._javaType} ${this._varname};\n`;
		} else if (this._primaryKey) {
			out += "@Id\n";
			if (this.options.autoincrement)
				out += "@GeneratedValue(strategy = GenerationType.IDENTITY)\n";
			if (this.useLombok)
				out += `@EqualsAndHashCode.Include\n`;
			out += `@Column(name = "${this._name}")\n`;
			out += `private ${this._javaType} id;\n`;
		} else if (this._foreignKey) {
			out += `@JoinColumn(name = "${this._name}", referencedColumnName = "${this._foreignKey.reference.columns[0].column}")\n`;
			out += `@ManyToOne\n`;
			out += `private ${this._javaType} ${this._varname};\n`;
		} else {
			out += `@Column(name = "${this._name}")\n`;
			out += `private ${this._javaType} ${this._varname};\n`;
		}
		return out;
	}

	public get javaType(): string {
		return this._javaType;
	}

	public get className(): string {
		return this._className;
	}

	public get name(): string {
		return this._name;
	}

	public get varName(): string {
		return this._varname;
	}

	public get primaryKey(): boolean {
		return !!this._primaryKey;
	}

	public get foreignKey(): boolean {
		return !!this._foreignKey;
	}

	private typeConv() {
		if (this._foreignKey)
			return snakeToCamel(this._foreignKey.reference.table, true);
		return typeConv(this._type);
	}

	getter() {
		let capitalizedVarname = capitalize(this.varName);
		let out = `\tpublic ${this._javaType} get${capitalizedVarname}() {\n`;
		out += `\t\treturn ${this._varname};\n`;
		out += `\t}\n\n`;
		return out;
	}

	setter() {
		let capitalizedVarname = this._varname.charAt(0).toUpperCase() + this._varname.substring(1);
		let out = `\tpublic void set${capitalizedVarname}(${this._javaType} ${this._varname}) {\n`;
		out += `\t\tthis.${this._varname} = ${this._varname};\n`;
		out += `\t}\n\n`;
		return out;
	}
}

