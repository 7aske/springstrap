const {nameConv} = require("./utils");
import Column from "./column";

export default class Entity {
	static ignoredFields = ["last_modified_by", "last_modified_date", "record_status"];
	domain: string;
	name: string;
	className: string;
	primaryKey: DDLPrimaryKey;
	foreignKeys?: DDLForeignKey[];
	columns: Column[];
	useLombok: boolean;

	constructor({name, columns, primaryKey, foreignKeys}: DDLTable, domain: string, useLombok = false) {
		this.domain = domain;
		this.name = name;
		this.className = nameConv(name, true);
		this.primaryKey = primaryKey;
		this.foreignKeys = foreignKeys;
		this.columns = columns
			.filter(c => !Entity.ignoredFields.some(f => f === c.name))
			.map(col => new Column(col, {
				primaryKey: (primaryKey ? primaryKey.columns.find(c => c.column === col.name) : undefined),
				foreignKey: (foreignKeys ? foreignKeys.find(fk => fk.columns.find(c => c.column === col.name)) : undefined),
			}, useLombok));
		this.useLombok = useLombok;
	}

	toString() {
		let out = "";
		out += `package ${this.domain}.entity;\n\n`;
		out += `import javax.persistence.*;\n\n`;
		out += `import java.time.*;\n`;
		out += `import java.io.Serializable;\n`;
		out += `import java.util.*;\n\n`;
		if (this.useLombok) {
			out += "import lombok.*;\n\n";
			out += "import lombok.experimental.*;\n\n";
		}
		out += "@Entity\n";
		out += `@Table(name = "${this.name}")\n`;
		if (this.useLombok) {
			out += "@Data\n";
			out += "@Accessors(chain = true)\n";
			out += "@EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)\n";
			out += "@NoArgsConstructor\n";
		}
		out += `public class ${this.className} extends Auditable {\n`;
		out += `${this.columns.map(col => col.toString()).join("\n")}\n`;
		if (!this.useLombok) {
			out += `\tpublic ${this.className}() {}\n`;
			out += `${this.columns.map(col => col.getter() + col.setter()).join("\n")}`;
		}
		out += `}`;

		return out;
	}
}

