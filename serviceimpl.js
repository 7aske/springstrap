const {nameConv} = require("./utils");

class ServiceImpl {
	constructor(name, domain) {
		this.name = name;
		this.domain = domain;
		this.className = nameConv(name, true);
	}

	toString() {
		let varname = nameConv(this.name);
		let out = "";
		out += `package ${this.domain}.service;\n\n`;
		out += `import org.springframework.beans.factory.annotation.Autowired;\n`;
		out += `import org.springframework.stereotype.Service;\n`;
		out += `import ${this.domain}.entity.${this.className};\n`;
		out += `import ${this.domain}.repository.${this.className}Repository;\n`;
		out += `import java.util.List;\n\n`;
		out += `@Service\n`;
		out += `public class ${this.className}ServiceImpl implements ${this.className}Service {\n\n`;
		out += "\t@Autowired\n";
		out += `\tprivate ${this.className}Repository ${varname}Repository;\n\n`;

		out += "\t@Override\n";
		out += `\tpublic List<${this.className}> findAll() {\n`;
		out += `\t\treturn ${varname}Repository.findAll();\n`;
		out += "\t}\n\n";

		out += "\t@Override\n";
		out += `\tpublic ${this.className} findById(Long id${this.className}) {\n`;
		out += `\t\tif (${varname}Repository.findById(id${this.className}).isPresent()) {\n`;
		out += `\t\t\treturn ${varname}Repository.findById(id${this.className}).get();\n`;
		out += `\t\t} else {\n`;
		out += `\t\t\treturn null;\n`;
		out += `\t\t}\n`;
		out += "\t}\n\n";

		out += "\t@Override\n";
		out += `\tpublic ${this.className} save(${this.className} ${varname}) {\n`;
		out += `\t\treturn ${varname}Repository.save(${varname});\n`;
		out += "\t}\n\n";

		out += "\t@Override\n";
		out += `\tpublic ${this.className} update(${this.className} ${varname}) {\n`;
		out += `\t\treturn ${varname}Repository.save(${varname});\n`;
		out += "\t}\n\n";

		out += "\t@Override\n";
		out += `\tpublic boolean delete(${this.className} ${varname}) {\n`;
		out += `\t\t${varname}Repository.delete(${varname});\n`;
		out += `\t\treturn !${varname}Repository.findById(${varname}.getId${this.className}()).isPresent();\n`;
		out += "\t}\n\n";

		out += "\t@Override\n";
		out += `\tpublic boolean deleteById(Long id${this.className}) {\n`;
		out += `\t\t${varname}Repository.deleteById(id${this.className});\n`;
		out += `\t\treturn !${varname}Repository.findById(id${this.className}).isPresent();\n`;
		out += "\t}\n\n";

		out += "}\n";
		return out;
	}
}

module.exports = ServiceImpl;
