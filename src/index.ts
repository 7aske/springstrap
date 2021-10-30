import commander from "commander";
import * as fs from "fs";
import { snakeToCamel } from "./utils";
import springstrap from "./springstrap";
import path from "path";

export const parseEnums = (filepath: string): EnumType[] =>{
	try {
		return JSON.parse(fs.readFileSync(filepath).toString()).enums;
	} catch (e) {
		console.error(e.message);
		return [];
	}
}

const PROG = "springstrap";

const program = new commander.Command();

program
	.requiredOption("-f, --filename <filename>", "ddl file")
	.requiredOption("-d, --domain <domain>", "your app domain with name (eg. 'com.example.demo')")
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
	.option("--ignore <ignore...>", "ignore selected tables")
	.option("--tables <tables...>", "generated only listed tables")
	.option("--pom", "generate pom.xml", false)
	.option("--deps <value...>", "dependencies (spring-security, mariadb...)")
	.option("--name <name>", "project name", "")
	.option("--java-version <javaVersion>", "java version", "11")
	.option("--packaging <packaging>", "packaging", "war")
	.option("--description <description>", "description", "Springstrap application")
	.option("--no-boilerplate", "skip generating boilerplate class", true)
	.parse(process.argv);

const opts = program.opts();

if (!fs.existsSync(opts.filename)) {
	process.stderr.write(`${PROG}: no such file or directory: '${opts.filename}'\n`);
	process.exit(2);
}

if (opts.enums && !fs.existsSync(opts.enums)) {
	process.stderr.write(`${PROG}: no such file or directory: '${opts.filename}'\n`);
	process.exit(2);
}


// @formatter:off
const options: SpringStrapOptions = {
	auditable:     opts.auditable,
	controller:    opts.controller,
	domain:        opts.domain,
	entity:        opts.entity,
	enums:         parseEnums(opts.enums),
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
	pom:           opts.pom,
	filename:      opts.filename,
	noBoilerplate: !opts.boilerplate,
};

if (opts.all) {
	options.entity = true;
	options.repository = true;
	options.service = true;
	options.serviceimpl = true;
	options.controller = true;
}

if (options.pom && opts.name) {
	options.domain += "." + snakeToCamel(opts.name);
}

const domainLast = options.domain.split(".").splice(-1, 1)[0];

const pomXmlOptions: PomXmlOptions = {
	artifactId:    domainLast,
	groupId:       options.domain.replace("." + domainLast, ""),
	javaVersion:   opts.javaVersion,
	name:          domainLast,
	packaging:     opts.packaging,
	description:   opts.description,
	deps:          opts.deps,
}

const sql = fs.readFileSync(options.filename).toString();

const files = springstrap(sql, options, pomXmlOptions);

files.forEach(file => {
	const dirname = path.dirname(file.filePath);
	if (!fs.existsSync(dirname))
		fs.mkdirSync(dirname, {recursive: true});
	if (!fs.existsSync(file.filePath) || options.overwrite)
		fs.writeFileSync(file.filePath, file.content);
})



