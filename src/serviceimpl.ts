import Entity from "./entity";
import { nameConv } from "./utils";

export default class ServiceImpl {
	domain: string;
	entity: Entity;

	constructor(entity: Entity, domain: string) {
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

		// out += "\t@Override\n";
		// out += `\tpublic ${className} findById(${this.entity.columns.filter(c => c.primaryKey).map(c => `${c.javaType} ${c.varname}`).join(", ")}) {\n`;
		// out += `\t\treturn ${varname}Repository.findBy${this.}(${this.entity.columns.filter(c => c.primaryKey).map(c => c.varname).join(", ")}).orElse(null);\n`;
		// out += "\t}\n\n";

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

		this.entity.columns//.filter(c => (c.primaryKey && this.entity.primaryKey.columns.length === 1))
			.forEach(c => {
				out += "\t@Override\n";
				out += `\tpublic ${c.primaryKey ? this.entity.className :`List<${this.entity.className}>`} findBy${nameConv(c.name, true)}(${c.javaType} ${nameConv(c.name)}) {\n`;
				if (c.primaryKey){
					out += `\t\treturn ${nameConv(this.entity.name)}Repository.findBy${nameConv(c.name, true)}(${nameConv(c.name)}).orElse(null);\n`;
				} else {

					out += `\t\treturn ${nameConv(this.entity.name)}Repository.findAllBy${nameConv(c.name, true)}(${nameConv(c.name)});\n`;
				}
				out += "\t}\n\n";
			});

		this.entity.columns//.filter(c => (c.primaryKey && this.entity.primaryKey.columns.length === 1))
			.forEach(c => {
				out += "\t@Override\n";
				out += `\tpublic void deleteBy${nameConv(c.name, true)}(${c.javaType} ${nameConv(c.name)}) {\n`;
				out += `\t\t${nameConv(this.entity.name)}Repository.deleteAllBy${nameConv(c.name, true)}(${nameConv(c.name)});\n`;
				out += "\t}\n\n";
			});

		out += "}\n";
		return out;
	}
}
