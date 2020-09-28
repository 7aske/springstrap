import { typeConv } from "./types";
import { nameConv } from "./utils";

export default class Column {
	name: string;
	className: string;
	type: DDLColumnType;
	options: DDLColumnOptions;
	primaryKey?: { column: string };
	foreignKey?: DDLForeignKey;
	javaType: string;
	varname: string;
	useLombok: boolean;

	constructor({name, type, options}: DDLColumn, {foreignKey, primaryKey}: { foreignKey?: DDLForeignKey, primaryKey?: { column: string } }, useLombok = false) {
		this.name = name;
		this.className = nameConv(name, true);
		this.type = type;
		this.options = options;
		this.foreignKey = foreignKey;
		this.primaryKey = primaryKey;
		this.javaType = this.getType();
		this.varname = nameConv(this.name);
		this.useLombok = useLombok;
	}

	toString() {
		let out = "";
		if (this.primaryKey && this.foreignKey) {
			out += "\t@EmbeddedId\n";
			out += `\t@Column(name = "${this.name}")\n`;
			out += `\tprivate ${this.javaType} ${this.varname};`;
		} else if (this.primaryKey) {
			out += "\t@Id\n";
			if (this.options.autoincrement)
				out += "\t@GeneratedValue(strategy = GenerationType.IDENTITY)\n";
			if (this.useLombok)
				out += `\t@EqualsAndHashCode.Include\n`;
			out += `\t@Column(name = "${this.name}")\n`;
			out += `\tprivate ${this.javaType} id;`;
		} else if (this.foreignKey) {
			out += `\t@JoinColumn(name = "${this.name}", referencedColumnName = "${this.foreignKey.reference.columns[0].column}")\n`;
			out += `\t@ManyToOne\n`;
			out += `\tprivate ${this.javaType} ${this.varname};`;
		} else {
			out += `\t@Column(name = "${this.name}")\n`;
			out += `\tprivate ${this.javaType} ${this.varname};`;
		}
		return out;
	}

	getType() {
		console.log(this.type, this.name);
		if (this.foreignKey) {
			return nameConv(this.foreignKey.reference.table, true);
		} else {
			return typeConv(this.type);
		}
	}

	getter() {
		let capitalizedVarname = this.varname.charAt(0).toUpperCase() + this.varname.substring(1);
		let out = "";
		out += `\tpublic ${this.javaType} get${capitalizedVarname}() {\n`;
		out += `\t\treturn ${this.varname};\n`;
		out += `\t}\n\n`;
		return out;
	}

	setter() {
		let capitalizedVarname = this.varname.charAt(0).toUpperCase() + this.varname.substring(1);
		let out = "";
		out += `\tpublic void set${capitalizedVarname}(${this.javaType} ${this.varname}) {\n`;
		out += `\t\tthis.${this.varname} = ${this.varname};\n`;
		out += `\t}\n\n`;
		return out;
	}
}

