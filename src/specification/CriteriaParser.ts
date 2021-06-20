import JavaClass from "../def/JavaClass";
import { uncapitalize } from "../utils";

export default class CriteriaParser extends JavaClass {

	constructor(domain: string, options: SpringStrapOptions) {
		super(domain, "specification", options);
	}

	get className(): string {
		return "CriteriaParser";
	}

	get code(): string {
		return `package ${this.package};

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class CriteriaParser {
	private static final Map<String, Operator> ops;
	static {
		Map<String, Operator> tempMap = new HashMap<>();
		tempMap.put("AND", Operator.AND);
		tempMap.put("OR", Operator.OR);
		tempMap.put("and", Operator.AND);
		tempMap.put("or", Operator.OR);

		ops = Collections.unmodifiableMap(tempMap);
	}

	private static final Pattern SpecCriteriaRegex =
			Pattern.compile("^([\\\\w.]+?)(" + String.join("|",
					SearchOperation.SIMPLE_OPERATION_SET) + ")(\\\\p{Punct}?)([\\\\w-:/.@#$^\\\\s+]+?)(\\\\p{Punct}?)$");

	public Deque<?> parse(String searchParam) {

		Deque<Object> output = new LinkedList<>();
		Deque<String> stack = new LinkedList<>();

		Arrays.stream(searchParam.split("\\\\s+")).forEach(token -> {
			if (ops.containsKey(token)) {
				while (!stack.isEmpty() && isHigherPrecedenceOperator(token, stack.peek()))
					output.push(stack.pop()
							.equalsIgnoreCase(SearchOperation.OR_OPERATOR) ? SearchOperation.OR_OPERATOR : SearchOperation.AND_OPERATOR);
				stack.push(token.equalsIgnoreCase(SearchOperation.OR_OPERATOR) ? SearchOperation.OR_OPERATOR : SearchOperation.AND_OPERATOR);
			} else if (token.equals(SearchOperation.LEFT_PARENTHESIS)) {
				stack.push(SearchOperation.LEFT_PARENTHESIS);
			} else if (token.equals(SearchOperation.RIGHT_PARENTHESIS)) {
				while (!stack.peek().equals(SearchOperation.LEFT_PARENTHESIS))
					output.push(stack.pop());
				stack.pop();
			} else {
				Matcher matcher = SpecCriteriaRegex.matcher(token);
				while (matcher.find()) {
					output.push(new SearchCriteria(matcher.group(1),
							matcher.group(2),
							matcher.group(3),
							matcher.group(4),
							matcher.group(5)));
				}
			}
		});

		while (!stack.isEmpty())
			output.push(stack.pop());

		return output;
	}

	private static boolean isHigherPrecedenceOperator(String currOp, String prevOp) {
		return (ops.containsKey(prevOp) && ops.get(prevOp).precedence >= ops.get(currOp).precedence);
	}

	private enum Operator {
		OR(1), AND(2);
		final int precedence;

		Operator(int p) {
			precedence = p;
		}
	}
}`;
	}

	get varName(): string {
		return uncapitalize(this.className);
	}

}
