export default class Field {
	private readonly _accessor: AccessorType;
	private readonly _name: string;
	private readonly _type: string;
	private _annotations: string[];
	constructor(name: string, type: string, accessor:AccessorType = "private") {
		this._name = name;
		this._type = type;
		this._accessor = accessor;
		this._annotations = [];
	}
}
