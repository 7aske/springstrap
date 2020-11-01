import Field from "./Field";
import AbstractClass from "./AbstractClass";
import Class from "./Class";

export default class ClassBuilder {
	private package: string;
	private name: string;
	private type: ClassType = "class";
	private accessor: AccessorType = "public";
	private static: boolean = false;
	private annotations: string[] = [];
	private fields: Field[] = [];
	private imports: string[] = [];
	private interfaces: string[] = [];
	private superClasses: string[] = [];

	constructor(pkg: string, name: string) {
		this.package = pkg;
		this.name = name;
	}

	public import(...imp: string[]): ClassBuilder {
		this.imports.push(...imp);
		return this;
	}

	public interface(...iface: string[]): ClassBuilder {
		this.interfaces.push(...iface);
		return this;
	}

	public superClass(...clazz: string[]): ClassBuilder {
		this.superClasses.push(...clazz);
		return this;
	}

	public annotation(...anno: string[]): ClassBuilder {
		this.annotations.push(...anno);
		return this;
	}

	public build(): AbstractClass {
		const clazz = new Class(this.package, this.name, this.accessor, this.type);
		clazz.annotations = this.annotations;
		clazz.imports = this.imports;
		return clazz
	}
}
