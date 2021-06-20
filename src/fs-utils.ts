import fs from "fs";


export function writeIfNotExists (path: string, content: string): boolean;
export function writeIfNotExists (path: string, content: string, ...conditions: boolean[]): boolean {
	if (fs.existsSync(path))
		return false;
	if (!!conditions && conditions.some(c => !c))
		return false;
	fs.writeFileSync(path, content);
	return true;
}
