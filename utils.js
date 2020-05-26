
const nameConv = (name, isClass) => {
	for (let i = 0; i < name.length; i++) {
		if (name[i] === "_") {
			name = name.substring(0, i) + name.charAt(i + 1).toUpperCase() + name.substring(i + 2);

		}
	}
	if (isClass) {
		return name.charAt(0).toUpperCase() + name.substring(1);
	} else {
		return name;
	}
};

module.exports = {nameConv};
