import { formatImports, decapitalize, formatAnnotations } from "./utils";

const {snakeToCamel} = require("./utils");
import Column from "./column";

export default class Entity {
	private static ignoredFields = ["last_modified_by", "last_modified_date", "record_status"];
	private readonly _domain: string;
	private readonly _tableName: string;
	private readonly _className: string;
	private readonly _primaryKey: DDLPrimaryKey;
	private readonly _columns: Column[];
	private readonly _options: SpringStrapOptions;

	constructor(className:string, {name, columns, primaryKey, foreignKeys}: DDLTable, domain: string,
	            options: SpringStrapOptions = {extendAuditable: false, useLombok: false}) {
		this._domain = domain;
		this._tableName = name;
		this._options = options;
		this._className = className;
		this._primaryKey = primaryKey;

		foreignKeys?.forEach(k =>{
			console.log(k);
		})

		this._columns = columns
			.filter(c => !Entity.ignoredFields.some(f => f === c.name))
			.map(col => new Column(col, {
				primaryKey: (primaryKey ? primaryKey.columns.find(c => c.column === col.name) : undefined),
				foreignKey: (foreignKeys ? foreignKeys.find(fk => fk.columns.find(c => c.column === col.name)) : undefined),
			}, options.useLombok));
	}

	public get code() {
		const imports = [
			`javax.persistence.*`,
			`java.time.*`,
			`java.io.Serializable`,
			`java.util.*`,
		];
		const lombokImports = [
			"lombok.*",
			"lombok.experimental.*",
		];
		const superClasses = [];
		const interfaces = [
			"Serializable",
		];
		const annotations = [
			"Entity",
			`Table(name = "${this._tableName}")`,
		];
		const lombokAnnotations = [
			"Data",
			`EqualsAndHashCode${superClasses.length > 0 ? "(callSuper = true, onlyExplicitlyIncluded = true)" : ""}`,
			"NoArgsConstructor",
		];

		if (this._options.useLombok) imports.push(...lombokImports);
		if (this._options.useLombok) annotations.push(...lombokAnnotations);
		if (this._options.extendAuditable) superClasses.push("Auditable");

		let out = `${this.packageName}\n\n`;
		out += formatImports(imports);
		out += formatAnnotations(annotations);
		out += `public class ${this._className}`;
		if (superClasses.length > 0) out += " extends " + superClasses.join(", ");
		if (interfaces.length > 0) out += " implements " + interfaces.join(", ");
		out += ` {\n`;

		out += `${this._columns.map(col => col.toString()).join("\n")}\n`;
		if (!this._options.useLombok) {
			out += `\tpublic ${this._className}() {}\n`;
			out += `${this._columns.map(col => col.getter() + col.setter()).join("\n")}`;
		}
		out += `}`;

		return out;
	}

	public get packageName(): string {
		if (!this._domain) return "package entity;";
		return `package ${this._domain}.entity;`;
	}

	get domain(): string {
		return this._domain;
	}

	get tableName(): string {
		return this._tableName;
	}

	get className(): string {
		return this._className;
	}

	get varName(): string {
		return decapitalize(this._className);
	}

	get primaryKey(): DDLPrimaryKey {
		return this._primaryKey;
	}

	get columns(): Column[] {
		return this._columns;
	}

	get options(): SpringStrapOptions {
		return this._options;
	}
}

