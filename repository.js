const {nameConv} = require("./utils");

class Repository {
	constructor(entity, domain) {
		this.domain = domain;
		this.entity = entity;
	}

	toString() {
		let out = "";
		out += `package ${this.domain}.repository;\n\n`;
		out += `import org.springframework.data.jpa.repository.JpaRepository;\n`;
		out += `import org.springframework.stereotype.Repository;\n\n`;
		out += `import java.util.List;\n`
		out += `import java.util.Optional;\n`
		out += `import ${this.domain}.entity.${this.entity.className};\n\n`;
		out += "@Repository\n";
		out += `public interface ${this.entity.className}Repository extends JpaRepository<${this.entity.className}, Long> {\n`;
		out += `\tOptional<${this.entity.className}> findBy${this.entity.columns.filter(c => c.primaryKey).map(c => `${nameConv(c.name, true)}`).join("And")}(${this.entity.columns.filter(c => c.primaryKey).map(c => `${c.javaType} ${nameConv(c.name)}`).join(", ")});\n`;
		out += this.entity.columns.filter(c => !(c.primaryKey && this.entity.primaryKey.columns.length === 1)).map(c => `\tList<${this.entity.className}> findAllBy${nameConv(c.name, true)}(${c.javaType} ${nameConv(c.name)});`).join("\n");
		out += "\n";
		out += this.entity.columns.filter(c => !(c.primaryKey && this.entity.primaryKey.columns.length === 1)).map(c => `\tboolean deleteAllBy${nameConv(c.name, true)}(${c.javaType} ${nameConv(c.name)});`).join("\n");
		out += "\n}\n";
		return out;
	}
}


module.exports = Repository;
