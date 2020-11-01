import { snakeToCamel, DEFAULT_SSOPT, plural, uncapitalize } from "./utils";
import Service from "./service";
import JavaClass from "./def/JavaClass";
import Repository from "./repository";

export default class ServiceImpl extends JavaClass {
	private readonly _service: Service;
	private readonly _repository: Repository;
	private readonly _className: string;

	constructor(service: Service, repository: Repository, domain: string, options: SpringStrapOptions = DEFAULT_SSOPT) {
		super(domain, "service.impl", options);
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
		super.auditable = false;
		if (this.options.lombok) super.annotations.push(...lombokAnnotations);
		if (!this.options.lombok) super.imports.push(...noLombokImports);
		this._repository = repository;
		this._service = service;
		this._className = `${service.className}Impl`;
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
		const entity = this._service.entity;

		let code = "";
		if (this.options.lombok) {
			code += `\tprivate final ${this.repository.className} ${this.repository.varName};\n\n`;
		} else {
			code += "\t@Autowired\n";
			code += `\tprivate ${this.repository.className} ${this._repository.varName};\n\n`;
		}

		code += "\t@Override\n";
		code += `\tpublic List<${entity.className}> findAll() {\n`;
		code += `\t\treturn ${entity.varName}Repository.findAll();\n`;
		code += "\t}\n\n";

		code += "\t@Override\n";
		code += `\tpublic ${entity.className} findById(${entity.id.javaType} ${entity.id.varName}) {\n`;
		code += `\t\treturn ${snakeToCamel(this._service.entity.tableName)}Repository.findById(${entity.id.varName})\n\t\t\t\t.orElseThrow(() -> new NoSuchElementException("${this._service.className}.notFound"));\n`;
		code += "\t}\n\n";

		code += "\t@Override\n";
		code += `\tpublic ${entity.className} save(${entity.className} ${entity.varName}) {\n`;
		code += `\t\treturn ${entity.varName}Repository.save(${entity.varName});\n`;
		code += "\t}\n\n";

		code += "\t@Override\n";
		code += `\tpublic ${entity.className} update(${entity.className} ${entity.varName}) {\n`;
		code += `\t\treturn ${entity.varName}Repository.save(${entity.varName});\n`;
		code += "\t}\n\n";

		code += "\t@Override\n";
		code += `\tpublic void deleteById(${entity.id.javaType} ${entity.id.varName}) {\n`;
		code += `\t\t${snakeToCamel(this._service.entity.tableName)}Repository.deleteById(${entity.id.varName});\n`;
		code += "\t}\n\n";

		this._service.entity.mtmColumns.forEach(col => {
			code += "\t@Override\n";
			code += `\tpublic List<${col.targetClassName}> findAll${plural(col.targetClassName)}By${entity.id.className}(${entity.id.javaType} ${entity.id.varName}) {\n`;
			code += `\t\treturn findById(${this.service.entity.id.varName}).get${plural(col.targetClassName)}();\n`;
			code += "\t}\n\n";
		});

		return this.wrap(code);
	}
}
