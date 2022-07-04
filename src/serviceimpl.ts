import {DEFAULT_SSOPT, plural, snakeToCamel, uncapitalize} from "./utils";
import Service from "./service";
import JavaClass from "./def/JavaClass";
import Repository from "./repository";
import {BasicMethodBuilder} from "./methodBuilder";

export default class ServiceImpl extends JavaClass {
	private readonly _service: Service;
	private readonly _repository: Repository;
	private readonly _className: string;

	constructor(service: Service, repository: Repository, domain: string, options: SpringStrapOptions = DEFAULT_SSOPT) {
		super(domain, "service.impl", options);
		this._repository = repository;
		this._service = service;
		this._className = `${service.className}Impl`;
		super.imports = [
			"org.springframework.stereotype.Service",
			`${service.entity.package}.*`,
			repository.import,
			service.import,
			"java.util.NoSuchElementException",
			"java.util.List",
		];
		super.interfaces = [
			service.className,
		];
		super.annotations = [
			"Service",
		];
		const lombokAnnotations = [
			"RequiredArgsConstructor",
		];

		const noLombokImports = [
			"org.springframework.beans.factory.annotation.Autowired",
		];

		if (this.options.base) {
			super.imports.push(`${options.domain ? options.domain + "." : ""}generic.*`);
			super.superClasses = [
				`BaseServiceImpl<${this.service.entity.className}>`
			];
			lombokAnnotations.length = 0;
		}

		if (this.options.specification) super.imports.push("org.springframework.data.jpa.domain.Specification");
		if (this.options.sort) super.imports.push("org.springframework.data.domain.Sort");

		if (this.options.security && this.className === "UserServiceImpl") {
			super.imports.push(
				"org.springframework.security.core.userdetails.UserDetails",
				"org.springframework.security.core.userdetails.UserDetailsService",
				"org.springframework.security.core.userdetails.UsernameNotFoundException",
			);
			super.interfaces.push("UserDetailsService");
		}

		super.auditable = false;
		if (this.options.lombok) super.annotations.push(...lombokAnnotations);
		if (this.options.lombok) super.imports.push("lombok.RequiredArgsConstructor");
		if (!this.options.lombok) super.imports.push(...noLombokImports);

	}

	public get className(): string {
		return this._className;
	}

	public get varName(): string {
		return uncapitalize(this._service.className);
	}

	public get service(): Service {
		return this._service;
	}

	public get repository(): Repository {
		return this._repository;
	}

	public get code() {
		const ent = this._service.entity;

		let code = "";
		if (this.options.base) {
			if (this.options.security && this.className === "UserServiceImpl") {
				code += `\tprivate final ${this.repository.className} ${this.repository.varName};\n`;
			}
			code += "\n" +
				`\tprotected ${this.className}(${this.repository.className} ${this.repository.varName}) {\n` +
				`\t\tsuper(${this.repository.varName});\n`;
			if (this.options.security && this.className === "UserServiceImpl") {
				code += `\t\tthis.${this.repository.varName} = ${this.repository.varName};\n`;
			}
			code += "\t}"
		} else if (this.options.lombok) {
			code += `\tprivate final ${this.repository.className} ${this.repository.varName};\n\n`;
		} else {
			code += "\t@Autowired\n";
			code += `\tprivate ${this.repository.className} ${this._repository.varName};\n\n`;
		}
		if (!this.options.base) {
			if (this.options.specification && this.options.sort) {
				code += "\t@Override\n";
				code += `\tpublic List<${ent.className}> findAll(Specification<${ent.className}> specification, Sort sort) {\n`;
				code += `\t\treturn ${ent.varName}Repository.findAll(specification, sort == null ? Sort.unsorted() : sort);\n`;
				code += "\t}\n\n";
			} else if (this.options.specification) {
				code += "\t@Override\n";
				code += `\tpublic List<${ent.className}> findAll(Specification<${ent.className}> specification) {\n`;
				code += `\t\treturn ${ent.varName}Repository.findAll(specification);\n`;
				code += "\t}\n\n";
			} else {
				code += "\t@Override\n";
				code += `\tpublic List<${ent.className}> findAll() {\n`;
				code += `\t\treturn ${ent.varName}Repository.findAll();\n`;
				code += "\t}\n\n";
			}

			code += "\t@Override\n";
			code += `\tpublic ${ent.className} findById(${ent.idArgsString}) {\n`;
			code += `\t\treturn ${snakeToCamel(ent.tableName)}Repository.findById(${ent.id.length === 1 ? ent.idVars : `new ${ent.className}.${ent.embeddedId.className}(${ent.idVars})`})\n\t\t\t\t.orElseThrow(() -> new NoSuchElementException("${this._service.className}.notFound"));\n`;
			code += "\t}\n\n";

			code += "\t@Override\n";
			code += `\tpublic ${ent.className} save(${ent.className} ${ent.varName}) {\n`;
			code += `\t\treturn ${ent.varName}Repository.save(${ent.varName});\n`;
			code += "\t}\n\n";

			code += "\t@Override\n";
			code += `\tpublic ${ent.className} update(${ent.className} ${ent.varName}) {\n`;
			code += `\t\treturn ${ent.varName}Repository.save(${ent.varName});\n`;
			code += "\t}\n\n";

			code += "\t@Override\n";
			code += `\tpublic void deleteById(${ent.idArgsString}) {\n`;
			code += `\t\t${snakeToCamel(ent.tableName)}Repository.deleteById(${ent.id.length === 1 ? ent.idVars : `new ${ent.className}.${ent.embeddedId.className}(${ent.idVars})`});\n`;
			code += "\t}\n\n";

			ent.mtmColumns.forEach(col => {
				code += "\t@Override\n";
				code += `\tpublic List<${col.targetClassName}> findAll${plural(col.targetClassName)}ById(${ent.idArgsString}) {\n`;
				code += `\t\treturn findById(${ent.idVars}).get${plural(col.targetClassName)}();\n`;
				code += "\t}\n\n";

				code += "\t@Override\n";
				code += `\tpublic List<${col.targetClassName}> add${plural(col.targetClassName)}ById(${ent.idArgsString}, List<${col.targetClassName}> ${col.targetVarName}) {\n`;
				code += `\t\t${ent.className} ${ent.varName} = findById(${ent.idVars});\n`;
				code += `\t\t${ent.varName}.get${plural(col.targetClassName)}().addAll(${col.targetVarName});\n`;
				code += `\t\treturn ${ent.varName}Repository.save(${ent.varName}).get${plural(col.targetClassName)}();\n`;
				code += "\t}\n\n";

				code += "\t@Override\n";
				code += `\tpublic List<${col.targetClassName}> set${plural(col.targetClassName)}ById(${ent.idArgsString}, List<${col.targetClassName}> ${col.targetVarName}) {\n`;
				code += `\t\t${ent.className} ${ent.varName} = findById(${ent.idVars});\n`;
				code += `\t\t${ent.varName}.set${plural(col.targetClassName)}(${col.targetVarName});\n`;
				code += `\t\treturn ${ent.varName}Repository.save(${ent.varName}).get${plural(col.targetClassName)}();\n`;
				code += "\t}\n\n";

				code += "\t@Override\n";
				code += `\tpublic List<${col.targetClassName}> delete${plural(col.targetClassName)}ById(${ent.idArgsString}, List<${col.targetClassName}> ${col.targetVarName}) {\n`;
				code += `\t\t${ent.className} ${ent.varName} = findById(${ent.idVars});\n`;
				code += `\t\t${ent.varName}.get${plural(col.targetClassName)}().removeAll(${col.targetVarName});\n`;
				code += `\t\treturn ${ent.varName}Repository.save(${ent.varName}).get${plural(col.targetClassName)}();\n`;
				code += "\t}\n\n";
			});
		}

		if (this.options.security && this.className === "UserServiceImpl") {
			code += new BasicMethodBuilder()
				.name("loadUserByUsername")
				.annotation("Override")
				.return("UserDetails")
				.arg(["String", "username"])
				.throws("UsernameNotFoundException")
				.implementation("\treturn userRepository.findByUsername(username)\n\t\t\t\t.orElseThrow(() -> new UsernameNotFoundException(\"User not found\"));\n")
				.build()
				.generate();
		}

		return this.wrap(code);
	}
}
