const fs = require("fs");
const {join, dirname} = require("path");
const program = require("commander");
const {parseDDL} = require("./parser");
const Entity = require("./entity");
const Service = require("./service");
const ServiceImpl = require("./serviceimpl");
const Repository = require("./repository");
const controllerTemplate = require("./controller");
const {defaultConfig} = require("./config");
let filename = "";
program
	.arguments("<ddl_file.sql>")
	.action(function (cmd) {
		filename = cmd;
	})
	.option("-t, --type <mariadb|mysql>", "database type")
	.option("-o, --output <filepath>", "output root path")
	.option("-d, --domain <domain>", "your app domain (eg. 'com.example.com')")
	.option("-w, --overwrite", "overwrite default config file");
program.parse(process.argv);

if (!fs.existsSync(filename)) {
	console.error(`ENOENT: no such file or directory, open '${filename}'`);
	process.exit(1);
}

if (!program.domain) {
	console.error("EINVAL: must specify a domain");
	process.exit(1);
}

try {
	new URL("http://" + program.domain);
} catch (e) {
	program.outputHelp();
	console.error(`EINVAL: invalid domain '${program.domain}'`);
	process.exit(1);
}


const rootDir = program.output ? join(program.output, "src/main/java") : join(process.cwd(), "src/main/java");
const domain = program.domain;
const entityDir = join(rootDir, ...domain.split("."), "entity");
const serviceDir = join(rootDir, ...domain.split("."), "service");
const serviceImplDir = join(rootDir, ...domain.split("."), "service/impl");
const controllerDir = join(rootDir, ...domain.split("."), "controller");
const repositoryDir = join(rootDir, ...domain.split("."), "repository");
const configDir = join(rootDir, ...domain.split("."), "config");

console.log("root  ", rootDir);
console.log("domain", domain);

const sql = fs.readFileSync(filename).toString();
const jsonDDL = parseDDL(sql, program.type);

try {
	fs.mkdirSync(rootDir, {recursive: true});
	fs.mkdirSync(repositoryDir, {recursive: true});
	fs.mkdirSync(controllerDir, {recursive: true});
	fs.mkdirSync(serviceDir, {recursive: true});
	fs.mkdirSync(serviceImplDir, {recursive: true});
	fs.mkdirSync(entityDir, {recursive: true});
	fs.mkdirSync(configDir, {recursive: true});
} catch (e) {
	console.error(e.message);
	process.exit(1);
}


jsonDDL.forEach(ent => {
	const entity = new Entity(ent, domain);
	const repository = new Repository(ent.name, domain);
	const service = new Service(ent.name, domain);
	const serviceImpl = new ServiceImpl(ent.name, domain);
	fs.writeFileSync(join(entityDir, entity.className + ".java"), entity.toString());
	fs.writeFileSync(join(repositoryDir, repository.className + "Repository.java"), repository.toString());
	fs.writeFileSync(join(serviceDir, service.className + "Service.java"), service.toString());
	fs.writeFileSync(join(serviceImplDir, serviceImpl.className + "ServiceImpl.java"), serviceImpl.toString());
	fs.writeFileSync(join(controllerDir, entity.className + "Controller.java"), controllerTemplate(domain, entity));
});
if (fs.existsSync(join(configDir, "Config.java")) && program.overwrite) {
	console.log("Overwriting config file");
	fs.writeFileSync(join(configDir, "Config.java"), defaultConfig(domain));
} else if (!fs.existsSync(join(configDir, "Config.java"))) {
	fs.writeFileSync(join(configDir, "Config.java"), defaultConfig(domain));
}
