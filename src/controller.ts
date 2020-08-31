import Entity from "./entity";
import { typeConv } from "./types";
import { nameConv } from "./utils";

const controllerTemplate = (domain:string, entity:Entity) => {
	const className = entity.className;
	let serviceName = className + "Service";
	let varServiceName = className.charAt(0).toLowerCase() + className.substring(1) + "Service";
	let varName = className.charAt(0).toLowerCase() + className.substring(1);

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

import ${domain}.entity.*;

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
`\t@GetMapping("/getById/{${primaryKeys[0].name}}")
\tpublic ResponseEntity<${className}> getById(@PathVariable ${primaryKeys[0].type} ${primaryKeys[0].name}) {
\t\treturn ResponseEntity.ok(${varServiceName}.findBy${nameConv(primaryKeys[0].name, true)}(${primaryKeys[0].name}));
\t}`
		:
`\t@GetMapping("/getById${primaryKeys.map(pk => `/{${pk.name}}`).join("")}")
\tpublic ResponseEntity<${className}> getById(${primaryKeys.map(pk => `@PathVariable ${pk.type} ${pk.name}`).join(", ")}) {
\t\treturn ResponseEntity.ok(${varServiceName}.findById(${primaryKeys.map(pk => `${pk.name}`).join(", ")}));
\t}`}

\t@PostMapping("/save")
\tpublic ResponseEntity<Object> save(@RequestBody ${className} ${varName}) {
\t\ttry {
\t\t\treturn ResponseEntity.ok(${varServiceName}.save(${varName}));
\t\t} catch (Exception e) {
\t\t\te.printStackTrace();
\t\t\treturn ResponseEntity.badRequest().body(e.getMessage());
\t\t}
\t}

\t@PutMapping("/update")
\tpublic ResponseEntity<Object> update(@RequestBody ${className} ${varName}) {
\t\ttry {
\t\t\treturn ResponseEntity.ok(${varServiceName}.update(${varName}));
\t\t} catch (Exception e) {
\t\t\te.printStackTrace();
\t\t\treturn ResponseEntity.badRequest().body(e.getMessage());
\t\t}
\t}

\t@DeleteMapping("/delete")
\tpublic ResponseEntity<Boolean> delete(@RequestBody ${className} ${varName}) {
\t\ttry {
\t\t\t${varServiceName}.delete(${varName});
\t\t\treturn ResponseEntity.ok(true);
\t\t} catch (Exception e) {
\t\t\te.printStackTrace();
\t\t\treturn ResponseEntity.badRequest().body(false);
\t\t}
\t}

${primaryKeys.length === 1 ?
`\t@DeleteMapping("/deleteById/{id${className}}")
\tpublic ResponseEntity<Boolean> deleteById(@PathVariable ${primaryKeys[0].type} ${primaryKeys[0].name}) {
\t\ttry {
\t\t\t${varServiceName}.deleteBy${nameConv(primaryKeys[0].name, true)}(${primaryKeys[0].name});
\t\t\treturn ResponseEntity.ok(true);
\t\t} catch (Exception e) {
\t\t\te.printStackTrace();
\t\t\treturn ResponseEntity.badRequest().body(false);
\t\t}
\t}`
		:
`\t@DeleteMapping("/deleteById${primaryKeys.map(pk => `/{${pk.name}}`).join("")}")
\tpublic ResponseEntity<Boolean> deleteById(${primaryKeys.map(pk => `@PathVariable ${pk.type} ${pk.name}`).join(", ")}) {
\t\ttry {
\t\t\t${varServiceName}.deleteAllById(${primaryKeys.map(pk => `${pk.name}`).join(", ")});
\t\t\treturn ResponseEntity.ok(true);
\t\t} catch (Exception e) {
\t\t\te.printStackTrace();
\t\t\treturn ResponseEntity.badRequest().body(false);
\t\t}
\t}`}
}\n`;
};

export default controllerTemplate;

