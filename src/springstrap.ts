import Application from "./application/Application";
import ApplicationTests from "./application/ApplicationTests";
import Auditable from "./auditable";
import AuditorAware from "./auditoraware";
import Config from "./config";
import Controller from "./controller";
import CriteriaParser from "./specification/CriteriaParser";
import Entity from "./entity";
import GenericSpecification from "./specification/GenericSpecification";
import GenericSpecificationBuilder from "./specification/GenericSpecificationBuilder";
import GenericSpecificationConverter from "./specification/GenericSpecificationConverter";
import JwtAuthenticationFilter from "./security/JwtAuthenticationFilter";
import JwtAuthorizationFilter from "./security/JwtAuthorizationFilter";
import JwtProvider from "./security/JwtProvider";
import PropertiesFile from "./def/PropertiesFile";
import Repository from "./repository";
import SearchCriteria from "./specification/SearchCriteria";
import SearchOperation from "./specification/SearchOperation";
import SecurityConfig from "./security/SecurityConfig";
import Service from "./service";
import ServiceImpl from "./serviceimpl";
import ServletInitializer from "./application/ServletInitializer";
import SortConverter from "./sort/SortConverter";
import Swagger from "./swagger";
import dependencyRegistrar from "./application/DependencyRegistrar";
import { Enum } from "./enum";
import { generatePomXml } from "./application/pom";
import { join } from "path";
import { parseDDL } from "./parser";
import { snakeToCamel } from "./utils";

const springstrap = (sql: string, options: SpringStrapOptions, pomXmlOptions: PomXmlOptions): GeneratedFile[] => {
	const out: GeneratedFile[] = [];
	try {
		new URL("http://" + options.domain);
	} catch (e) {
		throw new Error(`springstrap: invalid domain: '${options.domain}'\n`);
	}

	if (pomXmlOptions.name) {
		options.domain += "." + snakeToCamel(pomXmlOptions.name);
	}


	const DEFAULT_DEPS = [options.type, "spring-boot", "spring-data-jpa"];
	const depsSet = new Set([...(pomXmlOptions.deps ?? []), ...DEFAULT_DEPS]);

	if (options.lombok) {
		depsSet.add("lombok");
	}

	if (options.swagger) {
		depsSet.add("swagger");
	}

	if (options.security) {
		depsSet.add("spring-security");
		depsSet.add("java-jwt");
	}

	pomXmlOptions.dependencies = ([...depsSet] as string[])
		.map(dep => dependencyRegistrar[dep])
		.filter(dep => !!dep)
		.reduce((acc, val) => acc.concat(val), []);


	const rootDir = options.output ? options.output : process.cwd();
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

	console.log("root   " + rootDir);
	console.log("domain " + options.domain);

	const enums = options.enums ?? [];
	let jsonDDL = parseDDL(sql, options.type!);
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
			.filter(tableDef => (options.tables ?? [])
				.some(param => param === tableDef.name));
	}

	const isNotIgnoredOrMtmTable = (tableDef: DDLTable) => {
		return !(options.ignore ?? []).some(ignore => ignore === tableDef.name) && !Entity.isMtmTable(tableDef);
	};

	jsonDDL.filter(isNotIgnoredOrMtmTable).forEach(tableDef => {
		try {
			// @formatter:off
			const manyToMany = relations.filter(rel => rel.source === tableDef.name);
			const entityEnums = enums.filter(e => e.tables.some(t => t === tableDef.name));

			const entity =      new Entity(tableDef, options.domain, manyToMany, entityEnums, options);
			const repository =  new Repository(entity, options);
			const service =     new Service(entity, options);
			const serviceImpl = new ServiceImpl(service, repository, options.domain, options);
			const controller =  new Controller(service, options.domain, options);

			const entityFilename =      join(entityDir, entity.fileName);
			const repositoryFilename =  join(repositoryDir, repository.fileName);
			const serviceFilename =     join(serviceDir, service.fileName);
			const serviceImplFilename = join(serviceImplDir, serviceImpl.fileName);
			const controllerFilename =  join(controllerDir, controller.fileName);

			if (options.entity)      out.push({filePath: entityFilename,      content: entity.code});
			if (options.repository)  out.push({filePath: repositoryFilename,  content: repository.code});
			if (options.service)     out.push({filePath: serviceFilename,     content: service.code});
			if (options.serviceimpl) out.push({filePath: serviceImplFilename, content: serviceImpl.code});
			if (options.controller)  out.push({filePath: controllerFilename,  content: controller.code});
			// @formatter:on
		} catch (e) {
			console.error(`springstrap: unable to generate '${tableDef.name}': ${e.message}`);
		}
	});

	// @formatter:off
	if (options.auditable) {
		const auditable =    new Auditable(options.domain);
		const auditorAware = new AuditorAware(options.domain);
		const config =       new Config(options.domain, options);

		const auditableFilename =    join(entityDir, auditable.fileName);
		const auditorAwareFilename = join(configDir, auditorAware.fileName);
		const configFilename =       join(configDir, config.fileName);

		out.push({filePath: auditableFilename,    content: auditable.code});
		out.push({filePath: auditorAwareFilename, content: auditorAware.code});
		out.push({filePath: configFilename,       content: config.code});
	}

	if (options.swagger) {
		const swagger = new Swagger(options.domain);

		const swaggerFilename = join(configDir, swagger.fileName);

		out.push({filePath: swaggerFilename, content: swagger.code});
	}

	// specification
	if (options.specification) {
		const criteriaParser =                new CriteriaParser(options.domain, options);
		const genericSpecification =          new GenericSpecification(options.domain, options);
		const genericSpecificationBuilder =   new GenericSpecificationBuilder(options.domain, options);
		const genericSpecificationConverter = new GenericSpecificationConverter(options.domain, options);
		const searchCriteria =                new SearchCriteria(options.domain, options);
		const searchOperation =               new SearchOperation(options.domain, options);

		const criteriaParserFilename =                join(specificationDir, criteriaParser.fileName);
		const genericSpecificationFilename =          join(specificationDir, genericSpecification.fileName);
		const genericSpecificationBuilderFilename =   join(specificationDir, genericSpecificationBuilder.fileName);
		const genericSpecificationConverterFilename = join(specificationDir, genericSpecificationConverter.fileName);
		const searchCriteriaFilename =                join(specificationDir, searchCriteria.fileName);
		const searchOperationFilename =               join(specificationDir, searchOperation.fileName);

		out.push({filePath: criteriaParserFilename,                content: criteriaParser.code});
		out.push({filePath: genericSpecificationFilename,          content: genericSpecification.code});
		out.push({filePath: genericSpecificationBuilderFilename,   content: genericSpecificationBuilder.code});
		out.push({filePath: genericSpecificationConverterFilename, content: genericSpecificationConverter.code});
		out.push({filePath: searchCriteriaFilename,                content: searchCriteria.code});
		out.push({filePath: searchOperationFilename,               content: searchOperation.code});
	}

	// security
	if (options.security) {
		const securityConfig =          new SecurityConfig(options.domain, options);
		const jwtProvider =             new JwtProvider(options.domain, options);
		const jwtAuthorizationFilter =  new JwtAuthorizationFilter(options.domain, options);
		const jwtAuthenticationFilter = new JwtAuthenticationFilter(options.domain, options);

		const securityConfigFilename =          join(securityDir, securityConfig.fileName);
		const jwtProviderFilename =             join(securityDir, jwtProvider.fileName);
		const jwtAuthorizationFilterFilename =  join(securityDir, jwtAuthorizationFilter.fileName);
		const jwtAuthenticationFilterFilename = join(securityDir, jwtAuthenticationFilter.fileName);

		out.push({filePath: securityConfigFilename,          content: securityConfig.code});
		out.push({filePath: jwtProviderFilename,             content: jwtProvider.code});
		out.push({filePath: jwtAuthorizationFilterFilename,  content: jwtAuthorizationFilter.code});
		out.push({filePath: jwtAuthenticationFilterFilename, content: jwtAuthenticationFilter.code});
	}

	// sort
	if (options.sort) {
		const sortConverter = new SortConverter(options.domain, options);

		const sortConverterFilename = join(converterDir, sortConverter.fileName);

		out.push({filePath: sortConverterFilename, content: sortConverter.code});
	}

	// pom
	if (options.pom) {
		const application =           new Application(options.domain, options);
		const applicationTests =      new ApplicationTests(options.domain, options);
		const servletInitializer =    new ServletInitializer(options.domain, options, application.className);
		const applicationProperties = new PropertiesFile("application", options, pomXmlOptions);
		const pomXml =                generatePomXml(pomXmlOptions);

		const applicationFilename =           join(domainDir, application.fileName);
		const applicationTestsFilename =      join(domainTestsDir, applicationTests.fileName);
		const servletInitializerFilename =    join(domainDir, servletInitializer.fileName);
		const applicationPropertiesFilename = join(resourcesDir, applicationProperties.fileName)
		const pomXmlFilename =                join(rootDir, "pom.xml");

		out.push({filePath: applicationFilename,           content: application.code});
		out.push({filePath: applicationTestsFilename,      content: applicationTests.code});
		out.push({filePath: servletInitializerFilename,    content: servletInitializer.code});
		out.push({filePath: pomXmlFilename,                content: pomXml});
		out.push({filePath: applicationPropertiesFilename, content: applicationProperties.content});
	}
	// @formatter:on

	if (options.enums) {
		enums.map(e => new Enum(options.domain, e, options)).forEach(e => {
			const enumFilename = join(entityDomainDir, e.fileName);
			out.push({filePath: enumFilename, content: e.code});
		});
	}

	return out;
}

export default springstrap;
