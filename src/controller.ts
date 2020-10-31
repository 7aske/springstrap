import { DEFAULT_SSOPT, uncapitalize, formatImports, formatAnnotations, plural, capitalize } from "./utils";
import Service from "./service";

export default class Controller {
	private readonly _service: Service;
	private readonly _domain: string;
	private readonly _options: SpringStrapOptions;
	private readonly _endpoint: string;

	constructor(service: Service, domain: string, options = DEFAULT_SSOPT) {
		this._service = service;
		this._domain = domain;
		this._options = options;
		this._endpoint = plural(this._service.entity.tableName.replace("_", "-"));
	}

	public get code(): string {
		const domain = this._domain;
		const className = this._service.entity.className;
		const serviceName = this._service.className;
		const varServiceName = uncapitalize(serviceName);
		const varName = uncapitalize(className);
		const endpoint = this.endpoint;
		const primaryKeys = this._service.entity.primaryKeyList;

		const imports = [
			`${domain ? domain + "." : ""}entity.*`,
			`${domain ? domain + "." : ""}service.*`,
			"org.springframework.web.bind.annotation.*",
			`org.springframework.http.ResponseEntity`,
			`java.util.List`,
		];
		const lombokImports = [
			`lombok.*`,
		];
		const noLombokImports = [
			`org.springframework.web.bind.annotation.Autowired`,
		];
		const annotations = [
			`RestController`,
			`RequestMapping("/${endpoint}")`,
		];
		const lombokAnnotations = [
			"RequiredArgsConstructor",
		];

		const services = [
			`${serviceName} ${varServiceName}`
		];

		if (this._options.lombok) imports.push(...lombokImports);
		if (!this._options.lombok) imports.push(...noLombokImports);
		if (this._options.lombok) annotations.push(...lombokAnnotations);

		let out = `${this.packageName}\n\n`;
		out += formatImports(imports);
		out += formatAnnotations(annotations);
		out += `public class ${this.className} {\n`;

		services.forEach(service => {
			this._options.lombok ?
				out += `\tprivate final ${service};\n\n`
				:
				out += `\t@Autowired\n\tprivate ${service};\n\n`;
		});

		out += `\t@GetMapping\n`;
		out += `\tpublic ResponseEntity<List<${className}>> getAll() {\n`;
		out += `\t\treturn ResponseEntity.ok(${varServiceName}.findAll());\n`;
		out += `\t}\n\n`;

		out += `\t@GetMapping("/${primaryKeys.map(key => `{${key.varName}}`).join("/")}")\n`;
		out += `\tpublic ResponseEntity<${className}> getById(${primaryKeys.map(key => `@PathVariable ${key.javaType} ${key.varName}`).join(", ")}) {\n`;
		out += `\t\treturn ResponseEntity.ok(${varServiceName}.findById(${primaryKeys.map(key => key.varName).join(", ")}));\n`;
		out += `\t}\n\n`;

		out += `\t@PostMapping\n`;
		out += `\tpublic ResponseEntity<${className}> save(@RequestBody ${className} ${varName}) {\n`;
		out += `\t\treturn ResponseEntity.ok(${varServiceName}.save(${varName}));\n`;
		out += `\t}\n\n`;

		out += `\t@PutMapping\n`;
		out += `\tpublic ResponseEntity<${className}> update(@RequestBody ${className} ${varName}) {\n`;
		out += `\t\treturn ResponseEntity.ok(${varServiceName}.update(${varName}));\n`;
		out += `\t}\n\n`;

		out += `\t@PutMapping("/{${primaryKeys.map(key => key.varName).join("/")}}")\n`;
		out += `\tpublic ResponseEntity<${className}> updateById(${primaryKeys.map(key => `@PathVariable ${key.javaType} ${key.varName}`).join(", ")}, @RequestBody ${className} ${varName}) {\n`;
		out += `\t\t${varName}.setId(${primaryKeys.map(key => key.varName).join(", ")});\n`;
		out += `\t\treturn ResponseEntity.ok(${varServiceName}.update(${varName}));\n`;
		out += `\t}\n\n`;

		out += `\t@DeleteMapping("${primaryKeys.map(pk => `/{${pk.varName}}`).join("")}")\n`;
		out += `\tpublic void deleteById(${primaryKeys.map(pk => `@PathVariable ${pk.javaType} ${pk.varName}`).join(", ")}) {\n`;
		out += `\t\t${varServiceName}.deleteById(${primaryKeys.map(pk => `${pk.varName}`).join(", ")});\n`;
		out += `\t}\n\n`;

		this._service.entity.mtmColumns.forEach(col => {

			out += `\t@GetMapping("/${primaryKeys.map(key => `{${key.varName}}`).join("/")}/${plural(col.target.replace("_", "-"))}")\n`;
			out += `\tpublic ResponseEntity<List<${col.targetClassName}>> getAll${plural(col.targetClassName)}(${primaryKeys.map(key => `@PathVariable ${key.javaType} ${key.varName}`).join(", ")}) {\n`;
			out += `\t\treturn ResponseEntity.ok(${varServiceName}.findAll${plural(col.targetClassName)}By${primaryKeys.map(key => `${capitalize(key.varName)}`).join("And")}(${primaryKeys.map(key => `${key.varName}`).join(", ")}));\n`;
			out += `\t}\n\n`;

		});

		out += "}\n\n";

		return out;
	}

	public get endpoint(): string {
		return this._endpoint;
	}


	public get className(): string {
		return `${this._service.entity.className}Controller`;
	}

	public get packageName(): string {
		if (!this._domain) return "package controller;";
		return `package ${this._domain}.controller;`;
	}
}
