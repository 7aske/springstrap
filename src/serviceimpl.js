const {nameConv} = require("./utils");

class ServiceImpl {
	constructor(entity, domain) {
		this.domain = domain;
		this.entity = entity;
	}

	toString() {
		const varname = nameConv(this.entity.name);
		const className = this.entity.className;
		const domain = this.domain;

		let out = "";
		out += `package ${domain}.service.impl;\n\n`;
		out += `import org.springframework.beans.factory.annotation.Autowired;\n`;
		out += `import org.springframework.stereotype.Service;\n`;
		out += `import ${domain}.entity.${className};\n`;
		out += `import ${this.domain}.entity.*;\n`;
		out += `import ${domain}.repository.${className}Repository;\n`;
		out += `import ${domain}.service.${className}Service;\n`;
		out += `import java.util.List;\n`;
		out += `import java.time.LocalDate;\n\n`;
		out += `@Service\n`;
		out += `public class ${className}ServiceImpl implements ${className}Service {\n\n`;
		out += "\t@Autowired\n";
		out += `\tprivate ${className}Repository ${varname}Repository;\n\n`;

		out += "\t@Override\n";
		out += `\tpublic List<${className}> findAll() {\n`;
		out += `\t\treturn ${varname}Repository.findAll();\n`;
		out += "\t}\n\n";

		out += "\t@Override\n";
		out += `\tpublic ${className} findById${className}(Long id${className}) {\n`;
		out += `\t\treturn ${varname}Repository.findById(id${className}).orElse(null);\n`;
		out += "\t}\n\n";

		out += "\t@Override\n";
		out += `\tpublic ${className} save(${className} ${varname}) {\n`;
		out += `\t\treturn ${varname}Repository.save(${varname});\n`;
		out += "\t}\n\n";

		out += "\t@Override\n";
		out += `\tpublic ${className} update(${className} ${varname}) {\n`;
		out += `\t\treturn ${varname}Repository.save(${varname});\n`;
		out += "\t}\n\n";

		out += "\t@Override\n";
		out += `\tpublic void delete(${className} ${varname}) {\n`;
		out += `\t\t${varname}Repository.delete(${varname});\n`;
		out += "\t}\n\n";

		out += "\t@Override\n";
		out += `\tpublic void deleteById${className}(Long id${className}) {\n`;
		out += `\t\t${varname}Repository.deleteById(id${className});\n`;
		out += "\t}\n\n";

		out += "}\n";
		return out;
	}
}

module.exports = ServiceImpl;