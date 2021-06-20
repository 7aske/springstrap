import JavaClass from "../def/JavaClass";
import { uncapitalize } from "../utils";

export default class SearchOperation extends JavaClass {
	constructor(domain: string, options: SpringStrapOptions) {
		super(domain, "specification", options);
	}

	get className(): string {
		return "SearchOperation";
	}

	get code(): string {
		return `package ${this.package};

public enum SearchOperation {
	EQUALITY, NEGATION, GREATER_THAN, LESS_THAN, LIKE, STARTS_WITH, ENDS_WITH, CONTAINS, IS_NULL, NOT_NULL;

	protected static final String[] SIMPLE_OPERATION_SET = {"=", "!", ">", "<", "~"};

	public static final String OR_PREDICATE_FLAG = "'";

	public static final String ZERO_OR_MORE_REGEX = "*";

	public static final String OR_OPERATOR = "OR";

	public static final String AND_OPERATOR = "AND";

	public static final String LEFT_PARENTHESIS = "(";

	public static final String RIGHT_PARENTHESIS = ")";

	public static SearchOperation getSimpleOperation(final char input) {
		if (SIMPLE_OPERATION_SET[0].charAt(0) == input)
			return EQUALITY;
		else if (SIMPLE_OPERATION_SET[1].charAt(0) == input)
			return NEGATION;
		else if (SIMPLE_OPERATION_SET[2].charAt(0) == input)
			return GREATER_THAN;
		else if (SIMPLE_OPERATION_SET[3].charAt(0) == input)
			return LESS_THAN;
		else if (SIMPLE_OPERATION_SET[4].charAt(0) == input)
			return LIKE;

		return null;
	}
}`;
	}

	get varName(): string {
		return uncapitalize(this.className);
	}

}
