import program from "commander";
import * as fs from "fs";
import { join } from "path";
import Controller from "./controller";
import Entity from "./entity";
import { parseDDL, parseEums } from "./parser";
import Repository from "./repository";
import Service from "./service";
import ServiceImpl from "./serviceimpl";
import { isRelation } from "./utils";
import Auditable from "./auditable";
import AuditorAware from "./auditoraware";
import Swagger from "./swagger";
import { Enum } from "./enum";
import Config from "./config";

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
	.option("-a, --auditable", "entities extend 'Auditable'")
	.option("-s, --swagger", "add basic Swagger config class")
	.option("-e, --enums <enumfile>", "load enum definitions from a json file")
	.option("--ignore <ignore>", "ignore selected tables", "")
	.option("--tables <tables>", "generated only listed tables", "")
	.parse(process.argv);

if (!fs.existsSync(filename)) {
	process.stderr.write(`${PROG}: no such file or directory: '${filename}'\n`);
	process.exit(2);
}

if (program.enums && !fs.existsSync(program.enums)) {
	process.stderr.write(`${PROG}: no such file or directory: '${filename}'\n`);
	process.exit(2);
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
	auditable: program.auditable,
	controller: program.controller,
	domain: program.domain || "",
	entity: program.entity,
	enums: program.enums,
	ignore: program.ignore,
	lombok: program.lombok,
	output: program.output,
	overwrite: program.overwrite,
	repository: program.repository,
	service: program.service,
	serviceimpl: program.serviceimpl,
	swagger: program.swagger,
	tables: program.tables,
	type: program.type,
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
const entityDomainDir = join(rootDir, ...options.domain.split("."), "entity/domain");
const serviceDir = join(rootDir, ...options.domain.split("."), "service");
const serviceImplDir = join(rootDir, ...options.domain.split("."), "service/impl");
const controllerDir = join(rootDir, ...options.domain.split("."), "controller");
const repositoryDir = join(rootDir, ...options.domain.split("."), "repository");
const configDir = join(rootDir, ...options.domain.split("."), "config");

process.stdout.write("root   " + rootDir + "\n");
process.stdout.write("domain " + options.domain + "\n");


const sql = fs.readFileSync(filename).toString();
const enums = options.enums ? parseEums(options.enums) : [];
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

try {
	const dirs = [rootDir];
	if (options.entity) dirs.push(entityDir);
	if (options.repository) dirs.push(repositoryDir);
	if (options.service) dirs.push(serviceDir);
	if (options.serviceimpl) dirs.push(serviceImplDir);
	if (options.controller) dirs.push(controllerDir);
	if (enums.length > 0) dirs.push(entityDomainDir);
	if (options.auditable || options.swagger) dirs.push(configDir);
	dirs.forEach(dir => fs.mkdirSync(dir, {recursive: true}));
} catch (e) {
	process.stderr.write(e.message + "\n");
	process.exit(1);
}

jsonDDL.forEach(tableDef => {
	// TODO: possibly extract as a filter
	const isIgnored = (options.ignore as string).split(",").some(ignore => ignore === tableDef.name);
	if (isIgnored) return;
	if (isRelation(tableDef)) return;

	const manyToMany = relations.filter(rel => rel.source === tableDef.name);
	const entityEnums = enums .filter(e => e.tables.some(t => t === tableDef.name))

	const entity = new Entity(tableDef, options.domain, manyToMany, entityEnums, options);
	const repository = new Repository(entity, options.domain);
	const service = new Service(entity, options.domain);
	const serviceImpl = new ServiceImpl(service, repository, options.domain, options);
	const controller = new Controller(service, options.domain, options);

	const entityFilename = join(entityDir, entity.fileName);
	const repositoryFilename = join(repositoryDir, repository.fileName);
	const serviceFilename = join(serviceDir, service.fileName);
	const serviceImplFilename = join(serviceImplDir, serviceImpl.fileName);
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
const config = new Config(options.domain, options);
const auditableFilename = join(entityDir, auditable.fileName);
const auditorAwareFilename = join(configDir, auditorAware.fileName);
const swaggerFilename = join(configDir, swagger.fileName);
const configFilename = join(configDir, config.fileName);
// @formatter:off
if ((!fs.existsSync(auditableFilename)    || options.overwrite) && options.auditable) fs.writeFileSync(auditableFilename, auditable.code);
if ((!fs.existsSync(auditorAwareFilename) || options.overwrite) && options.auditable) fs.writeFileSync(auditorAwareFilename, auditorAware.code);
if ((!fs.existsSync(swaggerFilename)      || options.overwrite) && options.swagger)   fs.writeFileSync(swaggerFilename, swagger.code);
if ((!fs.existsSync(configFilename)       || options.overwrite) && options.auditable) fs.writeFileSync(configFilename, config.code);
// @formatter:on
enums.map(e => new Enum(options.domain, e, options)).forEach(e => {
	const enumFilename = join(entityDir, "domain", e.className + ".java");
	if ((!fs.existsSync(enumFilename) || options.overwrite) && options.entity) fs.writeFileSync(enumFilename, e.code);
});
