const controllerTemplate = (domain, className) => {
	let serviceName = className + "Service";
	let varServiceName = className.charAt(0).toLowerCase() + className.substring(1) + "Service";
	let varName = className.charAt(0).toLowerCase() + className.substring(1);
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

\t@GetMapping("/getAllById/{id${className}}")
\tpublic ResponseEntity<${className}> getById(@PathVariable Long id${className}) {
\t\treturn ResponseEntity.ok(${varServiceName}.findById(id${className}));
\t}


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

\t@DeleteMapping("/deleteById/{id${className}}")
\tpublic ResponseEntity<Object> deleteById(@PathVariable Long id${className}) {
\t\treturn ResponseEntity.ok(${varServiceName}.deleteById(id${className}));
\t}
}
`;
};
module.exports = controllerTemplate;
