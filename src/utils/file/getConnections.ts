import fs from 'node:fs'
import type { Edge, File, Node } from '../types'
import { findNearestNodeModules, isNodeModule } from './getNodeModules'

export const getConnections = (files: File[]) => {
	const nodes: Node[] = []
	const edges: Edge[] = []

	files.forEach((file, fileIndex) => {
		nodes.push({
			id: fileIndex,
			label: file.path.split('/').pop() || '',
			path: file.path,
			type: 'File',
		})
	})

	files.forEach((file, fileIndex) => {
		const fileContents = fs.readFileSync(file.path, 'utf-8')

		const importRegex
      = /(?:import\s+(?:\*+\s+as\s+[\w*]+|(?:type\s+(?:(?:[\w*]+\s*,\s*)?\{[^{}]*\})+|(?:(?:[\w*]+\s*,\s*)?\{[^{}]*\}|[\w*]+)))\s*from\s*['"]([^'"]+)['"]|require\s*\(\s*['"]([^'"]+)['"]\s*\)|.*CodeGraphy\s+connect:\s+(['"])([^'"]+)\3)/g

		let match

		do {
			match = importRegex.exec(fileContents)

			if (match === null) {
				break
			}

			// If it's an import statement, the path is captured in the second group.
			// If it's a require statement, the path is captured in the third group.
			// If it's a custom "CodeGraphy connect" comment, the path is captured in the fourth group.
			const importPath = match[1] || match[2] || match[4]
			const fullPath = getFullPath(file.path, importPath)

			if (isNodeModule(fullPath, nodes)) {
				nodes.push({
					id: nodes.length,
					label: fullPath.split('/').pop() || '',
					path: fullPath,
					type: 'Package',
				})
			}

			const connectionIndex = findConnectionIndex(nodes, fullPath)

			// If the connection already exists or no connection found, skip it
			if (
				connectionIndex === -1
        || edges.find(
        	connection => connection.id === `${fileIndex}-${connectionIndex}`,
        )
			) { continue }

			edges.push({
				id: `${fileIndex}-${connectionIndex}`,
				to: fileIndex,
				from: connectionIndex,
			})
		} while (match !== null)
	})

	return { nodes, edges }
}

// Get full path of import
const getFullPath = (filePath: string, importPath: string) => {
	const directory = filePath.substring(1).split('/')
	const importPathArr = importPath.split('/')

	// walk back relative path
	if (importPath.startsWith('.')) {
		if (importPath.startsWith('..')) {
			directory.pop()
		}

		importPathArr.forEach((element) => {
			if (element === '.' || element === '..') {
				directory.pop()
			}
			else { directory.push(element) }
		})
		return `/${directory.join('/')}`
	}
	// find nearest node_modules
	else {
		directory.pop()
		return findNearestNodeModules(`/${directory.join('/')}` ?? '', importPath)
	}
}

// Find index of connection
const findConnectionIndex = (nodes: Node[], fullPath: string) => {
	let result = -1

	nodes.forEach((node, index) => {
		const nodePath = node.path.split('.')[0]

		if (nodePath === fullPath) {
			result = index
		}
	})

	return result
}
