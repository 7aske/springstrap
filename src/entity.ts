import { uncapitalize, capitalize } from "./utils";
import Column from "./column";
import MTMColumn from "./mtmcolumn";
import { Enum } from "./enum";
import JavaClass from "./def/JavaClass";
import { BasicMethodBuilder } from "./methodBuilder";
import EmbeddedId from "./embeddedid";

const {snakeToCamel} = require("./utils");

export default class Entity extends JavaClass {
	public static readonly AUDIT_FIELDS = ["created_date", "created_by", "last_modified_by", "last_modified_date", "record_status"];
	private readonly _tableName: string;
	private readonly _className: string;
	private readonly _id: Column[];
	private readonly _columns: Column[];
	private readonly _mtmColumns: MTMColumn[];
	private readonly _enums: Enum[];
	private readonly _hasRoles: boolean;
	private readonly _embeddedId: EmbeddedId;

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

		if (this.options.security && name.toLowerCase() === "user") {
			this.imports.push(
				"org.springframework.security.core.GrantedAuthority",
				"org.springframework.security.core.userdetails.UserDetails",
			);
			this.interfaces.push("UserDetails");
		}

		if (this.options.security && name === "role") {
			this.imports.push(
				"org.springframework.security.core.GrantedAuthority",
			);
			this.interfaces.push("GrantedAuthority");
		}

		if (this.options.lombok) {
			this.imports.push(...JavaClass.LOMBOK_IMPORTS);
			this.annotations.push(...JavaClass.LOMBOK_ANNOTATIONS);
		}
		if (options) {
			super.comment = options.comment;
		}

		this._tableName = name;
		this._className = capitalize(snakeToCamel(name.toLowerCase()));
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

		this._hasRoles = this.mtmColumns.some(col => col.target === "role");

		this._embeddedId = new EmbeddedId(this, this.options);
	}

	public get code() {
		const domain = super.domain;
		if (this._enums.length > 0) this.imports.push(`${domain ? domain + "." : ""}entity.domain.*`);
		let code = "\t";
		if (this.id.length == 1) {
			code += `${this._columns.map(col => `${col.code.split("\n").join("\n\t")}`).join("")}`;
		} else {
			code += "@EmbeddedId\n"
			code += `\tprivate ${this._embeddedId.className} ${this._embeddedId.varName};\n\n`
			code += this._embeddedId.code;
		}
		code += `${this._enums.map(col => `${col.fieldCode.split("\n").join("\n\t")}`).join("")}`;
		code += `${this._mtmColumns.map(col => `${col.code.split("\n").join("\n\t")}`).join("")}`;
		if (!this.options.lombok) {
			code += "\n"
			if (this.id.length > 1) {
				code += `${this._columns.filter(c => !c.primaryKey).map(col => col.getter() + col.setter()).join("\n")}`;
			} else {
				code += `${this._columns.map(col => col.getter() + col.setter()).join("\n")}`;
			}
		}

		if (this.options.security && this.className === "User") {
			if (this._hasRoles) {
				code += `
	@JsonIgnore
	@Override
	public Collection<? extends GrantedAuthority> getAuthorities() {
			return roles;
	}\n\n`;
			} else {
				code += `@JsonIgnore
	@Override
	public Collection<? extends GrantedAuthority> getAuthorities() {
			return null;
	}\n\n`;
			}
			code += `
	@JsonIgnore
	@Override
	public boolean isAccountNonExpired() {
		return isEnabled();
	}

	@JsonIgnore
	@Override
	public boolean isAccountNonLocked() {
		return isEnabled();
	}

	@JsonIgnore
	@Override
	public boolean isCredentialsNonExpired() {
		return isEnabled();
	}

	@JsonIgnore
	@Override
	public boolean isEnabled() {
		return true;
	}\n\n`;
		}

		if (this.options.security && this.className === "Role") {
			code += `@Override
    public String getAuthority() {
        return String.format("role_%s", name)
                .toUpperCase(Locale.ROOT);
    }\n\n`;
		}

		code += "\n"


		if (this.id.length == 1) {

			code += new BasicMethodBuilder()
				.annotation("Override")
				.public()
				.return("boolean")
				.name("equals")
				.arg(["Object", "o"])
				.implementation(`\tif (this == o) return true;\n\t\tif (o == null || getClass() != o.getClass()) return false;\n\t\t${this.className} ${this.varName} = (${this.className}) o;\n\t\treturn ${this.id.map(id => `${id.foreignKey ? id.varName : "id"}.equals(${this.varName}.${id.foreignKey ? id.varName : "id"})`).join(" && ")};\n`)
				.build()
				.generate();

			code += new BasicMethodBuilder()
				.annotation("Override")
				.public()
				.return("int")
				.name("hashCode")
				.implementation(`\treturn Objects.hash(${this.id.map(id => `${id.foreignKey ? id.varName : "id"}`).join(", ")});\n`)
				.build()
				.generate();

		} else {

			code += new BasicMethodBuilder()
				.annotation("Override")
				.public()
				.return("boolean")
				.name("equals")
				.arg(["Object", "o"])
				.implementation(`\tif (this == o) return true;\n\t\tif (o == null || getClass() != o.getClass()) return false;\n\t\t${this.className} ${this.varName} = (${this.className}) o;\n\t\treturn ${this._embeddedId.varName}.equals(${this.varName}.${this._embeddedId.varName});\n`)
				.build()
				.generate();

			code += new BasicMethodBuilder()
				.annotation("Override")
				.public()
				.return("int")
				.name("hashCode")
				.implementation(`\treturn Objects.hash(${this._embeddedId.varName});\n`)
				.build()
				.generate();
		}

		return this.wrap(code);
	}

	get id(): Column[] {
		return this._id;
	}

	public get idArgs(): string[][] {
		return this.id.map(pk => [pk.javaType, pk.varName]);
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

	public get embeddedId() {
		return this._embeddedId;
	}

	/**
	 * Checks if the provided table's sole purpose is to provide a many-to-many relationship
	 * fk_count = pk_count = col_count
	 * @param table
	 */
	public static isMtmTable(table: DDLTable) {
		return table.foreignKeys !== undefined && table.primaryKey !== undefined &&
			(table.columns.filter(col => !Entity.AUDIT_FIELDS.some(f => f === col.name)).length === table.foreignKeys.length) &&
			table.primaryKey.columns.length === table.foreignKeys.length;
	}
}

