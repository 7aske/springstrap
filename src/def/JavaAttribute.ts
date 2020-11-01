export default abstract class JavaAttribute {
	protected constructor() {
	}

	public abstract get code(): string;

	public abstract get className(): string;

	public abstract get varName(): string;

}
