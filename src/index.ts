import program from "commander";
import * as fs from "fs";
import { join } from "path";
import Controller from "./controller";
import Entity from "./entity";
import { parseDDL } from "./parser";
import Repository from "./repository";
import Service from "./service";
import ServiceImpl from "./serviceimpl";
import { isRelation } from "./utils";
import Auditable from "./auditable";
import AuditorAware from "./auditoraware";
import Swagger from "./swagger";

const PROG = "springstrap";

let filename = "";
program
	.arguments("<ddl_file.sql>")
	.action(function (cmd: string) {
		console.log(cmd);
		filename = cmd;
	})
	.option("-t, --type <mariadb|mysql>", "database type")
	.option("-o, --output <filepath>", "output root path")
	.option("-d, --domain <domain>", "your app domain (eg. 'com.example.com')", "")
	.option("-w, --overwrite", "overwrite existing files")
	.option("-E, --entity", "generate entities")
	.option("-S, --service", "generate services")
	.option("-I, --serviceimpl", "generate service implementations")
	.option("-C, --controller", "generate controllers")
	.option("-R, --repository", "generate repositories")
	.option("-A, --all", "generate all (combines E,S,I,C,R flags)")
	.option("-l, --lombok", "use lombok")
	.option("-a, --auditable", "entities extend 'Auditable' (not provided)")
	.option("-s, --swagger", "add basic Swagger config class")
	.option("--ignore <ignore>", "ignore selected tables", "")
	.option("--tables <tables>", "generated only listed tables", "")
	.parse(process.argv);

if (!fs.existsSync(filename)) {
	process.stderr.write(`${PROG}: no such file or directory: '${filename}'\n`);
	program.help();
}

if (program.domain) {
	try {
		new URL("http://" + program.domain);
	} catch (e) {
		process.stderr.write(`${PROG}: invalid domain: '${program.domain}'\n`);
		program.help();
	}
}

const options: SpringStrapOptions = {
	controller: program.controller,
	domain: program.domain || "",
	entity: program.entity,
	ignore: program.ignore,
	output: program.output,
	overwrite: program.overwrite,
	repository: program.repository,
	service: program.service,
	serviceimpl: program.serviceimpl,
	tables: program.tables,
	type: program.type,
	lombok: program.lombok,
	auditable: program.auditable,
	swagger: program.swagger,
};

if (program.all) {
	options.entity = true;
	options.repository = true;
	options.service = true;
	options.serviceimpl = true;
	options.controller = true;
}


const rootDir = program.output ? join(program.output, "src/main/java") : join(process.cwd(), "src/main/java");
const entityDir = join(rootDir, ...options.domain.split("."), "entity");
const serviceDir = join(rootDir, ...options.domain.split("."), "service");
const serviceImplDir = join(rootDir, ...options.domain.split("."), "service/impl");
const controllerDir = join(rootDir, ...options.domain.split("."), "controller");
const repositoryDir = join(rootDir, ...options.domain.split("."), "repository");
const configDir = join(rootDir, ...options.domain.split("."), "config");

process.stdout.write("root   " + rootDir + "\n");
process.stdout.write("domain " + options.domain + "\n");


try {
	[rootDir, repositoryDir, controllerDir, serviceDir, serviceImplDir, entityDir]
		.forEach(dir => fs.mkdirSync(dir, {recursive: true}));
} catch (e) {
	process.stderr.write(e.message + "\n");
	process.exit(1);
}


const sql = fs.readFileSync(filename).toString();
let jsonDDL = parseDDL(sql, program.type);
let relations: DDLManyToMany[] = [];
jsonDDL.forEach(tableDef => {
	if (!isRelation(tableDef)) return;
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


jsonDDL.forEach(tableDef => {
	// TODO: possibly extract as a filter
	const isIgnored = (options.ignore as string).split(",").some(ignore => ignore === tableDef.name);
	if (isIgnored) return;
	if (isRelation(tableDef)) return;

	const manyToMany = relations.filter(rel => rel.source === tableDef.name);

	const entity = new Entity(tableDef, options.domain, manyToMany, options);
	const repository = new Repository(entity, options.domain);
	const service = new Service(entity, options.domain);
	const serviceImpl = new ServiceImpl(service, options.domain, options);
	const controller = new Controller(service, options.domain, options);

	const entityFilename = join(entityDir, entity.className + ".java");
	const repositoryFilename = join(repositoryDir, entity.className + "Repository.java");
	const serviceFilename = join(serviceDir, entity.className + "Service.java");
	const serviceImplFilename = join(serviceImplDir, entity.className + "ServiceImpl.java");
	const controllerFilename = join(controllerDir, entity.className + "Controller.java");
	// @formatter:off
	if ((!fs.existsSync(entityFilename)        || options.overwrite) && options.entity)      fs.writeFileSync(entityFilename, entity.code);
	if ((!fs.existsSync(repositoryFilename)    || options.overwrite) && options.repository)  fs.writeFileSync(repositoryFilename, repository.code);
	if ((!fs.existsSync(serviceFilename)       || options.overwrite) && options.service)     fs.writeFileSync(serviceFilename, service.code);
	if ((!fs.existsSync(serviceImplFilename)   || options.overwrite) && options.serviceimpl) fs.writeFileSync(serviceImplFilename, serviceImpl.code);
	if ((!fs.existsSync(controllerFilename)    || options.overwrite) && options.controller)  fs.writeFileSync(controllerFilename, controller.code);
	// @formatter:on
});

const auditable = new Auditable(options.domain);
const auditorAware = new AuditorAware(options.domain);
const swagger = new Swagger(options.domain);
const auditableFilename = join(entityDir, "Auditable.java");
const auditorAwareFilename = join(configDir, "CustomAuditorAware.java");
const swaggerFilename = join(configDir, "SwaggerConfig.java");
// @formatter:off
if ((!fs.existsSync(auditableFilename)    || options.overwrite) && options.auditable) fs.writeFileSync(auditableFilename, auditable.code);
if ((!fs.existsSync(auditorAwareFilename) || options.overwrite) && options.auditable) fs.writeFileSync(auditorAwareFilename, auditorAware.code);
if ((!fs.existsSync(swaggerFilename)      || options.overwrite) && options.swagger)   fs.writeFileSync(swaggerFilename, swagger.code);
// @formatter:on
