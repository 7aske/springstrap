import commander from "commander";
import * as fs from "fs";
import { join } from "path";
import Controller from "./controller";
import Entity from "./entity";
import { parseDDL, parseEnums } from "./parser";
import Repository from "./repository";
import Service from "./service";
import ServiceImpl from "./serviceimpl";
import Auditable from "./auditable";
import AuditorAware from "./auditoraware";
import Swagger from "./swagger";
import { Enum } from "./enum";
import Config from "./config";
import CriteriaParser from "./specification/CriteriaParser";
import GenericSpecification from "./specification/GenericSpecification";
import GenericSpecificationBuilder from "./specification/GenericSpecificationBuilder";
import GenericSpecificationConverter from "./specification/GenericSpecificationConverter";
import SearchCriteria from "./specification/SearchCriteria";
import SearchOperation from "./specification/SearchOperation";
import SortConverter from "./sort/SortConverter";
import SecurityConfig from "./security/SecurityConfig";
import { writeIfNotExists } from "./fs-utils";
import JwtProvider from "./security/JwtProvider";
import JwtAuthorizationFilter from "./security/JwtAuthorizationFilter";
import JwtAuthenticationFilter from "./security/JwtAuthenticationFilter";
import Application from "./application/Application";
import ServletInitializer from "./application/ServletInitializer";
import { generatePomXml } from "./application/pom";
import dependencyRegistrar from "./application/DependencyRegistrar";
import PropertiesFile from "./def/PropertiesFile";
import { response, snakeToCamel } from "./utils";
import ApplicationTests from "./application/ApplicationTests";

const PROG = "springstrap";

let filename = "";
const program = new commander.Command();

program
	.arguments("<ddl_file.sql>")
	.action(function (cmd: string) {
		filename = cmd;
	})
	.requiredOption("-d, --domain <domain>", "your app domain with name (eg. 'com.example.demo')", "")
	.option("-t, --type <mariadb|mysql>", "database type", "mariadb")
	.option("-o, --output <filepath>", "output root path")
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
	.option("-u, --security", "add Spring Security JWT implementation")
	.option("-p, --specification", "adds JPA specification api based controller endpoints")
	.option("-r, --sort", "adds sort to controller endpoints")
	.option("-e, --enums <enumfile>", "load enum definitions from a json file")
	.option("--ignore <ignore>", "ignore selected tables", "")
	.option("--tables <tables>", "generated only listed tables", "")
	.option("--pom", "generate pom.xml", false)
	.option("--deps <value...>", "dependencies (spring-security, mariadb...)")
	.option("--name <name>", "project name", "")
	.option("--java-version <javaVersion>", "java version", "11")
	.option("--packaging <packaging>", "packaging", "war")
	.option("--description <description>", "description", "Springstrap application")
	.parse(process.argv);

const opts = program.opts();

if (!fs.existsSync(filename)) {
	process.stderr.write(`${PROG}: no such file or directory: '${filename}'\n`);
	process.exit(2);
}

if (opts.enums && !fs.existsSync(opts.enums)) {
	process.stderr.write(`${PROG}: no such file or directory: '${filename}'\n`);
	process.exit(2);
}

try {
	new URL("http://" + opts.domain);
} catch (e) {
	process.stderr.write(`${PROG}: invalid domain: '${opts.domain}'\n`);
	opts.help();
}

// @formatter:off
const options: SpringStrapOptions = {
	auditable:     opts.auditable,
	controller:    opts.controller,
	domain:        opts.domain,
	entity:        opts.entity,
	enums:         opts.enums,
	ignore:        opts.ignore,
	lombok:        opts.lombok,
	output:        opts.output,
	overwrite:     opts.overwrite,
	repository:    opts.repository,
	service:       opts.service,
	serviceimpl:   opts.serviceimpl,
	security:      opts.security,
	swagger:       opts.swagger,
	tables:        opts.tables,
	type:          opts.type,
	specification: opts.specification,
	sort:          opts.sort,
};

if (opts.name) {
	options.domain += "." + snakeToCamel(opts.name);
}
const depsSet = new Set(opts.deps);

if (opts.lombok) {
	depsSet.add("lombok");
}

if (opts.swagger) {
	depsSet.add("swagger");
}

if (opts.security) {
	depsSet.add("spring-security");
	depsSet.add("java-jwt")
}

depsSet.add(opts.type);
depsSet.add("spring-boot");
depsSet.add("spring-data-jpa");

const domainLast = options.domain.split(".").splice(-1, 1)[0];
const pomXmlOptions: PomXmlOptions = {
	artifactId:    domainLast,
	groupId:       opts.domain,
	javaVersion:   opts.javaVersion,
	name:          domainLast,
	packaging:     opts.packaging,
	description:   opts.description,
	dependencies:  ([... depsSet] as string[])
						.map(dep => dependencyRegistrar[dep])
						.filter(dep => !!dep)
						.reduce((acc, val) => acc.concat(val), [])
}
// @formatter: on

if (opts.all) {
	options.entity = true;
	options.repository = true;
	options.service = true;
	options.serviceimpl = true;
	options.controller = true;
}


const rootDir = opts.output ? opts.output : process.cwd();
// @formatter:off
const domainDir =        join(rootDir, "src/main/java", ...options.domain.split("."));
const resourcesDir =     join(rootDir, "src/main/resources");
const domainTestsDir =   join(rootDir, "src/test/java", ...options.domain.split("."));
const entityDir =        join(domainDir, "entity");
const entityDomainDir =  join(domainDir, "entity/domain");
const serviceDir =       join(domainDir, "service");
const serviceImplDir =   join(domainDir, "service/impl");
const controllerDir =    join(domainDir, "controller");
const repositoryDir =    join(domainDir, "repository");
const specificationDir = join(domainDir, "specification");
const configDir =        join(domainDir, "config");
const securityDir =      join(domainDir, "security");
const beanDir =          join(domainDir, "bean");
const converterDir =     join(domainDir, "bean/converter");
// @formatter:on

process.stdout.write("root   " + rootDir + "\n");
process.stdout.write("domain " + options.domain + "\n");


const sql = fs.readFileSync(filename).toString();
const enums = options.enums ? parseEnums(options.enums) : [];
let jsonDDL = parseDDL(sql, opts.type);
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

try {
	const dirs = [domainDir, domainTestsDir, resourcesDir];
	// @formatter:off
	if (options.entity)        dirs.push(entityDir);
	if (options.repository)    dirs.push(repositoryDir);
	if (options.service)       dirs.push(serviceDir);
	if (options.serviceimpl)   dirs.push(serviceImplDir);
	if (options.controller)    dirs.push(controllerDir);
	if (options.specification) dirs.push(specificationDir)
	if (enums.length > 0)      dirs.push(entityDomainDir);
	if (options.auditable)     dirs.push(configDir);
	if (options.swagger)       dirs.push(configDir);
	if (options.sort)          dirs.push(converterDir);
	if (options.security)      dirs.push(securityDir);
	// @formatter:on
	dirs.forEach(dir => fs.mkdirSync(dir, {recursive: true}));
} catch (e) {
	process.stderr.write(e.message + "\n");
	process.exit(1);
}

jsonDDL.forEach(tableDef => {
	try {
		// TODO: possibly extract as a filter
		const isIgnored = (options.ignore as string).split(",").some(ignore => ignore === tableDef.name);
		if (isIgnored) return;
		if (Entity.isMtmTable(tableDef)) return;

		const manyToMany = relations.filter(rel => rel.source === tableDef.name);
		const entityEnums = enums.filter(e => e.tables.some(t => t === tableDef.name));

		const entity = new Entity(tableDef, options.domain, manyToMany, entityEnums, options);
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
		if ((!fs.existsSync(entityFilename)        || options.overwrite) && options.entity)      fs.writeFileSync(entityFilename, entity.code);
		if ((!fs.existsSync(repositoryFilename)    || options.overwrite) && options.repository)  fs.writeFileSync(repositoryFilename, repository.code);
		if ((!fs.existsSync(serviceFilename)       || options.overwrite) && options.service)     fs.writeFileSync(serviceFilename, service.code);
		if ((!fs.existsSync(serviceImplFilename)   || options.overwrite) && options.serviceimpl) fs.writeFileSync(serviceImplFilename, serviceImpl.code);
		if ((!fs.existsSync(controllerFilename)    || options.overwrite) && options.controller)  fs.writeFileSync(controllerFilename, controller.code);
		// @formatter:on
	} catch (e) {
		process.stderr.write(e + "\n");
		process.stderr.write(e.message + "\n");
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

// sort
const sortConverter = new SortConverter(options.domain, options);

const sortConverterFilename = join(converterDir, sortConverter.fileName);

// @formatter:off
if (!fs.existsSync(auditableFilename)    && options.auditable) fs.writeFileSync(auditableFilename, auditable.code);
if (!fs.existsSync(auditorAwareFilename) && options.auditable) fs.writeFileSync(auditorAwareFilename, auditorAware.code);
if (!fs.existsSync(swaggerFilename)      && options.swagger)   fs.writeFileSync(swaggerFilename, swagger.code);
if (!fs.existsSync(configFilename)       && options.auditable) fs.writeFileSync(configFilename, config.code);

// specification
if (options.specification) {
	const criteriaParser = new CriteriaParser(options.domain, options);
	const genericSpecification = new GenericSpecification(options.domain, options);
	const genericSpecificationBuilder = new GenericSpecificationBuilder(options.domain, options);
	const genericSpecificationConverter = new GenericSpecificationConverter(options.domain, options);
	const searchCriteria = new SearchCriteria(options.domain, options);
	const searchOperation = new SearchOperation(options.domain, options);

	const criteriaParserFilename = join(specificationDir, criteriaParser.fileName);
	const genericSpecificationFilename = join(specificationDir, genericSpecification.fileName);
	const genericSpecificationBuilderFilename = join(specificationDir, genericSpecificationBuilder.fileName);
	const genericSpecificationConverterFilename = join(specificationDir, genericSpecificationConverter.fileName);
	const searchCriteriaFilename = join(specificationDir, searchCriteria.fileName);
	const searchOperationFilename = join(specificationDir, searchOperation.fileName);

	writeIfNotExists(criteriaParserFilename, criteriaParser.code);
	writeIfNotExists(genericSpecificationFilename, genericSpecification.code);
	writeIfNotExists(genericSpecificationBuilderFilename, genericSpecificationBuilder.code);
	writeIfNotExists(genericSpecificationConverterFilename, genericSpecificationConverter.code);
	writeIfNotExists(searchCriteriaFilename, searchCriteria.code);
	writeIfNotExists(searchOperationFilename, searchOperation.code);
}

// security

if (options.security) {
	const securityConfig = new SecurityConfig(options.domain, options);
	const jwtProvider = new JwtProvider(options.domain, options);
	const jwtAuthorizationFilter = new JwtAuthorizationFilter(options.domain, options);
	const jwtAuthenticationFilter = new JwtAuthenticationFilter(options.domain, options);

	const securityConfigFilename = join(securityDir, securityConfig.fileName);
	const jwtProviderFilename = join(securityDir, jwtProvider.fileName);
	const jwtAuthorizationFilterFilename = join(securityDir, jwtAuthorizationFilter.fileName);
	const jwtAuthenticationFilterFilename = join(securityDir, jwtAuthenticationFilter.fileName);

	writeIfNotExists(securityConfigFilename, securityConfig.code);
	writeIfNotExists(jwtProviderFilename, jwtProvider.code);
	writeIfNotExists(jwtAuthorizationFilterFilename, jwtAuthorizationFilter.code);
	writeIfNotExists(jwtAuthenticationFilterFilename, jwtAuthenticationFilter.code);
}

if (options.sort) {
	writeIfNotExists(sortConverterFilename, sortConverter.code);
}

if (opts.pom) {
	const application = new Application(options.domain, options);
	const applicationTests = new ApplicationTests(options.domain, options);
	const servletInitializer = new ServletInitializer(options.domain, options, application.className);
	const pomXml = generatePomXml(pomXmlOptions);
	const applicationProperties = new PropertiesFile("application", options, pomXmlOptions);

	const applicationFilename = join(domainDir, application.fileName);
	const applicationTestsFilename = join(domainTestsDir, applicationTests.fileName);
	const servletInitializerFilename = join(domainDir, servletInitializer.fileName);
	const pomXmlFilename = join(rootDir, "pom.xml");
	const applicationPropertiesFilename = join(resourcesDir, applicationProperties.fileName)

	writeIfNotExists(applicationFilename, application.code);
	writeIfNotExists(applicationTestsFilename, applicationTests.code);
	writeIfNotExists(servletInitializerFilename, servletInitializer.code);
	writeIfNotExists(pomXmlFilename, pomXml);
	writeIfNotExists(applicationPropertiesFilename, applicationProperties.content);
}


// @formatter:on
enums.map(e => new Enum(options.domain, e, options)).forEach(e => {
	const enumFilename = join(entityDir, "domain", e.className + ".java");
	if ((!fs.existsSync(enumFilename) || options.overwrite) && options.entity) fs.writeFileSync(enumFilename, e.code);
});
