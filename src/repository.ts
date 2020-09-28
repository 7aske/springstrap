import Entity from "./entity";
import { nameConv } from "./utils";

export default class Repository {
	entity: Entity;
	domain: string;
	constructor(entity:Entity, domain: string) {
		this.domain = domain;
		this.entity = entity;
	}

	toString() {
		let out = "";
		out += `package ${this.domain}.repository;\n\n`;
		out += `import org.springframework.data.jpa.repository.JpaRepository;\n`;
		out += `import org.springframework.stereotype.Repository;\n\n`;
		out += `import java.time.LocalDate;\n`
		out += `import java.util.List;\n`
		out += `import java.util.Optional;\n`
		out += `import ${this.domain}.entity.*;\n\n`;
		out += "@Repository\n";
		out += `public interface ${this.entity.className}Repository extends JpaRepository<${this.entity.className}, ${this.entity.columns.find(c => c.primaryKey)!.getType()}> {\n`;
		// out += `\tOptional<${this.entity.className}> findBy${this.entity.className}Id(${this.entity.columns.filter(c => c.primaryKey).map(c => `${c.javaType} ${nameConv(c.name)}`).join(", ")});\n`;
		// out += this.entity.columns.map(c => `\tList<${this.entity.className}> findAllBy${nameConv(c.name, true)}(${c.javaType} ${nameConv(c.name)});`).join("\n");
		// out += "\n";
		// out += this.entity.columns.map(c => `\tvoid deleteAllBy${nameConv(c.name, true)}(${c.javaType} ${nameConv(c.name)});`).join("\n");
		out += "\n}\n";
		return out;
	}
}


module.exports = Repository;
