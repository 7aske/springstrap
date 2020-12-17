import { snakeToCamel, plural } from "./utils";

export default class MTMColumn {
	private readonly _inverseJoinName: string;
	private readonly _joinName: string;
	private readonly _reference: string;
	private readonly _name: string;
	private readonly _className: string;
	private readonly _target: string;
	private readonly _targetClassName: string;
	private readonly _targetVarName: string;
	private readonly _collectionType = "List";

	constructor(ref: DDLManyToMany) {
		this._inverseJoinName = ref.target_column;
		this._joinName = ref.source_column;
		this._targetClassName = snakeToCamel(ref.target, true);
		this._targetVarName = plural(snakeToCamel(ref.target));
		this._target = ref.target;
		this._className = snakeToCamel(ref.source, true);
		this._name = ref.source;
		this._reference = ref.name;
	}


	public get code(): string {
		let out = `@ManyToMany\n`;
		out += `@JsonIgnore\n`;
		out += `@JoinTable(name = "${this._reference}", joinColumns = @JoinColumn(name = "${this._joinName}"), inverseJoinColumns = @JoinColumn(name = "${this._inverseJoinName}"))\n`;
		out += `private ${this._collectionType}<${this._targetClassName}> ${this._targetVarName};\n`;
		return out;
	}


	get inverseJoinName(): string {
		return this._inverseJoinName;
	}

	get joinName(): string {
		return this._joinName;
	}

	get reference(): string {
		return this._reference;
	}

	get name(): string {
		return this._name;
	}

	get className(): string {
		return this._className;
	}

	get targetClassName(): string {
		return this._targetClassName;
	}

	get targetVarName(): string {
		return this._targetVarName;
	}

	get collectionType(): string {
		return this._collectionType;
	}

	get target(): string {
		return this._target;
	}
}
