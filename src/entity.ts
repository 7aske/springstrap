import { formatImports, uncapitalize, formatAnnotations, DEFAULT_SSOPT } from "./utils";
import Column from "./column";
import MTMColumn from "./mtmcolumn";

const {snakeToCamel} = require("./utils");

export default class Entity {
	private static ignoredFields = ["last_modified_by", "last_modified_date", "record_status"];
	private readonly _domain: string;
	private readonly _tableName: string;
	private readonly _className: string;
	private readonly _primaryKey: DDLPrimaryKey;
	private readonly _columns: Column[];
	private readonly _mtmColumns: MTMColumn[];

	private readonly _options: SpringStrapOptions;

	constructor({name, columns, primaryKey, foreignKeys}: DDLTable,
	            domain: string,
	            mtmRel: DDLManyToMany[],
	            options: SpringStrapOptions = DEFAULT_SSOPT) {
		this._domain = domain;
		this._tableName = name;
		this._options = options;
		this._className = snakeToCamel(name, true);
		this._primaryKey = primaryKey;
		this._mtmColumns = mtmRel.map(rel => new MTMColumn(rel));
		this._columns = columns
			.filter(c => !Entity.ignoredFields.some(f => f === c.name))
			.map(col => new Column(col, {
				primaryKey: (primaryKey ? primaryKey.columns.find(c => c.column === col.name) : undefined),
				foreignKey: (foreignKeys ? foreignKeys.find(fk => fk.columns.find(c => c.column === col.name)) : undefined),
			}, options.lombok));
	}

	public get code() {
		const imports = [
			`javax.persistence.*`,
			`java.time.*`,
			`java.io.Serializable`,
			`java.util.*`,
			`com.fasterxml.jackson.annotation.JsonIgnore`,
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
			`EqualsAndHashCode${superClasses.length > 0 || this._options.auditable ? "(callSuper = false, onlyExplicitlyIncluded = true)" : ""}`,
			"NoArgsConstructor",
		];

		if (this._options.lombok) imports.push(...lombokImports);
		if (this._options.lombok) annotations.push(...lombokAnnotations);
		if (this._options.auditable) {
			interfaces.splice(interfaces.indexOf("Serializable"), 1);
			imports.splice(imports.indexOf("java.io.Serializable"), 1);
			superClasses.push("Auditable");
		}

		let out = `${this.packageName}\n\n`;
		out += formatImports(imports);
		out += formatAnnotations(annotations);
		out += `public class ${this._className}`;
		if (superClasses.length > 0) out += " extends " + superClasses.join(", ");
		if (interfaces.length > 0) out += " implements " + interfaces.join(", ");
		out += ` {\n\t`;

		out += `${this._columns.map(col => `${col.code.split("\n").join("\n\t")}`).join("")}`;
		out += `${this._mtmColumns.map(col => `${col.code.split("\n").join("\n\t")}`).join("")}`;
		if (!this._options.lombok) {
			out += `\n\tpublic ${this._className}() {}\n`;
			out += `${this._columns.map(col => col.getter() + col.setter()).join("\n")}`;
		}
		out += `\n}`;

		return out;
	}

	public get packageName(): string {
		if (!this._domain) return "package entity;";
		return `package ${this._domain}.entity;`;
	}

	public get domain(): string {
		return this._domain;
	}

	public get tableName(): string {
		return this._tableName;
	}

	public get className(): string {
		return this._className;
	}

	public get varName(): string {
		return uncapitalize(this._className);
	}

	public get primaryKey(): DDLPrimaryKey {
		return this._primaryKey;
	}

	public get primaryKeyList() {
		return this._columns.filter(c => c.primaryKey);
	}

	public get columns(): Column[] {
		return this._columns;
	}

	public get mtmColumns(): MTMColumn[] {
		return this._mtmColumns;
	}

	public get options(): SpringStrapOptions {
		return this._options;
	}
}

