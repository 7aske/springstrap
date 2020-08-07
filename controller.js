const {nameConv} = require("./utils");
const {typeConv} = require("./types");
const controllerTemplate = (domain, entity) => {
	const className = entity.className;
	let serviceName = className + "Service";
	let varServiceName = className.charAt(0).toLowerCase() + className.substring(1) + "Service";
	let varName = className.charAt(0).toLowerCase() + className.substring(1);

	const primaryKeys = entity.columns.filter(c => entity.primaryKey.columns.find(c1 => c.name === c1.column)).map(c => ({
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

import java.util.List;

@RestController
@RequestMapping("/${varName}")
public class ${className}Controller {
\t@Autowired
\tprivate ${serviceName} ${varServiceName};

\t@GetMapping("/getAll")
\tpublic ResponseEntity<List<${className}>> getAll() {
\t\treturn ResponseEntity.ok(${varServiceName}.findAll());
\t}

${primaryKeys.length === 1 ?
`\t@GetMapping("/getById/{id${className}}")
\tpublic ResponseEntity<${className}> getById(@PathVariable ${primaryKeys[0].type} ${primaryKeys[0].name}) {
\t\treturn ResponseEntity.ok(${varServiceName}.findBy${nameConv(primaryKeys[0].name, true)}(${primaryKeys[0].name}));
\t}`
		:
`\t@GetMapping("/getById${primaryKeys.map(pk => `/{${pk.name}}`).join("")}")
\tpublic ResponseEntity<${className}> getById(${primaryKeys.map(pk => `@PathVariable ${pk.type} ${pk.name}`).join(", ")}) {
\t\treturn ResponseEntity.ok(${varServiceName}.findById(${primaryKeys.map(pk => `${pk.name}`).join(", ")}));
\t}`}


\t@PostMapping("/save")
\tpublic ResponseEntity<${className}> save(@RequestBody ${className} ${varName}) {
\t\treturn ResponseEntity.ok(${varServiceName}.save(${varName}));
\t}

\t@PutMapping("/update")
\tpublic ResponseEntity<${className}> update(@RequestBody ${className} ${varName}) {
\t\treturn ResponseEntity.ok(${varServiceName}.update(${varName}));
\t}

\t@DeleteMapping("/delete")
\tpublic ResponseEntity<Object> delete(@RequestBody ${className} ${varName}) {
\t\treturn ResponseEntity.ok(${varServiceName}.delete(${varName}));
\t}

${primaryKeys.length === 1 ?
`\t@DeleteMapping("/deleteById/{id${className}}")
\tpublic ResponseEntity<Object> deleteById(@PathVariable ${primaryKeys[0].type} ${primaryKeys[0].name}) {
\t\treturn ResponseEntity.ok(${varServiceName}.deleteBy${nameConv(primaryKeys[0].name, true)}(${primaryKeys[0].name}));
\t}`
		:
`\t@DeleteMapping("/deleteById${primaryKeys.map(pk => `/{${pk.name}}`).join("")}")
\tpublic ResponseEntity<Object> deleteById(${primaryKeys.map(pk => `@PathVariable ${pk.type} ${pk.name}`).join(", ")}) {
\t\treturn ResponseEntity.ok(${varServiceName}.deleteAllById(${primaryKeys.map(pk => `${pk.name}`).join(", ")}));
\t}`}
}\n`;
};

module.exports = controllerTemplate;
