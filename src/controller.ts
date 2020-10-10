import Entity from "./entity";
import { typeConv } from "./types";
import { nameConv, DEFAULT_SSOPT } from "./utils";

const controllerTemplate = (domain: string, entity: Entity, options = DEFAULT_SSOPT) => {
	const className = entity.className;
	let serviceName = className + "Service";
	let varServiceName = className.charAt(0).toLowerCase() + className.substring(1) + "Service";
	let varName = className.charAt(0).toLowerCase() + className.substring(1);
	let endpoint: string = entity.name.replace("_", "-");
	if (endpoint.endsWith("s")) {
		endpoint = endpoint + "es";
	} else if (endpoint.endsWith("y")) {
		endpoint = endpoint.substring(0, endpoint.length - 1) + "ies";
	} else {
		endpoint = endpoint + "s";
	}

	const primaryKeys = entity.columns.filter(c => (entity.primaryKey.columns as any[]).find(c1 => c.name === c1.column)).map(c => ({
		name: nameConv(c.name),
		type: typeConv(c.type),
	}));

	return `
package ${domain}.controller;

import ${domain}.entity.${className};
import ${domain}.service.${serviceName};
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import lombok.*;

import ${domain}.entity.*;

import java.util.List;

@RestController
@RequestMapping("/${endpoint}")
${options.useLombok ? "@RequiredArgsConstructor\n" : ""}
public class ${className}Controller {
${(options.useLombok ?
	`\tprivate final ${serviceName} ${varServiceName};\n\n`
	:
	`\t@Autowired\n\tprivate ${serviceName} ${varServiceName};\n\n`)
}
\t@GetMapping
\tpublic ResponseEntity<List<${className}>> getAll() {
\t\treturn ResponseEntity.ok(${varServiceName}.findAll());
\t}

${primaryKeys.length === 1 ?
		`\t@GetMapping("/{${primaryKeys[0].name}}")
\tpublic ResponseEntity<${className}> getById(@PathVariable ${primaryKeys[0].type} ${primaryKeys[0].name}) {
\t\treturn ResponseEntity.ok(${varServiceName}.findById(${primaryKeys[0].name}));
\t}`
		:
		`\t@GetMapping("${primaryKeys.map(pk => `/{${pk.name}}`).join("")}")
\tpublic ResponseEntity<${className}> getById(${primaryKeys.map(pk => `@PathVariable ${pk.type} ${pk.name}`).join(", ")}) {
\t\treturn ResponseEntity.ok(${varServiceName}.findById(${primaryKeys.map(pk => `${pk.name}`).join(", ")}));
\t}`}

\t@PostMapping
\tpublic ResponseEntity<${className}> save(@RequestBody ${className} ${varName}) {
\t\treturn ResponseEntity.ok(${varServiceName}.save(${varName}));
\t}

\t@PutMapping
\tpublic ResponseEntity<${className}> update(@RequestBody ${className} ${varName}) {
\t\treturn ResponseEntity.ok(${varServiceName}.update(${varName}));
\t}

${primaryKeys.length === 1 ?
		`\t@DeleteMapping("/{${primaryKeys[0].name}}")
\tpublic void deleteById(@PathVariable ${primaryKeys[0].type} ${primaryKeys[0].name}) {
\t\t${varServiceName}.deleteById(${primaryKeys[0].name});
\t}`
		:
		`\t@DeleteMapping("${primaryKeys.map(pk => `/{${pk.name}}`).join("")}")
\tpublic void deleteById(${primaryKeys.map(pk => `@PathVariable ${pk.type} ${pk.name}`).join(", ")}) {
\t\t${varServiceName}.deleteById(${primaryKeys.map(pk => `${pk.name}`).join(", ")});
\t}`}
}\n`;
};

export default controllerTemplate;

