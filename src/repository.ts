import Entity from "./entity";
import { uncapitalize } from "./utils";
import JavaClass from "./def/JavaClass";

export default class Repository extends JavaClass {
	private readonly _entity: Entity;
	private readonly _className: string;

	constructor(entity: Entity, options: SpringStrapOptions = {domain: ""}) {
		super(options.domain, "repository");
		super.imports = [
			"org.springframework.data.jpa.repository.*",
			"org.springframework.stereotype.Repository",
			`${options.domain ? options.domain + "." : ""}entity.${entity.className}`,
		];
		super.annotations = [
			"Repository",
		];
		super.superClasses = [
			`JpaRepository<${entity.className}, ${entity.columns.find(c => c.primaryKey)!.javaType}>`
		]
		super.type = "interface";
		super.lombok = true;

		if (options.specification) {
			super.superClasses.push(`JpaSpecificationExecutor<${entity.className}>`)
		}

		this._entity = entity;
		this._className = entity.className + "Repository";
	}

	public get className(): string {
		return this._className;
	}

	public get varName(): string {
		return uncapitalize(this._className);
	}

	public get code(): string {
		return this.wrap();
	}

	get entity(): Entity {
		return this._entity;
	}
}
