import * as vscode from 'vscode'

import type { Edge, File, Node } from './utils/types'

import { getConnection } from './utils/file/getConnections'

export interface Data {
  message: File[]
}

export interface PluginData {
	name: string
	regex: RegExp[]
	getConnection: (match: RegExpExecArray, file: File, fileIndex: number, nodes: Node[], edges: Edge[]) => { nodes: Node[]; edges: Edge[] }
}

export const activate = async (context: vscode.ExtensionContext) => {
	// eslint-disable-next-line no-console -- For Testing Purposes
	console.log('CodeGraphy - JS Plugin activated!')

	await vscode.commands.executeCommand(
		'codegraphy.registerPlugin',
		{
			name: 'JSPlugin',
			regex: [
				/import\s+(?:\*+\s+as\s+[\w*]+|(?:type\s+(?:(?:[\w*]+\s*,\s*)?\{[^{}]*\})+|(?:(?:[\w*]+\s*,\s*)?\{[^{}]*\}|[\w*]+)))\s*from\s*['"]([^'"]+)['"]/g,
				/require\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
				/.*CodeGraphy\s+connect:\s+(['"])([^'"]+)\1/g,
			],
			getConnection,
		},
	)
}
