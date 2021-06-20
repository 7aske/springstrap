import Entity from "./entity";
import { uncapitalize } from "./utils";
import JavaClass from "./def/JavaClass";

export default class Repository extends JavaClass {
	private readonly _entity: Entity;
	private readonly _className: string;

	constructor(entity: Entity, options: SpringStrapOptions) {
		super(options.domain, "repository", options);
		this._className = entity.className + "Repository";
		this._entity = entity;
		super.imports = [
			"org.springframework.data.jpa.repository.*",
			"org.springframework.stereotype.Repository",
			`${options.domain ? options.domain + "." : ""}entity.${entity.className}`,
		];
		super.annotations = [
			"Repository",
		];
		super.superClasses = [
			`JpaRepository<${entity.className}, ${entity.columns.find(c => c.primaryKey)!.javaType}>`,
		];
		super.type = "interface";

		if (this.options.security && this.className === "UserRepository") {
			super.imports.push(
				"java.util.Optional",
			);
		}


		if (options.specification) {
			super.superClasses.push(`JpaSpecificationExecutor<${entity.className}>`);
		}

	}

	public get className(): string {
		return this._className;
	}

	public get varName(): string {
		return uncapitalize(this._className);
	}

	public get code(): string {
		let code = "";
		if (this.options.security && this.className === "UserRepository") {
			code += "\tOptional<User> findByUsername(String username);\n";
		}
		return this.wrap(code);
	}

	get entity(): Entity {
		return this._entity;
	}
}


module.exports = Repository;
