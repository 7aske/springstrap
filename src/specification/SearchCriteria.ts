import JavaClass from "../def/JavaClass";
import { uncapitalize } from "../utils";

export default class SearchCriteria extends JavaClass {

	constructor(domain: string, options: SpringStrapOptions) {
		super(domain, "specification", options);
	}

	get className(): string {
		return "SearchCriteria";
	}

	get code(): string {
		return `package ${this.package};

import java.io.Serializable;

public class SearchCriteria implements Serializable {
	private String key;
	private SearchOperation operation;
	private transient Object value;
	private boolean orPredicate;

	public SearchCriteria(String key, SearchOperation operation, Object value, boolean orPredicate) {
		this.key = key;
		this.operation = operation;
		this.value = value;
		this.orPredicate = orPredicate;
	}
	
	public SearchCriteria(String key, String operation, String prefix, String value, String suffix) {
		SearchOperation op = SearchOperation.getSimpleOperation(operation.charAt(0));
		if (op != null) {
			if (op == SearchOperation.EQUALITY) { // the operation may be complex operation
				final boolean startWithAsterisk = prefix != null && prefix.contains(SearchOperation.ZERO_OR_MORE_REGEX);
				final boolean endWithAsterisk = suffix != null && suffix.contains(SearchOperation.ZERO_OR_MORE_REGEX);

				if (startWithAsterisk && endWithAsterisk) {
					op = SearchOperation.CONTAINS;
				} else if (startWithAsterisk) {
					op = SearchOperation.ENDS_WITH;
				} else if (endWithAsterisk) {
					op = SearchOperation.STARTS_WITH;
				}
			}
		}
		this.key = key;
		this.operation = op;
		this.value = value;
	}
	
	public String getKey() {
		return key;
	}

	public void setKey(String key) {
		this.key = key;
	}

	public SearchOperation getOperation() {
		return operation;
	}

	public void setOperation(SearchOperation operation) {
		this.operation = operation;
	}

	public Object getValue() {
		return value;
	}

	public void setValue(Object value) {
		this.value = value;
	}

	public boolean isOrPredicate() {
		return orPredicate;
	}

	public void setOrPredicate(boolean orPredicate) {
		this.orPredicate = orPredicate;
	}
	
}`;
	}

	get varName(): string {
		return uncapitalize(this.className);
	}

}
