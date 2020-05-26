const {nameConv} = require("./utils");

class Service {
	constructor(entity, domain) {
		this.domain = domain;
		this.entity = entity;
	}

	toString() {
		const varname = nameConv(this.entity.name);
		const className = this.entity.className;

		let out = "";
		out += `package ${this.domain}.service;\n\n`;
		out += `import ${this.domain}.entity.${className};\n`;
		out += `import java.util.List;\n\n`;
		out += `public interface ${className}Service {\n\n`;
		out += `\tList<${className}> findAll();\n\n`;
		out += `\tboolean delete(${className} ${varname});\n\n`;
		out += `\t${className} save(${className} ${varname});\n\n`;
		out += `\t${className} update(${className} ${varname});\n\n`;
		out += `\t${this.entity.className} findBy${this.entity.columns.filter(c => c.primaryKey).map(c => `${nameConv(c.name, true)}`).join("And")}(${this.entity.columns.filter(c => c.primaryKey).map(c => `${c.javaType} ${nameConv(c.name)}`).join(", ")});\n\n`;
		out += this.entity.columns.filter(c => !(c.primaryKey && this.entity.primaryKey.columns.length === 1)).map(c => `\tList<${this.entity.className}> findAllBy${nameConv(c.name, true)}(${c.javaType} ${nameConv(c.name)});`).join("\n\n");
		out += "\n";
		out += `\t${this.entity.className} deleteBy${this.entity.columns.filter(c => c.primaryKey).map(c => `${nameConv(c.name, true)}`).join("And")}(${this.entity.columns.filter(c => c.primaryKey).map(c => `${c.javaType} ${nameConv(c.name)}`).join(", ")});\n\n`;
		out += this.entity.columns.filter(c => !(c.primaryKey && this.entity.primaryKey.columns.length === 1)).map(c => `\tboolean deleteAllBy${nameConv(c.name, true)}(${c.javaType} ${nameConv(c.name)});`).join("\n\n");
		out += "\n}\n";
		return out;
	}
}

module.exports = Service;
