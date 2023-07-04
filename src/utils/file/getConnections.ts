import type { Edge, File, Node } from '../types'
import { findNearestNodeModules, isNodeModule } from './getNodeModules'

export const getConnection = (match: RegExpExecArray, file: File, fileIndex: number, nodes: Node[], edges: Edge[]) => {
	const tempNodes: Node[] = []
	const tempEdges: Edge[] = []
	const importPath = match[1]
	const fullPath = getFullPath(file.path, importPath)

	if (isNodeModule(fullPath, nodes)) {
		tempNodes.push({
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
	) { return { nodes: tempNodes, edges: tempEdges } }

	tempEdges.push({
		id: `${fileIndex}-${connectionIndex}`,
		to: fileIndex,
		from: connectionIndex,
	})

	return { nodes: tempNodes, edges: tempEdges }
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
