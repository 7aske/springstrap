import program from "commander";
import * as fs from "fs";
import { join } from "path";
import Controller from "./controller";
import Entity from "./entity";
import { parseDDL } from "./parser";
import Repository from "./repository";
import Service from "./service";
import ServiceImpl from "./serviceimpl";
import { isRelation, snakeToCamel } from "./utils";

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
	.option("--ignore <ignore>", "ignore selected tables", "")
	.option("--tables <tables>", "generated only listed tables", "")
	.parse(process.argv);

if (!fs.existsSync(filename)) {
	process.stderr.write(`${PROG}: no such file or directory: '${filename}'\n`);
	program.help();
}

try {
	new URL("http://" + program.domain);
} catch (e) {
	process.stderr.write(`${PROG}: invalid domain: '${program.domain}'\n`);
	program.help();
}


const rootDir = program.output ? join(program.output, "src/main/java") : join(process.cwd(), "src/main/java");
const domain = program.domain;
const entityDir = join(rootDir, ...domain.split("."), "entity");
const serviceDir = join(rootDir, ...domain.split("."), "service");
const serviceImplDir = join(rootDir, ...domain.split("."), "service/impl");
const controllerDir = join(rootDir, ...domain.split("."), "controller");
const repositoryDir = join(rootDir, ...domain.split("."), "repository");
// const configDir = join(rootDir, ...domain.split("."), "config");

process.stdout.write("root   " + rootDir + "\n");
process.stdout.write("domain " + domain + "\n");


try {
	[rootDir, repositoryDir, controllerDir, serviceDir, serviceImplDir, entityDir]
		.forEach(dir => fs.mkdirSync(dir, {recursive: true}));
} catch (e) {
	process.stderr.write(e.message + "\n");
	process.exit(1);
}

const options: SpringStrapOptions = {
	useLombok: program.lombok,
	extendAuditable: program.auditable,
};

if (program.all) {
	program.entity = true;
	program.repository = true;
	program.service = true;
	program.serviceimpl = true;
	program.controller = true;
}

const sql = fs.readFileSync(filename).toString();
let jsonDDL = parseDDL(sql, program.type);
let relations: DDLManyToMany[] =[];
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
		source_column: fk2.columns[0].column
	}
	const rel2: DDLManyToMany = {
		name: tableDef.name,
		target: fk2.reference.table,
		source: fk1.reference.table,
		target_column: fk2.columns[0].column,
		source_column: fk1.columns[0].column
	}
	relations.push(rel1, rel2);
});

if (program.tables) {
	jsonDDL = jsonDDL
		.filter(tableDef => (program.tables as string)
			.split(",")
			.some(param => param === tableDef.name));
}


jsonDDL.forEach(tableDef => {
	// TODO: possibly extract as a filter
	const isIgnored = (program.ignore as string).split(",").some(ignore => ignore === tableDef.name);
	if (isIgnored) return;
	if (isRelation(tableDef)) return;

	const manyToMany = relations.filter(rel => rel.source === tableDef.name);

	const entity = new Entity(tableDef, domain, manyToMany, options);
	const repository = new Repository(entity, domain);
	const service = new Service(entity, domain);
	const serviceImpl = new ServiceImpl(service, domain, options);
	const controller = new Controller(service, domain, options);

	const entityFilename = join(entityDir, entity.className + ".java");
	const repositoryFilename = join(repositoryDir, entity.className + "Repository.java");
	const serviceFilename = join(serviceDir, entity.className + "Service.java");
	const serviceImplFilename = join(serviceImplDir, entity.className + "ServiceImpl.java");
	const controllerFilename = join(controllerDir, entity.className + "Controller.java");
	// @formatter:off
	if ((!fs.existsSync(entityFilename)      || program.overwrite) &&      program.entity) fs.writeFileSync(entityFilename, entity.code);
	if ((!fs.existsSync(repositoryFilename)  || program.overwrite) &&  program.repository) fs.writeFileSync(repositoryFilename, repository.code);
	if ((!fs.existsSync(serviceFilename)     || program.overwrite) &&     program.service) fs.writeFileSync(serviceFilename, service.code);
	if ((!fs.existsSync(serviceImplFilename) || program.overwrite) && program.serviceimpl) fs.writeFileSync(serviceImplFilename, serviceImpl.code);
	if ((!fs.existsSync(controllerFilename)  || program.overwrite) &&  program.controller) fs.writeFileSync(controllerFilename, controller.code);
	// @formatter:on
});
