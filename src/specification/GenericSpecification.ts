import JavaClass from "../def/JavaClass";
import { uncapitalize } from "../utils";

export default class GenericSpecification extends JavaClass {
	constructor(domain: string, options: SpringStrapOptions) {
		super(domain, "specification", options);
	}

	get className(): string {
		return "GenericSpecification";
	}

	get code(): string {
		return `package ${this.package};

import org.springframework.data.jpa.domain.Specification;

import javax.persistence.criteria.*;
import java.io.Serializable;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.Locale;
import java.util.TimeZone;

import static ${this.package}.SearchOperation.IS_NULL;
import static ${this.package}.SearchOperation.NOT_NULL;


public class GenericSpecification<T extends Serializable> implements Specification<T>, Serializable {
	private final transient SearchCriteria searchCriteria;
	private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd");
	private static final DateTimeFormatter DATE_TIME_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd/HH:mm:ss");
	
	public GenericSpecification(SearchCriteria searchCriteria) {
		this.searchCriteria = searchCriteria;
	}

	@Override
	public Predicate toPredicate(Root<T> root, CriteriaQuery<?> criteriaQuery, CriteriaBuilder builder) {
		String[] params = searchCriteria.getKey().split("\\\\.");

		From<T, ?> joinOrRoot = root;
		String base = params[0];

		for (int i = 0; i < params.length - 1; i++) {
			joinOrRoot = joinOrRoot.join(base);
			base = params[i + 1];
		}

		Object value = searchCriteria.getValue();
		if (value instanceof String && value.toString().equals("null")) {
			searchCriteria.setOperation(IS_NULL);
		}

		if (value instanceof String && value.toString().equals("notnull")) {
			searchCriteria.setOperation(NOT_NULL);
		}

		// ENUM
		if (joinOrRoot.get(base).getJavaType().isEnum()) {
			value = Enum.valueOf(root.<Enum>get(base).getJavaType(), ((String) value).toUpperCase(Locale.ROOT));
			return getPredicate(builder, joinOrRoot, base, value);
		}

		// LOCALDATETIME
		if (joinOrRoot.get(base).getJavaType().equals(LocalDateTime.class)) {
			LocalDateTime parsedDateTime = parseLocalDateTime((String) value);
			return getLocalDateTimePredicate(builder, joinOrRoot, base, parsedDateTime);

		}

		// LOCALDATE
		if (joinOrRoot.get(base).getJavaType().equals(LocalDate.class)) {
			LocalDate parsedDate = parseLocalDate((String) value);
			return getLocalDatePredicate(builder, joinOrRoot, base, parsedDate);
		}

		// DEFAULT
		return getPredicate(builder, joinOrRoot, base, value);
	}

	private Predicate getLocalDateTimePredicate(CriteriaBuilder builder, From<T, ?> root, String attr, LocalDateTime value) {
		switch (searchCriteria.getOperation()) {
			case GREATER_THAN:
				return builder.greaterThan(root.get(attr), value);
			case LESS_THAN:
				return builder.lessThan(root.get(attr), value);
			default:
				return getPredicate(builder, root, attr, value);
		}
	}

	private Predicate getLocalDatePredicate(CriteriaBuilder builder, From<T, ?> root, String attr, LocalDate value) {
		switch (searchCriteria.getOperation()) {
			case GREATER_THAN:
				return builder.greaterThan(root.get(attr), value);
			case LESS_THAN:
				return builder.lessThan(root.get(attr), value);
			default:
				return getPredicate(builder, root, attr, value);
		}
	}

	private Predicate getPredicate(CriteriaBuilder builder, From<T, ?> root, String attr, Object value) {
		switch (searchCriteria.getOperation()) {
			case GREATER_THAN:
				return builder.greaterThan(root.get(attr), value.toString());
			case LESS_THAN:
				return builder.lessThan(root.get(attr), value.toString());
			case NEGATION:
				return builder.notEqual(root.get(attr), value);
			case EQUALITY:
				return builder.equal(root.get(attr), value);
			case CONTAINS:
			case LIKE:
				return builder.like(builder.lower(root.get(attr)), "%" + value + "%");
			case STARTS_WITH:
				return builder.like(builder.lower(root.get(attr)), "%" + value);
			case ENDS_WITH:
				return builder.like(builder.lower(root.get(attr)), value + "%");
			case IS_NULL:
				return builder.isNull(root.get(attr));
			case NOT_NULL:
				return builder.isNotNull(root.get(attr));
			default:
				return null;
		}
	}

	private LocalDateTime parseLocalDateTime(String value) {
		try {
			return LocalDateTime.ofInstant(Instant.ofEpochMilli(Long.parseLong(value)), TimeZone.getDefault().toZoneId());
		} catch (NumberFormatException ignored) {
			// ignored
		}

		try {
			return LocalDateTime.parse(value, DATE_TIME_FORMAT);
		} catch (DateTimeParseException ignored) {
			// ignored
		}

		try {
			return LocalDateTime.parse(value);
		} catch (DateTimeParseException ignored) {
			// ignored
		}
		LocalDate localDate = parseLocalDate(value);
		if (localDate == null)
			return null;
		return LocalDateTime.of(localDate, LocalTime.MIN);
	}

	private LocalDate parseLocalDate(String value) {
		try {
			return LocalDate.ofInstant(Instant.ofEpochMilli(Long.parseLong(value)), TimeZone.getDefault().toZoneId());
		} catch (NumberFormatException ignored) {
			// ignored
		}

		try {
			return LocalDate.parse(value, DATE_FORMAT);
		} catch (DateTimeParseException ignored) {
			// ignored
		}

		try {
			return LocalDate.parse(value);
		} catch (DateTimeParseException ignored) {
			// ignored
		}

		return null;
	}
}
`;
	}

	get varName(): string {
		return uncapitalize(this.className);
	}

}
