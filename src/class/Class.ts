import AbstractClass from "./AbstractClass";

export default class Class extends AbstractClass {

	constructor(pkg: string, name: string, accessor: AccessorType, type: ClassType) {
		super(pkg, name, accessor, type);
	}

	public code(): string {
		return "";
	}
}
