import fs from 'node:fs'
import path from 'node:path'

export const findNearestNodeModules = (directory: string,
	importPath: string) => {
	let result = ''
	let found = false

	while (directory !== '' && !found) {
		const contents = fs.readdirSync(directory)

		contents.forEach((content) => {
			const contentPath = path.join(directory, content)

			if (isValidDirectory(contentPath) && content === 'node_modules') {
				// if node modules search folder for package
				const packagePath = path.join(directory, 'node_modules', importPath)

				if (isValidDirectory(packagePath)) {
					result = packagePath
					found = true
				}
			}
		})

		directory = directory.split('/').slice(0, -1).join('/')
	}

	return result
}

const isValidDirectory = (path: string) => {
	if (fs.existsSync(path)) {
		const stats = fs.statSync(path)
		return stats.isDirectory()
	}
	return false
}
