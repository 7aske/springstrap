import Entity from "./entity";
import { DEFAULT_SSOPT, decapitalize, formatImports, formatAnnotations } from "./utils";
import Service from "./service";

export default class Controller {
	private readonly _service: Service;
	private readonly _domain: string;
	private readonly _options: SpringStrapOptions;

	constructor(service: Service, domain: string, options = DEFAULT_SSOPT) {
		this._service = service;
		this._domain = domain;
		this._options = options;
	}

	public get code(): string {
		const domain = this._domain;
		const className = this._service.entity.className;
		const serviceName = this._service.className;
		const varServiceName = decapitalize(serviceName);
		const varName = decapitalize(className);
		const endpoint = this.endpoint;
		const primaryKeys = this.primaryKeyList;
		const imports = [
			`${domain}.entity.${className}`,
			`${domain}.service.${serviceName}`,
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

		if (this._options.useLombok) imports.push(...lombokImports);
		if (!this._options.useLombok) imports.push(...noLombokImports);
		if (this._options.useLombok) annotations.push(...lombokAnnotations);

		let out = `${this.packageName}\n\n`;
		out += formatImports(imports);
		out += formatAnnotations(annotations);
		out += `public class ${this.className} {\n`;

		this._options.useLombok ?
			out += `\tprivate final ${serviceName} ${varServiceName};\n\n`
			:
			out += `\t@Autowired\n\tprivate ${serviceName} ${varServiceName};\n\n`;

		out += `\t@GetMapping\n`;
		out += `\tpublic ResponseEntity<List<${className}>> getAll() {\n`;
		out += `\t\treturn ResponseEntity.ok(${varServiceName}.findAll());\n`;
		out += `\t}\n\n`;

		out += `\t@GetMapping("/{${primaryKeys.map(key => key.varName).join("/")}}")\n`;
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
		out += `\t}\n}\n\n`;

		return out;
	}

	private get primaryKeyList() {
		return this._service.entity.columns.filter(c => c.primaryKey);
	}

	public get endpoint(): string {
		let endpoint: string = this._service.entity.tableName.replace("_", "-");
		if (endpoint.endsWith("s")) {
			endpoint = endpoint + "es";
		} else if (endpoint.endsWith("y")) {
			endpoint = endpoint.substring(0, endpoint.length - 1) + "ies";
		} else {
			endpoint = endpoint + "s";
		}
		return endpoint;
	}


	public get className(): string {
		return `${this._service.entity.className}Controller`;
	}

	public get packageName(): string {
		if (!this._domain) return "package controller;";
		return `package ${this._domain}.controller;`;
	}
}
