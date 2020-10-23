import Entity from "./entity";
import { formatImports } from "./utils";

export default class Repository {
	private readonly _entity: Entity;
	private readonly _domain: string;

	constructor(entity: Entity, domain: string) {
		this._domain = domain;
		this._entity = entity;
	}

	public get code(): string {
		const imports = [
			"org.springframework.data.jpa.repository.JpaRepository",
			"org.springframework.stereotype.Repository",
			`${this._domain}.entity.${this._entity.className}`,
		];

		let out = "";
		out += `${this.packageName}\n\n`;
		out += formatImports(imports);
		out += "@Repository\n";
		out += `public interface ${this._entity.className}Repository extends JpaRepository<${this._entity.className}, ${this.entityPrimaryKeyType}> {}\n`;
		return out;
	}

	private get entityPrimaryKeyType(): string {
		return this._entity.columns.find(c => c.primaryKey)!.javaType;
	}

	public get packageName(): string {
		if (!this._domain) return "package repository;";
		return `package ${this._domain}.repository;`;
	}

	get entity(): Entity {
		return this._entity;
	}

	get domain(): string {
		return this._domain;
	}
}


module.exports = Repository;
