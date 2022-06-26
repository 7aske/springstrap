import Entity from "./entity";
import {uncapitalize} from "./utils";
import JavaClass from "./def/JavaClass";

export default class Repository extends JavaClass {
	private readonly _entity: Entity;
	private readonly _className: string;

	constructor(entity: Entity, options: SpringStrapOptions) {
		super(options.domain, "repository", options);
		this._className = entity.className + "Repository";
		this._entity = entity;
		if (options.base) {
			super.imports = [
				`${options.domain ? options.domain + "." : ""}generic.*`,
				`${options.domain ? options.domain + "." : ""}entity.${entity.className}`
			];
			super.superClasses = [
				`BaseRepository<${entity.className}>`
			];
		} else {
			super.imports = [
				"org.springframework.data.jpa.repository.*",
				"org.springframework.stereotype.Repository",
				`${options.domain ? options.domain + "." : ""}entity.${entity.className}`
			];
			super.superClasses = [
				`JpaRepository<${entity.className}, ${entity.id.length === 1 ? entity.id[0].javaType : `${entity.className}.${entity.embeddedId.className}`}>`,
			];

			if (options.specification) {
				super.superClasses.push(`JpaSpecificationExecutor<${entity.className}>`);
			}
		}
		super.type = "interface";

		if (this.options.security && this.className === "UserRepository") {
			super.imports.push(
				"java.util.Optional",
			);
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
