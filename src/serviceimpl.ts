import {
	snakeToCamel,
	DEFAULT_SSOPT,
	formatImports,
	formatAnnotations,
	plural,
	capitalize,
	uncapitalize,
} from "./utils";
import Service from "./service";

export default class ServiceImpl {
	private readonly _domain: string;
	private readonly _service: Service;
	private readonly _options: SpringStrapOptions;

	constructor(entity: Service, domain: string, options: SpringStrapOptions = DEFAULT_SSOPT) {
		this._domain = domain;
		this._service = entity;
		this._options = options;
	}

	public get code() {
		const className = this._service.entity.className;
		const varName = this._service.entity.varName;
		const primaryKeys = this._service.entity.primaryKeyList;
		const domain = this._domain;

		const imports = [
			"org.springframework.stereotype.Service",
			`lombok.*`,
			`${domain}.entity.*`,
			`${domain}.repository.${className}Repository`,
			`${domain}.service.${className}Service`,
			"java.util.NoSuchElementException",
			"java.util.List",
		];
		const annotations = [
			"Service",
		];
		const lombokAnnotations = [
			"RequiredArgsConstructor",
		];
		const noLombokAnnotations = [
			"org.springframework.beans.factory.annotation.Autowired",
		];

		if (this._options.lombok) annotations.push(...lombokAnnotations);
		if (!this._options.lombok) annotations.push(...noLombokAnnotations);

		let out = `${this.packageName}\n\n`;
		out += formatImports(imports);
		out += formatAnnotations(annotations);
		out += `public class ${this.className} implements ${this._service.className} {\n\n`;

		if (this._options.lombok) {
			out += `\tprivate final ${className}Repository ${varName}Repository;\n\n`;
		} else {
			out += "\t@Autowired\n";
			out += `\tprivate ${className}Repository ${varName}Repository;\n\n`;
		}

		out += "\t@Override\n";
		out += `\tpublic List<${className}> findAll() {\n`;
		out += `\t\treturn ${varName}Repository.findAll();\n`;
		out += "\t}\n\n";

		out += "\t@Override\n";
		out += `\tpublic ${className} findById(${this.primaryKeyList.map(c => `${c.javaType} ${snakeToCamel(c.name)}`)}) {\n`;
		out += `\t\treturn ${snakeToCamel(this._service.entity.tableName)}Repository.findById(${this.primaryKeyList.map(c => snakeToCamel(c.name))})\n\t\t\t\t.orElseThrow(() -> new NoSuchElementException("${this._service.className}.notFound"));\n`;
		out += "\t}\n\n";

		out += "\t@Override\n";
		out += `\tpublic ${className} save(${className} ${varName}) {\n`;
		out += `\t\treturn ${varName}Repository.save(${varName});\n`;
		out += "\t}\n\n";

		out += "\t@Override\n";
		out += `\tpublic ${className} update(${className} ${varName}) {\n`;
		out += `\t\treturn ${varName}Repository.save(${varName});\n`;
		out += "\t}\n\n";

		out += "\t@Override\n";
		out += `\tpublic void deleteById(${this.primaryKeyList.map(c => `${c.javaType} ${snakeToCamel(c.name)}`)}) {\n`;
		out += `\t\t${snakeToCamel(this._service.entity.tableName)}Repository.deleteById(${this.primaryKeyList.map(c => snakeToCamel(c.name))});\n`;
		out += "\t}\n\n";

		this._service.entity.mtmColumns.forEach(col => {
			out += "\t@Override\n";
			out += `\tpublic List<${col.targetClassName}> findAll${plural(col.targetClassName)}By${primaryKeys.map(key => `${capitalize(key.varName)}`).join("And")}(${primaryKeys.map(key => `${key.javaType} ${key.varName}`).join(", ")}) {\n`;
			out += `\t\treturn findById(${primaryKeys.map(key => `${key.varName}`).join(", ")}).get${plural(col.targetClassName)}();\n`;
			out += "\t}\n";
		});

		out += "}\n";
		return out;
	}

	public get className(): string {
		return `${this._service.className}Impl`;
	}

	public get packageName(): string {
		if (!this._domain) return "package service.impl;";
		return `package ${this._domain}.service.impl;`;
	}

	private get primaryKeyList() {
		return this._service.entity.columns.filter(c => c.primaryKey);
	}
}
