const {nameConv} = require("./utils");

class Repository {
	constructor(name, domain) {
		this.domain = domain;
		this.name = name;
		this.className = nameConv(name, true);
	}

	toString() {
		let out = "";
		out += `package ${this.domain}.repository;\n\n`;
		out += `import org.springframework.data.jpa.repository.JpaRepository;\n`;
		out += `import org.springframework.stereotype.Repository;\n\n`;
		out += `import ${this.domain}.entity.${this.className};\n\n`;
		out += "@Repository\n";
		out += `public interface ${this.className}Repository extends JpaRepository<${this.className}, Long> {\n`;
		out += "}\n";
		return out;
	}
}


module.exports = Repository;
