import { parseDDL } from "./parser";
import Entity from "./entity";
import Repository from "./repository";
import Service from "./service";
import ServiceImpl from "./serviceimpl";
import Controller from "./controller";
import Auditable from "./auditable";
import AuditorAware from "./auditoraware";
import Swagger from "./swagger";
import Config from "./config";

function join(...parts: string[]) {
	const sep = "/";
	const replace = new RegExp(sep + "{1,}", "g");
	return parts.join(sep).replace(replace, sep);
}

const run = (sql: string, options: SpringStrapOptions) => {
	if (options.domain) {
		new URL("http://" + options.domain);
	}

	const rootDir = options.output ? join(options.output, "src/main/java") : join("src/main/java");
	const entityDir = join(rootDir, ...options.domain.split("."), "entity");
	const serviceDir = join(rootDir, ...options.domain.split("."), "service");
	const serviceImplDir = join(rootDir, ...options.domain.split("."), "service/impl");
	const controllerDir = join(rootDir, ...options.domain.split("."), "controller");
	const repositoryDir = join(rootDir, ...options.domain.split("."), "repository");
	const configDir = join(rootDir, ...options.domain.split("."), "config");

	console.log("root   " + rootDir + "\n");
	console.log("domain " + options.domain + "\n");


	let jsonDDL = parseDDL(sql, options.type as any);
	let relations: DDLManyToMany[] = [];
	jsonDDL.forEach(tableDef => {
		if (!Entity.isMtmTable(tableDef)) return;
		if (!tableDef.foreignKeys || tableDef.foreignKeys.length !== 2) return;

		const fk1 = tableDef.foreignKeys[0];
		const fk2 = tableDef.foreignKeys[1];

		const rel1: DDLManyToMany = {
			name: tableDef.name,
			target: fk1.reference.table,
			source: fk2.reference.table,
			target_column: fk1.columns[0].column,
			source_column: fk2.columns[0].column,
		};
		const rel2: DDLManyToMany = {
			name: tableDef.name,
			target: fk2.reference.table,
			source: fk1.reference.table,
			target_column: fk2.columns[0].column,
			source_column: fk1.columns[0].column,
		};
		relations.push(rel1, rel2);
	});

	if (options.tables) {
		jsonDDL = jsonDDL
			.filter(tableDef => (options.tables as string)
				.split(",")
				.some(param => param === tableDef.name));
	}

	const out: {filename:string, content: string}[] = [];

	jsonDDL.forEach(tableDef => {
		try {
			// TODO: possibly extract as a filter
			const isIgnored = (options.ignore ? options.ignore : "").split(",").some(ignore => ignore === tableDef.name);
			if (isIgnored) return;
			if (Entity.isMtmTable(tableDef)) return;

			const manyToMany = relations.filter(rel => rel.source === tableDef.name);

			const entity = new Entity(tableDef, options.domain, manyToMany, [], options);
			const repository = new Repository(entity, options);
			const service = new Service(entity, options);
			const serviceImpl = new ServiceImpl(service, repository, options.domain, options);
			const controller = new Controller(service, options.domain, options);

			const entityFilename = join(entityDir, entity.fileName);
			const repositoryFilename = join(repositoryDir, repository.fileName);
			const serviceFilename = join(serviceDir, service.fileName);
			const serviceImplFilename = join(serviceImplDir, serviceImpl.fileName);
			const controllerFilename = join(controllerDir, controller.fileName);
			// @formatter:off
			if (options.entity)      out.push({filename: entityFilename, content:entity.code});
			if (options.repository)  out.push({filename: repositoryFilename, content:repository.code});
			if (options.service)     out.push({filename: serviceFilename, content:service.code});
			if (options.serviceimpl) out.push({filename: serviceImplFilename, content:serviceImpl.code});
			if (options.controller)  out.push({filename: controllerFilename, content:controller.code});
			// @formatter:on
		} catch (e) {
			console.error(e);
			console.error(e.message);
		}
	});

	const auditable = new Auditable(options.domain);
	const auditorAware = new AuditorAware(options.domain);
	const swagger = new Swagger(options.domain);
	const config = new Config(options.domain, options);
	const auditableFilename = join(entityDir, auditable.fileName);
	const auditorAwareFilename = join(configDir, auditorAware.fileName);
	const swaggerFilename = join(configDir, swagger.fileName);
	const configFilename = join(configDir, config.fileName);
	// @formatter:off
	if (options.auditable) out.push({filename:auditableFilename, content:auditable.code});
	if (options.auditable) out.push({filename:auditorAwareFilename, content:auditorAware.code});
	if (options.swagger)   out.push({filename:swaggerFilename, content:swagger.code});
	if (options.auditable) out.push({filename:configFilename, content:config.code});
	// @formatter:on
	return out;
}

export default run;