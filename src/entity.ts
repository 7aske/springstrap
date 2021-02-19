import { uncapitalize, capitalize } from "./utils";
import Column from "./column";
import MTMColumn from "./mtmcolumn";
import { Enum } from "./enum";
import JavaClass from "./def/JavaClass";

const {snakeToCamel} = require("./utils");

export default class Entity extends JavaClass {
	private static AUDIT_FIELDS = ["created_date", "created_by", "last_modified_by", "last_modified_date", "record_status"];
	private readonly _tableName: string;
	private readonly _className: string;
	private readonly _id: Column[];
	private readonly _columns: Column[];
	private readonly _mtmColumns: MTMColumn[];
	private readonly _enums: Enum[];

	constructor({name, columns, primaryKey, foreignKeys, options}: DDLTable,
	            domain: string,
	            mtmRel: DDLManyToMany[] = [],
	            enums: EnumType[] = [],
	            ssopt?: SpringStrapOptions) {
		super(domain, "entity", ssopt);

		super.imports = [
			`javax.persistence.*`,
			`java.time.*`,
			`java.io.Serializable`,
			`java.util.*`,
			`com.fasterxml.jackson.annotation.JsonIgnore`,
		];
		super.annotations = [
			"Entity",
			`Table(name = "${name}")`,
		];
		super.interfaces = [
			"Serializable",
		];

		if (options) {
			super.comment = options.comment;
		}

		this._tableName = name;
		this._className = capitalize(snakeToCamel(name));
		this._enums = enums.map(e => new Enum(domain, e, ssopt));
		this._mtmColumns = mtmRel.map(rel => new MTMColumn(rel));
		this._columns = columns
			.filter(c => enums.every(e => e.column !== c.name))
			.filter(c => !Entity.AUDIT_FIELDS.some(f => f === c.name))
			.map(col => new Column(col, {
				primaryKey: primaryKey.columns.find(c => c.column === col.name),
				foreignKey: (foreignKeys ?? []).find(fk => fk.columns.find(c => c.column === col.name)),
			}, this.options.lombok));

		this._id = this._columns.filter(c => c.primaryKey)!;
	}

	public get code() {
		const domain = super.domain;
		if (this._enums.length > 0) this.imports.push(`${domain ? domain + "." : ""}entity.domain.*`);
		let code = "\t";
		code += `${this._columns.map(col => `${col.code.split("\n").join("\n\t")}`).join("")}`;
		code += `${this._enums.map(col => `${col.fieldCode.split("\n").join("\n\t")}`).join("")}`;
		code += `${this._mtmColumns.map(col => `${col.code.split("\n").join("\n\t")}`).join("")}`;
		if (!this.options.lombok) {
			code += `${this._columns.map(col => col.getter() + col.setter()).join("\n")}`;
		}

		return this.wrap(code);
	}

	get id(): Column[] {
		return this._id;
	}

	public get idArgs(): string[][] {
		return this.id.map(pk => [pk.javaType, pk.varName])
	}

	public get idArgsString(): string {
		return this.idArgs.map(id => id.join(" ")).join(", ");
	}

	public get idVars(): string {
		return this.id.map(pk => pk.varName).join(", ");
	}

	public get idPathArgs(): string {
		return this.id.map(pk => `@PathVariable ${pk.javaType} ${pk.varName}`).join(", ");
	}

	public get idPathVars(): string {
		return this.id.map(pk => `{${pk.varName}}`).join("/");
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

	public get columns(): Column[] {
		return this._columns;
	}

	public get mtmColumns(): MTMColumn[] {
		return this._mtmColumns;
	}

	public get enums() {
		return this._enums;
	}
}

