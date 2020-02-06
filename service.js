const {nameConv} = require("./utils");

class Service {
	constructor(name, domain) {
		this.name = name;
		this.domain = domain;
		this.className = nameConv(name, true);
	}

	toString() {
		let varname = nameConv(this.name);
		let out = "";
		out += `package ${this.domain}.service;\n\n`;
		out += `import ${this.domain}.entity.${this.className};\n`;
		out += `import java.util.List;\n\n`;
		out += `public interface ${this.className}Service {\n\n`;
		out += `\tList<${this.className}> findAll();\n\n`;
		out += `\t${this.className} findById(Long id${this.className});\n\n`;
		out += `\t${this.className} save(${this.className} ${varname});\n\n`;
		out += `\t${this.className} update(${this.className} ${varname});\n\n`;
		out += `\tboolean delete(${this.className} ${varname});\n\n`;
		out += `\tboolean deleteById(Long id${this.className});\n`;
		out += "}\n";
		return out;
	}
}

module.exports = Service;
