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
		out += `import org.springframework.stereotype.Service;\n`;
		out += "import lombok.*;\n";
		out += `import ${this.domain}.entity.*;\n`;
		out += `import ${domain}.repository.${className}Repository;\n`;
		out += `import ${domain}.service.${className}Service;\n`;
		out += `import java.util.NoSuchElementException;\n`;
		out += `import java.util.List;\n`;
		out += `import java.time.LocalDate;\n\n`;
		out += `@Service\n`;
		out += "@RequiredArgsConstructor\n"
		out += `public class ${className}ServiceImpl implements ${className}Service {\n\n`;
		// out += "\t@Autowired\n";
		out += `\tprivate final ${className}Repository ${varname}Repository;\n\n`;

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

		// out += "\t@Override\n";
		// out += `\tpublic void delete(${className} ${varname}) {\n`;
		// out += `\t\t${varname}Repository.delete(${varname});\n`;
		// out += "\t}\n\n";

		this.entity.columns//.filter(c => (c.primaryKey && this.entity.primaryKey.columns.length === 1))
			.forEach(c => {
				if (c.primaryKey) {
					out += "\t@Override\n";
					out += `\tpublic ${this.entity.className} findById(${c.javaType} ${nameConv(c.name)}) {\n`;
					out += `\t\treturn ${nameConv(this.entity.name)}Repository.findById(${nameConv(c.name)}).orElseThrow(() -> new NoSuchElementException("${this.entity.className}.notFound"));\n`;
					out += "\t}\n\n";
				}
			});

		this.entity.columns//.filter(c => (c.primaryKey && this.entity.primaryKey.columns.length === 1))
			.forEach(c => {
				if (c.primaryKey) {
					out += "\t@Override\n";
					out += `\tpublic void deleteById(${c.javaType} ${nameConv(c.name)}) {\n`;
					out += `\t\t${nameConv(this.entity.name)}Repository.deleteById(${nameConv(c.name)});\n`;
					out += "\t}\n\n";
				}
			});

		out += "}\n";
		return out;
	}
}
