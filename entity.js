const {nameConv} = require("./utils");
const Column = require("./column");

class Entity {
	constructor({name, columns, primaryKey, foreignKeys}, domain) {
		this.domain = domain;
		this.name = name;
		this.className = nameConv(name, true);
		this.primaryKey = primaryKey;
		this.foreignKeys = foreignKeys;
		this.columns = columns.map(col => new Column(col, {
			primaryKey: (primaryKey ? primaryKey.columns.find(c => c.column === col.name) : null),
			foreignKey: (foreignKeys ? foreignKeys.find(fk => fk.columns.find(c => c.column === col.name)) : null),
		}));
	}

	toString() {
		let out = "";
		out += `package ${this.domain}.entity;\n\n`;
		out += `import javax.persistence.*;\n\n`;
		out += `import java.time.LocalDate;\n`;
		out += `import java.util.*;\n\n`;
		out += "@Entity\n";
		out += "@Embeddable\n";
		out += `@Table(name = "${this.name}")\n`;
		out += `public class ${this.className} {\n`;
		out += `${this.columns.map(col => col.toString()).join("\n")}\n\n`;
		out += `\tpublic ${this.className}() {}\n`;
		out += `${this.columns.map(col => col.getter() + col.setter()).join("\n")}`;
		out += `}`;

		return out;
	}
}

module.exports = Entity;
