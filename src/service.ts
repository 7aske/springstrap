import Entity from "./entity";
import { nameConv } from "./utils";


export default class Service {
	entity: Entity
	domain: string;
	constructor(entity:Entity, domain: string) {
		this.domain = domain;
		this.entity = entity;
	}

	toString() {
		const varname = nameConv(this.entity.name);
		const className = this.entity.className;

		let out = "";
		out += `package ${this.domain}.service;\n\n`;
		out += `import ${this.domain}.entity.${className};\n`;
		out += `import ${this.domain}.entity.*;\n`;
		out += `import java.util.List;\n`;
		out += `import java.time.LocalDate;\n\n`;
		out += `public interface ${className}Service {\n\n`;
		out += `\tList<${className}> findAll();\n\n`;
		// out += `\tvoid delete(${className} ${varname});\n\n`;
		out += `\t${className} save(${className} ${varname});\n\n`;
		out += `\t${className} update(${className} ${varname});\n\n`;
		out += `\t${this.entity.className} findById(${this.entity.columns.filter(c => c.primaryKey).map(c => `${c.javaType} ${nameConv(c.name)}`).join(", ")});\n\n`;
		// out += this.entity.columns.filter(c => !(c.primaryKey && this.entity.primaryKey.columns.length === 1)).map(c => `\tList<${this.entity.className}> findBy${nameConv(c.name, true)}(${c.javaType} ${nameConv(c.name)});`).join("\n\n");
		// out += "\n";
		out += `\n\tvoid deleteById(${this.entity.columns.filter(c => c.primaryKey).map(c => `${c.javaType} ${nameConv(c.name)}`).join(", ")});\n\n`;
		// out += this.entity.columns.filter(c => !(c.primaryKey && this.entity.primaryKey.columns.length === 1)).map(c => `\tvoid deleteBy${nameConv(c.name, true)}(${c.javaType} ${nameConv(c.name)});`).join("\n\n");
		out += "\n}\n";
		return out;
	}
}

