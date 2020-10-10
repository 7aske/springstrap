import Entity from "./entity";
import { nameConv, DEFAULT_SSOPT } from "./utils";

export default class ServiceImpl {
	domain: string;
	entity: Entity;
	options: SpringStrapOptions;

	constructor(entity: Entity, domain: string, options: SpringStrapOptions = DEFAULT_SSOPT) {
		this.domain = domain;
		this.entity = entity;
		this.options = options;
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
		if (this.options.useLombok) {
			out += "@RequiredArgsConstructor\n"
		}
		out += `public class ${className}ServiceImpl implements ${className}Service {\n\n`;
		if (this.options.useLombok) {
			out += `\tprivate final ${className}Repository ${varname}Repository;\n\n`;
		} else {
			out += "\t@Autowired\n";
			out += `\tprivate ${className}Repository ${varname}Repository;\n\n`;
		}

		out += "\t@Override\n";
		out += `\tpublic List<${className}> findAll() {\n`;
		out += `\t\treturn ${varname}Repository.findAll();\n`;
		out += "\t}\n\n";

		out += "\t@Override\n";
		out += `\tpublic ${className} save(${className} ${varname}) {\n`;
		out += `\t\treturn ${varname}Repository.save(${varname});\n`;
		out += "\t}\n\n";

		out += "\t@Override\n";
		out += `\tpublic ${className} update(${className} ${varname}) {\n`;
		out += `\t\treturn ${varname}Repository.save(${varname});\n`;
		out += "\t}\n\n";

		this.entity.columns.forEach(c => {
				if (c.primaryKey) {
					out += "\t@Override\n";
					out += `\tpublic ${this.entity.className} findById(${c.javaType} ${nameConv(c.name)}) {\n`;
					out += `\t\treturn ${nameConv(this.entity.name)}Repository.findById(${nameConv(c.name)}).orElseThrow(() -> new NoSuchElementException("${this.entity.className}.notFound"));\n`;
					out += "\t}\n\n";
				}
			});

		this.entity.columns .forEach(c => {
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
